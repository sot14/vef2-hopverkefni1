import xss from 'xss';
import bcrypt from 'bcrypt';
import { addPageMetadata } from '../src/utils.js';
import { query, pagedQuery, conditionalUpdate } from '../src/db.js';
import { requireAuth, checkUserIsAdmin } from '../authentication/registered.js';
import { uploadImageIfNotUploaded } from '../src/images.js';

const requireAdmin = [
  requireAuth,
  checkUserIsAdmin,
];

import {
  isInt,
  isEmpty,
  isNotEmptyString,
  isString,
  isBoolean,
  isDate,
  validateImageMimetype
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
async function validateSerie({ name, aired, inProduction, tagline, thumbnail, description, language, network, url } = {},
  patching = false,
  id = null,
) {
  const validation = [];


  if (!patching || name || isEmpty(name)) {
    if (!isNotEmptyString(name, { min: 1, max: 256 })) {
      validation.push({
        field: 'name',
        error: 'Name must be between 1 and 256 characters'
      });
    }
  }
  if (!patching || aired || isEmpty(aired)) {
    if (!isDate(aired)) {
      validation.push({
        field: 'aired',
        error: 'Input must be a date'
      })
    }
  }
  if (!patching || inProduction || isEmpty(inProduction)) {
    if (!isBoolean(inProduction)) {
      validation.push({
        field: 'inProduction',
        error: 'Input must be a boolean (true/false)'
      })
    }
  }
  if (!patching || tagline || isEmpty(tagline)) {
    if (!isString(tagline)) {
      validation.push({
        field: 'tagline',
        error: 'Input must be a string'
      })
    }
  }
  if (!patching || thumbnail || isEmpty(thumbnail)) {
    if (!isNotEmptyString(thumbnail, { min: 1, max: 256 })) {
      validation.push({
        field: 'thumbnail',
        error: 'Thumbnail path must be between 1 and 256 characters'
      });
    }
  }
  if (!patching || description || isEmpty(description)) {
    if (!isString(description)) {
      validation.push({
        field: 'description',
        error: 'Input must be a string'
      })
    }
  }
  if (!patching || language || isEmpty(language)) {
    if (!isString(language)) {
      validation.push({
        field: 'language',
        error: 'Input must be a string'
      })
    }
  }
  if (!patching || network || isEmpty(network)) {
    if (!isString(network)) {
      validation.push({
        field: 'network',
        error: 'Input must be a string'
      })
    }
  }
  if (!patching || url || isEmpty(url)) {
    if (!isString(url)) {
      validation.push({
        field: 'url',
        error: 'Input must be a string'
      })
    }
  }
  return validation;
}

// Setur nýjan sjónvarpsþátt inn í gagnagrunn ef allt er í lagi eftir validation,
export async function createSeries(req, res, next) {

  const { name, aired, inProduction, tagline, thumbnail, description, language, network, url } = req.body;

  const { file: { path, mimetype } = {} } = req;
  const hasImage = Boolean(path && mimetype);

  const serie = { name, aired, inProduction, tagline, thumbnail, description, language, network, url };
  const validations = await validateSerie(serie);

  if (hasImage) {
    if (!validateImageMimetype(mimetype)) {
      validations.push({
        field: 'image',
        error: `Mimetype ${mimetype} is not legal. ` +
               `Only ${MIMETYPES.join(', ')} are accepted`,
      });
    }
  }

  if (validations.length > 0) {
    return res.status(400).json({
      errors: validations,
    });
  }

  if (hasImage) {
    let upload = null;
    try {
      upload = await uploadImageIfNotUploaded(path);
    } catch (error) {
      // Skilum áfram villu frá Cloudinary, ef einhver
      if (error.http_code && error.http_code === 400) {
        return res.status(400).json({ errors: [{
          field: 'image',
          error: error.message,
        }] });
      }

      console.error('Unable to upload file to cloudinary');
      return next(error);
    }

    if (upload && upload.secure_url) {
      serie.thumbnail = upload.secure_url;
    } else {
      // Einhverja hluta vegna er ekkert `secure_url`?
      return next(new Error('Cloudinary upload missing secure_url'));
    }
  }

  const maxId = await query(`SELECT MAX(id) FROM series`, []);
  const id = maxId.rows[0].max + 1;
  console.log(id);
  const q = `
  INSERT INTO series(id, name, aired, inProduction, tagline, thumbnail, description, language, network, url) 
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`;

  const values = [
    xss(id),
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
  console.log('inserting serie');
  const result = await query(q, values);
  return res.json(result.rows[0]);
}

export async function deleteSeries(req, res) {
  const { id } = req.params;

  const serie = await findSerie(id);

  if (!serie) {
    return res.status(404).json({ error: 'Serie not found' });
  }
  const q = 'DELETE FROM series WHERE ID = $1'
  await query(q, [id]);
  return res.status(204).json({});
}

export async function updateSeries(req, res) {
  const { id } = req.params;
  const { name, aired, inProduction, tagline, thumbnail, description, language, network, url } = req.body;
  const serie = { name, aired, inProduction, tagline, thumbnail, description, language, network, url };

  const { file: { path, mimetype } = {} } = req;
  const hasImage = Boolean(path && mimetype);
  
  const validations = await validateSerie(serie, true, id);

  if (hasImage) {
    if (!validateImageMimetype(mimetype)) {
      validations.push({
        field: 'image',
        error: `Mimetype ${mimetype} is not legal. ` +
          `Only ${MIMETYPES.join(', ')} are accepted`,
      });
    }
  }

  if (!validations.length > 0) {
    return res.status(404).json({ error: 'Serie not found' });
  }
    
  if (hasImage) {
    let upload = null;
    try {
      upload = await uploadImageIfNotUploaded(path);
    } catch (error) {
      // Skilum áfram villu frá Cloudinary, ef einhver
      if (error.http_code && error.http_code === 400) {
        return res.status(400).json({ errors: [{
          field: 'image',
          error: error.message,
        }] });
      }

      console.error('Unable to upload file to cloudinary');
      return next(error);
    }

    if (upload && upload.secure_url) {
      serie.thumbnail = upload.secure_url;
    } else {
      // Einhverja hluta vegna er ekkert `secure_url`?
      return next(new Error('Cloudinary upload missing secure_url'));
    }
  }

    const fields = [
      isString(serie.name) ? 'name' : null,
      isString(serie.aired) ? 'price' : null,
      isString(serie.inProduction) ? 'inProduction' : null,
      isString(serie.tagline) ? 'tagline' : null,
      isString(serie.thumbnail) ? 'thumbnail' : null,
      isString(serie.description) ? 'description' : null,
      isString(serie.language) ? 'language' : null,
      isString(serie.network) ? 'network' : null,
      isString(serie.url) ? 'url' : null,
    ];
    
    const values = [
      isString(serie.name) ? xss(serie.title) : null,
      isString(serie.aired) ? xss(serie.price) : null,
      isString(serie.inProduction) ? xss(serie.inProduction) : null,
      isString(serie.tagline) ? xss(serie.tagline) : null,
      isString(serie.thumbnail) ? xss(serie.thumbnail) : null,
      isString(serie.description) ? xss(serie.description) : null,
      isString(serie.language) ? xss(serie.language) : null,
      isString(serie.network) ? xss(serie.network) : null,
      isString(serie.url) ? xss(serie.url) : null,
    ];
  
    if (!fields.filter(Boolean).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }
  
    fields.push('updated');
    values.push(new Date());
  
    const result = await conditionalUpdate('series', id, fields, values);
    return res.status(201).json(result.rows[0]);
}
// Finnur fjölda einkunna og meðaleinkunn
async function getStats(id) {
  const stats = await query(
    `SELECT COUNT(*),AVG(rating) from users_series where FK_serie=$1`,
    [id],
  );
  return stats.rows[0];

}
// Birtir upplýsingar um stakan sjónvarpsþátt
export async function listSerie(req, res) {
  const { id } = req.params;
  const stats = await getStats(id);
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
  result.push(stats)
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
async function validateRating(rating){
  let validation = [];

  if (!isInt(rating)) {
    validation.push({
      field: 'rate',
      error: 'Rating must be an integer,one of 0, 1, 2, 3, 4, 5',
    });
    return validation
  }

}
export async function rateSerie(req, res) {
  const { user } = requireAuth;
  const { FK_serie } = req.params;
  const { rating } = req.body;
  const validation = await validateRating(rating);

  if (validation.length > 0) {
    return res.status(400).json({
      errors: validation,
    });
  }

  const q = `
  INSERT INTO users_series (FK_user,FK_serie,rating) VALUES ($1,$2,$3)
        RETURNING *`;

  const values = [
    xss[user],
    xss[FK_serie],
    xss(rating)
  ];
  const result = await query(q, values);
  return res.json(result.rows[0]);

}

export async function updateRating(req, res) {
  const { user } = requireAuth;
  const { FK_serie } = req.params;
  const { rating } = req.body;
  const ratings = { user, FK_serie, rating };

  const validations = await validateRating(ratings);

  if (!validations.length > 0) {
    return res.status(404).json({ error: 'Serie not found' });
  }

  const fields = [
    isInt(ratings.FK_user) ? 'FK_user' : null,
    isString(ratings.FK_serie) ? 'FK_serie' : null,
    isString(ratings.rating) ? 'rating' : null,
  ];

  const values = [
    isInt(ratings.FK_user) ? xss(ratings.FK_user) : null,
    isInt(ratings.FK_serie) ? xss(ratings.FK_serie) : null,
    isInt(ratings.rating) ? xss(ratings.rating) : null,
  ];

  if (!fields.filter(Boolean).length === 0) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  fields.push('updated');

  const result = await conditionalUpdate('users_series', id, fields, values);
  return res.status(201).json(result.rows[0]);
}

