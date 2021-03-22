
import {
    isInt,
    isString,
  } from '../authentication/validations.js'

async function validateState(state) {
    let validation = []; 
  
    if (!isString(state)) {
      validation.push({
        field: 'state',
        error: 'State must be one of the following, Langar að horfa, Er að horfa, Hef horft', 
      });
      return validation
    }
  
  }
  export async function stateSerie(req, res) {
    const { user } = req.user.id;
    const { FK_serie } = req.params;
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
      xss[user],
      xss[FK_serie],
      xss(state)
    ];
    const result = await query(q, values);
    return res.json(result.rows[0]);
  
  }
  
  export async function updateState(req, res) {
    const { user } = requireAuth;
    const { FK_serie } = req.params;
    const { state } = req.body;
    const stateInfo = { user, FK_serie, state };
  
    const validations = await validateState(stateInfo);
  
    if (!validations.length > 0) {
      return res.status(404).json({ error: 'Serie not found' });
    }
  
    const fields = [
      isInt(stateInfo.FK_user) ? 'FK_user' : null,
      isString(stateInfo.FK_serie) ? 'FK_serie' : null,
      isString(stateInfo.state) ? 'state' : null,
    ];
  
    const values = [
      isInt(stateInfo.FK_user) ? xss(stateInfo.FK_user) : null,
      isInt(stateInfo.FK_serie) ? xss(stateInfo.FK_serie) : null,
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
    const { user } = req.user.id;
    const { id } = req.params;
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
      xss[id],
      xss(rating)
    ];
    const result = await query(q, values);
    return res.json(result.rows[0]);
  
  }
  
  export async function updateRating(req, res) {
    const { user } = requireAuth;
    const { id } = req.params;
    const { rating } = req.body;
    const ratings = { user, id, rating };
  
    const validations = await validateRating(ratings);
  
    if (!validations.length > 0) {
      return res.status(404).json({ error: 'Serie not found' });
    }
  
    const fields = [
      isInt(ratings.FK_user) ? 'FK_user' : null,
      isString(ratings.id) ? 'id' : null,
      isString(ratings.rating) ? 'rating' : null,
    ];
  
    const values = [
      isInt(ratings.FK_user) ? xss(ratings.FK_user) : null,
      isInt(ratings.id) ? xss(ratings.id) : null,
      isInt(ratings.rating) ? xss(ratings.rating) : null,
    ];
  
    if (!fields.filter(Boolean).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }
  
    fields.push('updated');
  
    const result = await conditionalUpdate('users_series', id, fields, values);
    return res.status(201).json(result.rows[0]);
  }
  
  export async function deleteRating(req, res) {
    const { id } = req.params;
    const user = req.user.id;
  
    const q = 'DELETE FROM users_series WHERE FK_serie = $1 AND FK_user = $2'
    await query(q, [id, user]);
    return res.status(204).json({});
  }
  
   export async function listRatings(req, res) {
    const { id } = req.params;
    const user = req.user.id;
  
    const q = 'SELECT * FROM users_series WHERE FK_serie = $1 AND FK_user = $2'
    const result = await query(q, [id, user]);
    return res.json(result.rows[0]);
  }