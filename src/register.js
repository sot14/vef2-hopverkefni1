import express from 'express';
import { catchErrors } from './utils.js';

export const router = express.Router();

/**
 * Higher-order fall sem umlykur async middleware með villumeðhöndlun.
 *
 * @param {function} fn Middleware sem grípa á villur fyrir
 * @returns {function} Middleware með villumeðhöndlun
 */

const index = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/admin/login-admin')
  }
  res.render('register');
}

const login = async (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/register')
  }
  let message = '';

  // Athugum hvort einhver skilaboð séu til í session, ef svo er birtum þau
  // og hreinsum skilaboð
  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }
  res.render('register', { message})
}

router.get('/register', catchErrors(login));
router.get('/', catchErrors(index));