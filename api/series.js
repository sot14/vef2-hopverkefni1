import xss from 'xss';
import bcrypt from 'bcrypt';
import { addPageMetadata, catchErrors } from '../src/utils.js';
import { query, pagedQuery } from '../src/db.js';
import express from 'express';
import { requireAuth, checkUserIsAdmin } from '../authentication/registered.js';
import { listSeason, listSeasons, router as seasonRouter } from './seasons.js';

const requireAdmin = [
  requireAuth,
  checkUserIsAdmin,
];

export const router = express.Router();
let currentSerieID;

import {
  isInt,
  isEmpty,
  isNotEmptyString,
  isString,
} from '../authentication/validations.js'

// Birtir upplýsingar um allar sjónvarpsþáttaseríur

export async function listSeries(req, res) {
  const { offset = 0, limit = 10 } = req.query;
  const series = await pagedQuery(
    'SELECT * FROM series ORDER BY id',
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
// validation fyrir date
function isDate(date) {
  var temp = date.split('/');
  var d = new Date(temp[2] + '/' + temp[0] + '/' + temp[1]);
  return (d && (d.getMonth() + 1) == temp[0] && d.getDate() == Number(temp[1]) && d.getFullYear() == Number(temp[2]));
}

// Valideitar gögn þegar nýjum sjónvarpsþætti er bætt við. 
async function validateSerie({ name, aired, inProduction, tagline, thumbnail, description, language, network, url } = {},
  patching = false,
) {
  const validation = [];


  if (!patching || name || isEmpty(name)) {
    if (!isNotEmptyString(name, { min: 1, max: 255 })) {
      validation.push({
        field: 'name',
        error: 'Name must be between 1 and 255 characters'
      });
    }
  }

  if (!isDate(aired)) {
    validation.push({
      field: 'aired',
      error: 'Input must be a date'
    })
  }

  if (inProduction !== 'false' || 'true') {
    validation.push({
      field: 'inProduction',
      error: 'Input must be a boolean (true/false)'
    })
  }

  if (!isString(tagline)) {
    validation.push({
      field: 'tagline',
      error: 'Input must be a string'
    })
  }

  if (!isNotEmptyString(thumbnail, { min: 1, max: 255 })) {
    validation.push({
      field: 'thumbnail',
      error: 'Thumbnail path must be between 1 and 255 characters'
    });
  }

  if (!isString(description)) {
    validation.push({
      field: 'description',
      error: 'Input must be a string'
    })
  }

  if (!isString(language)) {
    validation.push({
      field: 'language',
      error: 'Input must be a string'
    })
  }

  if (!isString(network)) {
    validation.push({
      field: 'network',
      error: 'Input must be a string'
    })
  }

  if (!isString(url)) {
    validation.push({
      field: 'url',
      error: 'Input must be a string'
    })
  }
  return validation;
}

// Setur nýjan sjónvarpsþátt inn í gagnagrunn ef allt er í lagi eftir validation,
export async function createSeries(req, res, next) {

  const { name, aired, inProduction, tagline, thumbnail, description, language, network, url } = req.body;
  const serie = { name, aired, inProduction, tagline, thumbnail, description, language, network, url };
  const validations = await validateSerie(serie);

  if (validations.length > 0) {
    return res.status(400).json({
      errors: validations,
    });
  }

  const q = `
  INSERT INTO series(name, aired, inProduction, tagline, thumbnail, description, language, network, url) 
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`;

  const values = [
    xss(serie.name),
    xss(serie.aired),
    xss(serie.inProduction),
    xss(serie.tagline),
    xss(serie.thumbnail),
    xss(serie.description),
    xss(serie.language),
    xss(serie.network),
    xss(serie.url),
  ];
  const result = await query(q, values);
  return res.json(result.rows[0]);
}

// Birtir upplýsingar um stakan sjónvarpsþátt
export async function listSerie(req, res) {
  const { id } = req.params;
  currentSerieID = id;
  console.log('serie req params', req.params);
  const serie = await findSerie(id);
  const genre = await findGenre(id);
  const seasonInfo = await findSeasonInfo(id)

  if (!serie) {
    return res.status(404).json({ error: 'Serie not found' });
  }
  let result = []
  result.push(serie)
  result.push(genre)
  result.push(seasonInfo)
  return res.json(result);
}

// Finnur sjónvarpsþáttaseríu út frá id 
export async function findSerie(id) {
  if (!isInt(id)) {
    return null;
  }

  const episode = await query(
    `SELECT
    *
    FROM
      series
    WHERE id = $1`,
    [id],
  );

  return episode.rows[0]
}

async function findGenre(id) {
  if (!isInt(id)) {
    return null;
  }
  const genre = await query(
    `SELECT
    *
    FROM
      series_genres
    WHERE serie = $1`,
    [id],
  );
  return genre.rows
}

export async function findSeasonInfo(id) {
  if (!isInt(id)) {
    return null;
  }

  const season = await query(
    `SELECT
    *
    FROM
      season
    WHERE fk_serie = $1`,
    [id],
  );
  return season.rows;
}

router.get('/', catchErrors(listSeries));
router.get('/:id', catchErrors(listSerie));
router.get('/:id/season', catchErrors(listSeasons));
router.get('/:serieNumber/season/:seasonNumber', catchErrors(listSeason));
router.post('/',requireAdmin,catchErrors(createSeries));
