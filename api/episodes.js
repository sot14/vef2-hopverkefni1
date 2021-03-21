import { pagedQuery, query } from '../src/db.js';
import xss from 'xss';
import {isNotEmptyString, lengthValidationError, toPositiveNumberOrDefault, isString, isDate} from '../authentication/validations.js';

export async function listEpisode(req, res) {
    const { serieNumber, seasonNumber, episodeNumber } = req.params;
    const episodes = await query(
        `SELECT * FROM episodes
        WHERE FK_serie=$1
        AND seasonnumber=$2
        AND episodeNo=$3`,
        [serieNumber, seasonNumber, episodeNumber]);
    const episodeItems = episodes.rows;
    if (!episodes) {
        return res.status(404).json({ error: 'Episode not found' });
        }
    
    return res.json(episodeItems);
}

export async function createEpisode(req, res) {
    const { serieNumber, seasonNumber } = req.params;
    const season = await query(
        `SELECT * FROM season
        WHERE FK_serie=$1
        AND seasonNo=$2`,
        [serieNumber, seasonNumber]);
    if(!season) {
        return res.status(404).json({error: 'Season not found. Not possible to create an episode in a non-existing season.'})
    }
  
    const { name, episodeNo, aired, overview } = req.body;
    const episode = { name, episodeNo, aired, overview, seasonNumber, serieNumber };

    const validations = validateEpisode(episode);

    if (validations.length > 0) {
        return res.status(400).json({
            errors: validations,
        });
    }

    const q = `INSERT INTO episodes(name, episodeNo, aired, overview, seasonNumber, FK_serie) 
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`;
    const values = [
        xss(episode.name),
        xss(episode.episodeNo),
        xss(episode.aired),
        xss(episode.overview),
        xss(episode.seasonNumber),
        xss(episode.serieNumber)
    ];

    const result = await query(q, values);
    return res.json(result.rows[0]);
}

async function validateEpisode(
    { name, episodeNo, aired, overview, seasonNumber, serieNumber } = {},
    id = null,
  ) {
    const validation = [];
  
    // validate episode name
    if (name || isEmpty(name)) {
      if (!isNotEmptyString(name, { min: 1, max: 256 })) {
        validation.push({
          field: 'name',
          error: lengthValidationError(name, 1, 256),
        });
      }
  
      // check if episode name exists in season
      const episodeExists = await query(
        'SELECT id FROM episodes WHERE name = $1 AND FK_serie=$2 AND seasonNumber=$3',
        [name, serieNumber, seasonNumber],
      );
  
      if (episodeExists.rows.length > 0) {
        const current = episodeExists.rows[0].id;
  
        if (id && current === toPositiveNumberOrDefault(id, 0)) {
          // we can patch our own name
        } else {
          const error = `episode name already exists in season with id ${current}.`;
          validation.push({
            field: 'name',
            error,
          });
        }
      }
    }

    // validate episode number
    if (episodeNo || isEmpty(episodeNo)) {
        if (toPositiveNumberOrDefault(episodeNo, 0) <= 0) {
          validation.push({
            field: 'episodeNo',
            error: 'Episode number must be a positive integer',
          });
        } 
    }
    if (aired) {
        if(!isDate(aired)) {
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
    
      return validation;
}

export async function deleteEpisode(req, res) {
    const { id } = req.params;
  
    const product = await getProduct(id);
  
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
  
    // Athuga hvort vara sé til í körfu/pöntun
    const countQuery = 'SELECT COUNT(*) FROM orderLines WHERE product_id = $1';
    const countResult = await query(countQuery, [id]);
  
    const { count } = countResult.rows[0];
  
    // Leyfum bara að eyða tómum flokkum
    if (toPositiveNumberOrDefault(count, 0) > 0) {
      return res.status(400).json({
        error: 'Product exists in cart or order, cannot delete.',
      });
    }
  
    const q = 'DELETE FROM products WHERE ID = $1';
    await query(q, [id]);
  
    return res.status(204).json({});
  }
    