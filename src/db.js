import pg from 'pg';
import dotenv from 'dotenv';
import { toPositiveNumberOrDefault } from '../authentication/validations.js';
const { Client } = pg;

const {
  NODE_ENV: nodeEnv = 'development',
} = process.env;

export async function query(sqlQuery, values = []) {
  const connectionString = process.env.DATABASE_URL;
  const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;

  const client = new Client({ connectionString, ssl });
  await client.connect();

  let result;

  try {
    result = await client.query(sqlQuery, values);
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }

  return result;
}

export async function pagedQuery(
  sqlQuery,
  values = [],
  { offset = 0, limit = 10 } = {},
) {
  console.assert(Array.isArray(values), 'values should be an array');

  const sqlLimit = values.length + 1;
  const sqlOffset = values.length + 2;
  const q = `${sqlQuery} LIMIT $${sqlLimit} OFFSET $${sqlOffset}`;

  const limitAsNumber = toPositiveNumberOrDefault(limit, 10);
  const offsetAsNumber = toPositiveNumberOrDefault(offset, 0);

  const combinedValues = values.concat([limitAsNumber, offsetAsNumber]);

  const result = await query(q, combinedValues);

  return {
    limit: limitAsNumber,
    offset: offsetAsNumber,
    items: result.rows,
  };
}

export async function conditionalUpdate(table, id, fields, values) {
  const filteredFields = fields.filter(i => typeof i === 'string');
  const filteredValues = values.filter(i => typeof i === 'string' ||
      typeof i === 'number' ||i instanceof Date);

  if (filteredFields.length === 0) {
    return false;
  }

  if (filteredFields.length !== filteredValues.length) {
    throw new Error('fields and values must be of equal length');
  }

  // id is field = 1
  const updates = filteredFields.map((field, i) => `${field} = $${i + 2}`);

  const q = `
    UPDATE ${table}
      SET ${updates.join(', ')}
    WHERE
      id = $1
    RETURNING *
    `;

  const queryValues = [id].concat(filteredValues);

  const result = await query(q, queryValues);

  return result;
}
/*
dotenv.config();

const {
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv = 'development',
} = process.env;


if (!connectionString) {
  console.error('Vantar DATABASE_URL');
  process.exit(1);
}

const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
})

export async function query(q, values = []) {
  const client = await pool.connect();

  try {
    const result = await client.query(q, values);
    return result;
  } catch(e) {
    console.error('Error selecting', e);
  } finally {
    client.release();
  }
}

async function select(q, offset = 0, limit = 50) {
  const client = await pool.connect();
  try {
    const result = await db.query(q, [offset, limit]);

    return result.rows;
  } catch (e) {
    console.error('Error selecting', e);
  } finally {
    client.release();
  }
  
  return [];
}
*/
/**
 * 
 * @param {*} q query string
 * @param {*} values values from data to insert
 *//*
async function insert(q, values) {
//   const q = `
//   INSERT INTO signatures (name, nationalId, comment, anonymous) VALUES ($1, $2, $3, $4);`;
//   const values = [data.name, data.nationalId, data.comment, data.anonymous];

  return query(q, values);
}

export const db = {
  insert : insert,
  query : query,
  select : select
}
*/

