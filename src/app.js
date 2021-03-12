import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import fns from 'date-fns'

import { router as adminRouter } from './admin.js';
import { strat, serializeUser, deserializeUser } from './users.js';
import {router as regRouter } from './registered.js'

// Library middleware fyrir express
import passport from 'passport';
import passportLocal from 'passport-local';
import session from 'express-session'

const { format } = fns;
const { Strategy } = passportLocal;
const sessionSecret = "Leyndarmál"

dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

if (!sessionSecret) {
  console.error('Add SESSION_SECRET to .env');
  process.exit(1);
}

const app = express();

// Sér um að req.body innihaldi gögn úr formi
app.use(express.urlencoded({ extended: true }));

app.use(session({
  name: 'counter.sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  maxAge: 20 * 1000, // 20 sek 
}));

passport.use(new Strategy(strat));
passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);

// Látum express nota passport með session
app.use(passport.initialize());
app.use(passport.session());

const path = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(path, '../public')));

app.set('views', join(path, '../views'));
app.set('view engine', 'ejs');

/**
 * Hjálparfall til að athuga hvort reitur sé gildur eða ekki.
 *
 * @param {string} field Middleware sem grípa á villur fyrir
 * @param {array} errors Fylki af villum frá express-validator pakkanum
 * @returns {boolean} `true` ef `field` er í `errors`, `false` annars
 */
function isInvalid(field, errors = []) {
  // Boolean skilar `true` ef gildi er truthy (eitthvað fannst)
  // eða `false` ef gildi er falsy (ekkert fannst: null)
  return Boolean(errors.find((i) => i && i.param === field));
}

app.locals.isInvalid = isInvalid;

app.use((req, res, next) => {
  res.locals.user = req.isAuthenticated() ? req.user : null;

  next();
});

// Gott að skilgreina eitthvað svona til að gera user hlut aðgengilegan í
// viewum ef við erum að nota þannig
app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  next();
});

app.post(
  '/login-admin', passport.authenticate('local', {
    failureMessage: 'Notandi eða lykilorð vitlaust.',
    failureRedirect: '/admin/admin-login',
  }),
  (req, res) => res.redirect('/admin')
);
app.post(
  '/login-user', passport.authenticate('local', {
    failureMessage: 'Notandi eða lykilorð vitlaust.',
    failureRedirect: '/user/user-login',
  }),
  (req, res) => res.redirect('/user')
);

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.locals.formatDate = (str) => {
  let date = '';

  try {
    date = format(str || '', 'dd.MM.yyyy');
  } catch {
    return '';
  }

  return date;
};
app.get('/', (req, res) => {
  res.render('index');
});
//app.use('/', registrationRouter);
app.use('/admin', adminRouter);
app.use('/user', regRouter);

/**
 * Middleware sem sér um 404 villur.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @param {function} next Næsta middleware
 */
// eslint-disable-next-line no-unused-vars
function notFoundHandler(req, res, next) {
  const title = 'Síða fannst ekki';
  const text = ''
  res.status(404).render('error', { title, text });
}

/**
 * Middleware sem sér um villumeðhöndlun.
 *
 * @param {object} err Villa sem kom upp
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @param {function} next Næsta middleware
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  const title = 'Villa kom upp';
  const text = '';
  res.status(500).render('error', { title, text });
}

app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  next();
});

app.use(notFoundHandler);
app.use(errorHandler);

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});