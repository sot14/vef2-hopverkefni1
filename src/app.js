import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
<<<<<<< HEAD
import fns from 'date-fns';

import { router as adminRouter } from './admin.js';
import { strat, serializeUser, deserializeUser } from './users.js';
import {router as regRouter } from './registered.js';
import {router as TVrouter} from './tv.js';
import {router as indexRouter} from './index.js';
import {router as imageRouter} from './images.js';
import {series} from './tv.js';
// Library middleware fyrir express
import passport from 'passport';
import passportLocal from 'passport-local';
import session from 'express-session';

const { format } = fns;
const { Strategy } = passportLocal;
const sessionSecret = "Leyndarmál"
=======
>>>>>>> 527b1a70a326c1bda7b0a588f78be6ad5343a4bd

import { router as indexRoute } from './index.js'
import { app as auth } from '../authentication/registered.js';

import { requireEnv } from './utils.js'


requireEnv(['DATABASE_URL', 'JWT_SECRET']);
//requireEnv(['DATABASE_URL', 'CLOUDINARY_URL', 'JWT_SECRET']);
dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

const app = express();

// Sér um að req.body innihaldi gögn úr formi
app.use(express.urlencoded({ extended: true }));

app.use(auth);
app.use('/', indexRoute);

const path = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(path, '../public')));

function notFoundHandler(req, res, next) { // eslint-disable-line
  console.warn('Not found', req.originalUrl);
  res.status(404).json({ error: 'Not found' });
}

function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid json' });
  }

<<<<<<< HEAD
  return date;
};

// app.get('/', (req, res) => {
//   res.render('index',{series});
// });

app.get('/genres', (req, res) => {
  res.render('genres');
});


//app.use('/', registrationRouter);
app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/users', regRouter);
app.use('/tv', TVrouter);


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
=======
  return res.status(500).json({ error: 'Internal server error' });
>>>>>>> 527b1a70a326c1bda7b0a588f78be6ad5343a4bd
}

app.use(notFoundHandler);
app.use(errorHandler);

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
