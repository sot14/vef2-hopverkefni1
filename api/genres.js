import { query, pagedQuery } from '../src/db.js';
import {isNotEmptyString} from '../authentication/validations.js';

export async function listGenres(req, res) {
    
    let genres;
    const { offset = 0, limit = 10 } = req.query;
    try {
        genres = await pagedQuery(`SELECT * FROM genres`, [], {offset, limit});
    } catch (e) {
        console.error('Villa við að sækja genres');
    }
    if (!genres) {
        return res.status(404).json({ error: 'Genres not found' });
    }
    return res.json(genres);
}

export async function addGenre(req, res) {
    const { name } = req.body;
    const validations = await validateGenre(name);
    if (validations.length > 0) {
        return res.status(400).json({
          errors: validations,
        });
      }

    let result;
    try {
        result = await query(`INSERT INTO genre(name) VALUES($1) RETURNING id, name;`, [name]);
    } catch (e) {
        console.error('Villa við að inserta genre');
    }
    return res.status(201).json(result.rows[0]);
}

async function validateGenre(name) {
    if (!isNotEmptyString(name, { min: 1, max: 256 })) {
      return [{
        field: 'name',
        error: lengthValidationError(name, 1, 256),
      }];
    }
    const genres = await query(
        'SELECT id FROM genres WHERE name = $1',
        [name],
      );
    
      if (genres.rows.length > 0) {
        const currentGenre = genres.rows[0].id;
        const error = `Genre already exists in genre with id ${currentGenre}.`;
        return [{ field: 'name', error }];
      }
    
      return [];
}
