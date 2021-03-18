    const xss = require('xss');
    import { addPageMetadata } from './utils.js';
    const { query, pagedQuery } = require('../utils/db');
    /*import {
       isInt,
       isEmpty,
       isNotEmptyString,
       isString,
       toPositiveNumberOrDefault,
       lengthValidationError
     } from '.,/authentication/validations.js'*/
     
    // plokka series úr tv.js til að gera birt undir /tv/:id, /tv/:id/rate, /tv/:id/state
    export async function listCategories(req, res) {
       const { offset = 0, limit = 10 } = req.query;
        const series = await pagedQuery(
         'SELECT id, name FROM series ORDER BY airedate DESC',
         [],
         { offset, limit },
       );
        const seriesWithPage = addPageMetadata(
           series,
         req.path,
         { offset, limit, length: series.items.length },
       );
        return res.json(seriesWithPage);
     }
    
    