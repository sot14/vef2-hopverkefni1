import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';

import { router as indexRoute } from './index.js';
import { router as imageRouter } from './images.js';
import { app as auth } from '../authentication/registered.js';

import { requireEnv } from './utils.js';


requireEnv(['DATABASE_URL', 'CLOUDINARY_URL', 'JWT_SECRET']);
dotenv.config();


const {
  PORT: port = process.env.port || 3000,
  HOST: host = process.env.host || '127.0.0.1'
} = process.env;

const app = express();

function cors(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  next();
  }
// Sér um að req.body innihaldi gögn úr formi
app.use(express.urlencoded({ extended: true }));
app.use(cors)
app.use(auth);
app.use('/', indexRoute);
app.use(cors);

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

  return res.status(500).json({ error: 'Internal server error' });
}

app.use(notFoundHandler);
app.use(errorHandler);

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
