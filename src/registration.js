// const express = require('express');
// const { body, validationResult } = require('express-validator');
import express from 'express';
import { body, validationResult } from 'express-validator';
import xss from 'xss';
import { fetchAll, insertIntoTable } from './db.js';
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

async function register(req, res) {
  try {
    const data = await fetchAll();
    res.render('index', {
      querySuccess,
      data,
      concat: (item) => JSON.stringify(item).substring(1, 11),
      errorId: [],
      errorMessages: [],
    });
    querySuccess = [false, ''];
  } catch (e) {
    console.error('Villa kom upp: ', e);
  }
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
    anonymous: anonymous !== 'on',
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
function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

router.get('/', register);
router.post('/post', formValidation, catchErrors(registeration));

// module.exports = router;
