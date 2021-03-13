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
 
  res.render('tv');
}

router.get('/', catchErrors(index));