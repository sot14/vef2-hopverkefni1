import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import passportjwt from 'passport-jwt';
import { catchErrors } from '../src/utils.js';
import * as users from './users.js';

const { Strategy } = passportjwt;
const { ExtractJwt } = passportjwt;

import dotenv from 'dotenv';
dotenv.config();

import {
  isNotEmptyString,
  toPositiveNumberOrDefault,
} from './validations.js';

import {
  findById,
  findByUsername,
  comparePasswords,
  validateUser,
  createUser,
} from './users.js';


const {
  JWT_SECRET: jwtSecret,
  JWT_TOKEN_LIFETIME: tokenLifetimeFromEnv,
} = process.env;

const defaultTokenLifetime = 60 * 60 * 24 * 7;

const tokenLifetime = toPositiveNumberOrDefault(
  tokenLifetimeFromEnv,
  defaultTokenLifetime,
);

console.log("mjamja", process.env.JWT_SECRET)

if (!jwtSecret) {
  console.error('Vantar .env gildi');
  process.exit(1);
}

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};


async function strat(data, next) {
  const user = await findById(data.id);

  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
}

export const app = express();

passport.use(new Strategy(jwtOptions, strat));
app.use(passport.initialize());
app.use(express.json());

passport.use(new Strategy(jwtOptions, strat));
app.use(passport.initialize());

export function requireAuth(req, res, next) {
  return passport.authenticate('jwt', { session: false },
    (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        const error = info && info.name === 'TokenExpiredError'
          ? 'expired token' : 'invalid token';

        return res.status(401).json({ error });
      }
      console.log("userrrrrrr: ",user)
      req.user = user;
      return next();
    })
    (req, res, next);
}

export function checkUserIsAdmin(req, res, next) {
  if (req.user && req.user.admin) {
    return next();
  }

  return res.status(403).json({ error: 'Forbidden' });
}

async function registerRoute(req, res) {
  const { username, password, email } = req.body;

  const validationMessage = await validateUser({ username, password, email });

  if (validationMessage.length > 0) {
    return res.status(400).json({ errors: validationMessage });
  }

  const result = await createUser(username, password, email);

  delete result.password;

  return res.status(201).json(result);
}

async function loginRoute(req, res) {
  const { username, password } = req.body;

  const validations = [];

  if (!isNotEmptyString(username)) {
    validations.push({
      field: 'username',
      error: 'Username is required',
    });
  }

  if (!isNotEmptyString(password)) {
    validations.push({
      field: 'password',
      error: 'Password is required',
    });
  }

  if (validations.length > 0) {
    return res.status(401).json(validations);
  }

  const user = await findByUsername(username);

  if (!user) {
    return res.status(401).json({ error: 'No such user' });
  }

  const passwordIsCorrect = await comparePasswords(password, user.password);

  if (passwordIsCorrect) {
    const payload = { id: user.id };
    const tokenOptions = { expiresIn: Number(tokenLifetime) };
    const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);

    delete user.password;

    return res.json({
      user,
      token,
      expiresIn: Number(tokenLifetime),
    });
  }

  return res.status(401).json({ error: 'Invalid password' });
}

app.post('/users/register', catchErrors(registerRoute));
app.post('/users/login', catchErrors(loginRoute));