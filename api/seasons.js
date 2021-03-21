import { pagedQuery, query } from '../src/db.js';
import { addPageMetadata, catchErrors } from '../src/utils.js';
import express from 'express';
import { isInt } from '../authentication/validations.js';
import { findSeasonInfo } from './series.js';

export const router = express.Router();

export async function listSeasons(req, res) {
  const { offset = 0, limit = 10 } = req.query;
  const { id } = req.params;
  console.log("req params", id);
  console.log(req.path);

  const seasons = await pagedQuery(
    `SELECT id, name, seasonno, aired, overview, seasonposter
            FROM season
            WHERE FK_serie = $1
            ORDER BY seasonNo`,
    [id],
    { offset, limit },
  );
  console.log(seasons);
  const seasonsWithPage = addPageMetadata(
    seasons,
    req.path,
    { offset, limit, length: seasons.items.length },
  );
  return res.json(seasonsWithPage);
}

// Birtir upplýsingar um staka seríu
export async function listSeason(req, res) {
  const { serieNumber, seasonNumber } = req.params;
  console.log(serieNumber, seasonNumber);
  const { offset = 0, limit = 10 } = req.query; // TODO: þetta á ekki að vera paged því það er bara eitt season

  const season = await query(
    `SELECT * FROM season
      WHERE seasonNo = $1
      AND FK_serie = $2`,
    [seasonNumber, serieNumber]
  );
  console.log("found season", season.rows[0]);
  const seasonItems = season.rows[0];

  if (!season) {
    return res.status(404).json({ error: 'Season not found' });
  }

  const episodes = await pagedQuery(
    `SELECT * FROM episodes
            WHERE seasonNumber = $1
            AND FK_serie = $2`,
    [seasonNumber, serieNumber],
    { offset, limit }
  );

  console.log("found episodes", episodes);

  if (!episodes) {
    return res.status(404).json({ error: 'Episodes of season not found' });
  }

  return res.json({ seasonItems, episodes });
}

async function validateSeason({ name, seasonNo, aired, overview, seasonPoster, serieName } = {},
  id = null,
) {
  const validation = [];

  if (name || isEmpty(name)) {
    if (!isNotEmptyString(name, { min: 1, max: 256 })) {
      validation.push({
        field: 'name',
        error: lengthValidationError(name, 1, 256),
      });
    }

    // check if season name exists in season
    const seasonExists = await query(
      'SELECT id FROM season WHERE name = $1 AND FK_serie=$2 AND seasonNumber=$3',
      [name, serieNumber, seasonNumber],
    );

    if (seasonExists.rows.length > 0) {
      const current = seasonExists.rows[0].id;

      if (id && current === toPositiveNumberOrDefault(id, 0)) {
        // we can patch our own name
      } else {
        const error = `season name already exists in season with id ${current}.`;
        validation.push({
          field: 'name',
          error,
        });
      }
    }
  }
  // validate season number
  if (seasonNo || isEmpty(seasonNo)) {
    if (toPositiveNumberOrDefault(episodeNo, 0) <= 0) {
      validation.push({
        field: 'seasonNo',
        error: 'Season number must be a positive integer',
      });
    }
  }
  if (aired) {
    if (!isDate(aired)) {
      validation.push({
        field: 'aired',
        error: 'Air date must be in format yyyy-mm-dd'
      })
    }
  }
  if (overview) {
    if (!isString(overview)) {
      validation.push({
        field: 'overview',
        error: 'Overview must be in a string format',
      });
    }
  }
  if (seasonPoster) {
    if (!isNotEmptyString(seasonPoster, { min: 1, max: 256 })) {
      validation.push({
        field: 'seasonPoster',
        error: 'seasonPoster path must be between 1 and 256 characters'
      });
    }
  }
  if (serieName) {
    if (!isString(serieName)) {
      validation.push({
        field: 'serieName',
        error: 'Input must be a string'
      })
    }
  }
  return validation;
}

export async function createSeason(req, res, next) {
  const { serieNumber } = req.params;
  const serie = await query(
    `SELECT * FROM serie
      WHERE id=$1`,
    [serieNumber]);
  if (!season) {
    return res.status(404).json({ error: 'Serie not found. Not possible to create a season in a non-existing serie.' })
  }

  const { name, seasonNo, aired, overview, seasonPoster, serieName } = req.body;
  const season = { name, seasonNo, aired, overview, seasonPoster, serieName };
  const validations = await validateSeason(season);

  if (validations.length > 0) {
    return res.status(400).json({
      errors: validations,
    });
  }

  const q = `
  INSERT INTO season(name, seasonNo, aired, overview, seasonPoster, serieName) 
  VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`;

  const values = [
    xss(serie.name),
    xss(serie.seasonNo),
    xss(serie.aired),
    xss(serie.overview),
    xss(serie.seasonPoster),
    xss(serie.serieName),
  ];
  const result = await query(q, values);
  return res.json(result.rows[0]);
}
export async function deleteSeason(req, res) {
  const { serieNumber, seasonNumber } = req.params;

  const season = await findSeasonInfo(seasonNumber);

  if (!season) {
    return res.status(404).json({ error: 'Season not found' });
  }
  const q = 'DELETE FROM season WHERE serieName = $1 AND FK_serie=$2'
  await query(q, [serieNumber,seasonNumber]);
  return res.status(204).json({});
}