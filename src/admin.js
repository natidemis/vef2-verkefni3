import express from 'express';
import bcrypt from 'bcrypt';
import { catchErrors, renderPage } from './registration.js';
import { query } from './db.js';

export const routerAdmin = express.Router();

async function loginPage(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/admin');
  }
  let message = '';
  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }
  return res.render('login', {
    title: 'Innskráning',
    message,
  });
}

const records = [
  {
    id: 1,
    username: 'admin',

    // 123
    password: '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii',
  },
];

export async function comparePasswords(password, user) {
  const ok = await bcrypt.compare(password, user.password);

  if (ok) {
    return user;
  }

  return false;
}

export async function findByUsername(username) {
  const found = records.find((u) => u.username === username);

  if (found) {
    return found;
  }

  return null;
}

export async function strat(username, password, done) {
  try {
    const user = await findByUsername(username);

    if (!user) {
      return done(null, false);
    }

    // Verður annað hvort notanda hlutur ef lykilorð rétt, eða false
    const result = await comparePasswords(password, user);
    return done(null, result);
  } catch (err) {
    console.error(err);
    return done(err);
  }
}

export async function findById(id) {
  const found = records.find((u) => u.id === id);

  if (found) {
    return found;
  }

  return null;
}

export function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/admin/login');
}

async function admin(req, res) {
  renderPage(req, res, true);
}

export async function deleteItem(req, res) {
  const q = 'DELETE FROM signatures WHERE id = $1';
  await query(q, [req.body.id]);
  return res.redirect('/admin');
}

routerAdmin.get('/admin/login', catchErrors(loginPage));
routerAdmin.get('/admin', ensureLoggedIn, catchErrors(admin));
routerAdmin.post('/delete-btn', ensureLoggedIn, deleteItem);
