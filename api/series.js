import xss from 'xss';
import bcrypt from 'bcrypt';
import { addPageMetadata, catchErrors } from '../src/utils.js';
import { query, pagedQuery } from '../src/db.js';
import express from 'express';
import {listSeason, listSeasons, router as seasonRouter} from './seasons.js';

export const router = express.Router();
let currentSerieID;

import {
  isInt,
  isEmpty,
  isNotEmptyString,
  isString,
  toPositiveNumberOrDefault,
  lengthValidationError
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
// Valideitar gögn þegar nýjum sjónvarpsþætti er bætt við. 
/*
async function validateSerie({ name, thumbnail } = {},
  patching = false,
  id = null,
) {
  const validation = [];

  if (!patching || name || isEmpty(name)) {
    if (!isNotEmptyString(name, { min: 1, max: 255 })) {
      validation.push({
        field: 'name',
        error: lengthValidationError(title, 1, 255),
      });
    }
    const titleExists = await query(
      'SELECT id FROM series WHERE name = $1',
      [name],
    );

    if (titleExists.rows.length > 0) {
      const current = titleExists.rows[0].id;

      if (patching && id && current === toPositiveNumberOrDefault(id, 0)) {
        // we can patch our own title
      } else {
        const error = `Name already exists in series with id ${current}.`;
        validation.push({
          field: 'name',
          error,
        });
      }
    }
  }

  const cat = await query(
    'SELECT id FROM series WHERE title = $1',
    [title],
  );

  if (cat.rows.length > 0) {
    const currentCat = cat.rows[0].id;
    const error = `Serie already exists in series with id ${currentCat}.`;
    return [{ field: 'name', error }];
  }

  return [];
}

*/

// Setur nýjan sjónvarpsþátt inn í gagnagrunn ef allt er í lagi eftir validation,

export async function createSeries(req, res, next) {
  const { name, aired, inProduction, tagline, thumbnail, description, language, network, url } = req.body;
  const serie = { name, aired, inProduction, tagline, thumbnail, description, language, network, url };
  //const validations = await validateSerie(serie);

  if (serie.length > 0) {
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

  if (!serie) {
    return res.status(404).json({ error: 'Serie not found' });
  }
  let result =[]
  result.push(serie)
  result.push(genre)
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

  if (episode.rows.length !== 1) {
    return null;
  }

  return episode.rows[0]
}

async function findGenre(id){
  if (!isInt(id)) {
    return null;
  }
  const genre = await query(
    `SELECT
    name
    FROM
      genres
    WHERE id = $1`,
    [id],
  );
  if (genre.rows.length !== 1) {
    return null;
  }
  return genre.rows[0]
}



async function findSerieGenresById(serieID) {
  if (!isInt(serieID)) {
    return null;
  }

  const serieGenres = await query(
    `SELECT
      genre
    FROM
      serie_genre
    WHERE serie = $1
  `,
    [serieID],
  );

  const genres = await query('SELECT * FROM genres');
  const values = [];

  serieGenres.rows.forEach((id) => {
    genres.rows.forEach((row) => {
      if (row.id === id.genre) {
        values.push(row);
      }
    });
  });

  return values;
}

router.get('/', catchErrors(listSeries));
router.get('/:id', catchErrors(listSerie));
router.get('/:id/season', catchErrors(listSeasons));
router.get('/:serieNumber/season/:seasonNumber', catchErrors(listSeason))