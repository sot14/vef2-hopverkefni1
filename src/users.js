import bcrypt from 'bcrypt';

const records = [
    {
      id: 1,
      username: 'admin',
  
      // 123
      password: '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii',
      admin: true,
    },
    {
      id: 2,
      username: 'oli',
  
      // 123
      password: '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii',
      admin: false,
    },
  ];
  
export async function comparePasswords(password, user) {
  const ok = await bcrypt.compare(password, user.password);

  if (ok) {
    return user;
  }

  return false;
}
// Merkjum sem async þó ekki verið að nota await, þar sem þetta er notað í
// app.js gerir ráð fyrir async falli
export async function findByUsername(username) {
    const found = records.find((u) => u.username === username);
  
    if (found) {
      return found;
    }
  
    return null;
  }
  
  // Merkjum sem async þó ekki verið að nota await, þar sem þetta er notað í
  // app.js gerir ráð fyrir async falli
  export async function findById(id) {
    const found = records.find((u) => u.id === id);
  
    if (found) {
      return found;
    }
  
    return null;
  }
/* *******+  Notum þegar við erum komnar með db  ***********

export async function findByUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';

  const result = await query(q, [username]);

  if (result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function findById(id) {
  const q = 'SELECT * FROM users WHERE id = $1';

  const result = await query(q, [id]);

  if (result.rowCount === 1) {
    return result.rows[0];
  }
  return null;
}*/

// Hvernig við actually auðkennum - tengi við strategy í app.js
/**
 * Athugar hvort username og password sé til í notandakerfi.
 * Callback tekur við villu sem fyrsta argument, annað argument er
 * - `false` ef notandi ekki til eða lykilorð vitlaust
 * - Notandahlutur ef rétt
 *
 * @param {string} username Notandanafn til að athuga
 * @param {string} password Lykilorð til að athuga
 * @param {function} done Fall sem kallað er í með niðurstöðu
 * */
export async function strat(username, password, done) {
  try {
    const user = await findByUsername(username);

    if (!user) {
      return done(null, false);
    }

    // Verður annað hvort notanda hlutur ef lykilorð rétt, eða false
    const result = await comparePasswords(password, user);
    return done(null, result);
  } catch (err) {
    console.error(err);
    return done(err);
  }
}

export function serializeUser(user, done) {
  done(null, user.id);
}

export async function deserializeUser(id, done) {
  try {
    const user = await findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
}