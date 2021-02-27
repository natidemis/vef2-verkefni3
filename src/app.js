import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import passport from 'passport';
import { Strategy } from 'passport-local';
import { routerAdmin, strat, findById } from './admin.js';
import { router } from './registration.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

dotenv.config();

export const {
  PORT: port = 3000 || process.env.PORT,
} = process.env;

const app = express();

const sessionSecret = 'leyndarmál';

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  maxAge: 10 * 60 * 1000, // 10 min
}));

app.set('views', path.join(dirname, 'views'));
app.set('view engine', 'ejs');

passport.use(new Strategy(strat));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());
app.use('/', router, routerAdmin);

app.post(
  '/admin/post',
  // Þetta notar strat að ofan til að skrá notanda inn
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/admin/login',
  }),
  // Ef við komumst hingað var notandi skráður inn, senda á /admin
  (req, res) => {
    res.redirect('/admin');
  },
);

app.get('/logout', (req, res) => {
  // logout hendir session cookie og session
  req.logout();
  res.redirect('/');
});

export function pagingLinks(offset, limit, rows, admin) {
  const result = {
    links: {
      self: {
        href: admin ? `http://localhost:${port}/admin?offset=${offset}&limit=${limit}` : `http://localhost:${port}/?offset=${offset}&limit=${limit}`,
      },
    },
    items: rows,
  };

  if (offset > 0) {
    result.links.prev = {
      href: admin ? `http://localhost:${port}/admin?offset=${offset}&limit=${limit}` : `http://localhost:${port}/?offset=${offset}&limit=${limit}`,
    };
  }

  if (rows.length <= limit) {
    result.links.next = {
      href: admin ? `http://localhost:${port}/admin?offset=${Number(offset) + limit}&limit=${limit}` : `http://localhost:${port}/?offset=${Number(offset) + limit}&limit=${limit}`,
    };
  }

  return result;
}

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
