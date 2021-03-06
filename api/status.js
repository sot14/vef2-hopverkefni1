import {conditionalUpdate, query, pagedQuery} from '../src/db.js';
import xss from 'xss';
import {
    isInt,
    isString,
  } from '../authentication/validations.js'

async function validateState(state) {
    const validation = []; 
  
    if (!isString(state)) {
      validation.push({
        field: 'state',
        error: 'State must be one of the following, Langar að horfa, Er að horfa, Hef horft', 
      });
     
    }
    return validation;
  
  }
  export async function stateSerie(req, res) {
    const { id } = req.user.id;
    const { serieNumber } = req.params;
    const { state } = req.body;
    const validation = await validateState(state);
  
    if (validation.length > 0) {
      return res.status(400).json({
        errors: validation,
      });
    }
  
    const q = `
    INSERT INTO users_series (FK_user,FK_serie,state) VALUES ($1,$2,$3)
          RETURNING *`;
  
    const values = [
      id,
      serieNumber,
      state
    ];
    const result = await query(q, values);
    return res.json(result.rows[0]);
  
  }
  
  export async function updateState(req, res) {
    const { user } = requireAuth;
    const { id } = req.params;
    const { state } = req.body;
    const stateInfo = { user, id, state };
  
    const validations = await validateState(stateInfo);
  
    if (!validations.length > 0) {
      return res.status(404).json({ error: 'Serie not found' });
    }
  
    const fields = [
      isInt(stateInfo.FK_user) ? 'FK_user' : null,
      isString(stateInfo.id) ? 'id' : null,
      isString(stateInfo.state) ? 'state' : null,
    ];
  
    const values = [
      isInt(stateInfo.FK_user) ? xss(stateInfo.FK_user) : null,
      isInt(stateInfo.id) ? xss(stateInfo.id) : null,
      isInt(stateInfo.state) ? xss(stateInfo.state) : null,
    ];
  
    if (!fields.filter(Boolean).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }
  
    fields.push('updated');
  
    const result = await conditionalUpdate('users_series', id, fields, values);
    return res.status(201).json(result.rows[0]);
  }
  
  export async function deleteState(req, res) {
    const { id } = req.params;
    const user = req.user.id;
  
    const q = 'DELETE FROM users_series WHERE FK_serie = $1 AND FK_user = $2'
    await query(q, [id, user]);
    return res.status(204).json({});
  }
  
   export async function listState(req, res) {
    const { id } = req.params;
    const user = req.user.id;
  
    const q = 'SELECT * FROM users_series WHERE FK_serie = $1 AND FK_user = $2'
    const result = await query(q, [id, user]);
    return res.json(result.rows[0]);
  }

  async function validateRating(rating) {
    const validation = [];
  
    if (!isInt(rating)) {
      validation.push({
        field: 'rate',
        error: 'Rating must be an integer,one of 0, 1, 2, 3, 4, 5',
      });
    }

    return validation;
  
  }
  export async function rateSerie(req, res) {
    
    const { id } = req.user;
    const { serieNumber } = req.params;
    const { rating } = req.body;
    console.log('rating serie', rating, serieNumber, id);
    const validation = await validateRating(rating);
  
    if (validation.length > 0) {
      return res.status(400).json({
        errors: validation,
      });
    }
  
    const q = `
    INSERT INTO users_series(FK_serie, FK_user, rating) VALUES ($1, $2, $3)
          RETURNING *`;


    const values = [
      serieNumber,
      id,
      rating
    ];
    const result = await query(q, values);
    
    return res.json(result.rows[0]);
  
  }
  
  export async function updateRating(req, res) {
    console.log('updating rating');
    const { id } = req.user;
    const { serieNumber } = req.params;
    const { rating } = req.body;
    const ratings = { id, serieNumber, rating };

    console.log(ratings.id);
  
    const validations = await validateRating(ratings);
  
    if (!validations.length > 0) {
      return res.status(404).json({ error: 'Serie not found' });
    }
  
    const fields = [
      'id',
      'FK_serie',
      'rating'
    ];
  
    const values = [
      ratings.id,
      ratings.serieNumber,
      ratings.rating
    ];

    console.log(fields);
    console.log(values);
  
    if (!fields.filter(Boolean).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const resultID = await query(`SELECT id FROM users_series WHERE FK_user=$1 AND FK_serie=$2`, [id, serieNumber]);
    const currentId = resultID.rows[0].id;
  
    const result = await conditionalUpdate('users_series', currentId, fields, values);
    return res.status(201).json(result.rows[0]);
  }
  
  export async function deleteRating(req, res) {
    const { serieNumber } = req.params;
    const {id} = req.user.id;
  
    const q = 'DELETE FROM users_series WHERE FK_serie = $1 AND FK_user = $2'
    await query(q, [serieNumber, id]);
    return res.status(204).json({});
  }
  
   export async function listRatings(req, res) {
    const { id } = req.params;
    const user = req.user.id;
  
    const q = 'SELECT * FROM users_series WHERE FK_serie = $1 AND FK_user = $2'
    const result = await query(q, [id, user]);
    return res.json(result.rows[0]);
  }