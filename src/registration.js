import express from 'express';
import { body, validationResult } from 'express-validator';
import xss from 'xss';
import {
  fetchAll, insertIntoTable, query, select,
} from './db.js';
import { pagingLinks } from './app.js';

// TODO skráningar virkni

export const router = express.Router();
let querySuccess = [false, ''];
const formValidation = [
  body('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt')
    .trim()
    .escape(),
  body('nationalId')
    .isLength({ min: 1 })
    .withMessage('Kennitala má ekki vera tómt')
    .blacklist('-'),
  body('nationalId')
    .matches(new RegExp('^[0-9]{6}-?[0-9]{4}$'))
    .withMessage('Kennitala verður að vera á formi 000000-0000 eða 0000000000'),
];

export async function renderPage(req, res, admin) {
  try {
    const numOfSignatures = await query('SELECT COUNT(*) FROM signatures');
    let { offset = 0, limit = 50 } = req.query;
    offset = Number(offset);
    limit = Number(limit);

    const rows = await select(offset, limit);

    const result = pagingLinks(offset, limit, rows, admin);

    res.locals = {
      title: 'Undirskriftarlisti',
      querySuccess,
      data: result.items,
      concat: (item) => JSON.stringify(item).substring(1, 11),
      errorId: [],
      errorMessages: [],
      numOfSignatures: numOfSignatures.rows[0].count,
      page_num: [offset / limit + 1, Math.floor(numOfSignatures.rows[0].count / limit) + 1],
      links: result.links,
      admin,
    };
    res.render('index');
    querySuccess = [false, ''];
  } catch (e) {
    console.error('Villa að sækja gögn til að birta: ', e);
  }
}

async function signatures(req, res) {
  renderPage(req, res, false);
}

async function registeration(req, res) {
  const {
    name = '',
    nationalId = '',
    comment = '',
    anonymous = '',
  } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((i) => i.msg);
    const errorId = errors.array().map((x) => x.param);
    return res.render('index', {
      querySuccess: [false, ''], data: await fetchAll(), concat: (item) => JSON.stringify(item).substring(1, 11), errorId, errorMessages,
    });
  }
  const data = {
    name: xss(name),
    nationalId: xss(nationalId),
    comment: xss(comment),
    anonymous: !(anonymous === 'on'), // ekki birta ef "on"
    date: new Date(),
  };
  try {
    const q = await insertIntoTable(data);
    querySuccess = q.rowCount === 0 ? [true, 'duplicate'] : [true, 'added'];
  } catch (e) {
    console.error(e);
  }
  return res.redirect('/');
}

/**
 * Higher-order fall sem umlykur async middleware með villumeðhöndlun.
 *
 * @param {function} fn Middleware sem grípa á villur fyrir
 * @returns {function} Middleware með villumeðhöndlun
 */
export function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

router.get('/', catchErrors(signatures));
router.post('/post', formValidation, catchErrors(registeration));
