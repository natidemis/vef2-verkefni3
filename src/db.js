import pg from 'pg';
import dotenv from 'dotenv';

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
// TODO gagnagrunnstengingar
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// async function createTable() {
//  const cl = await pool.connect();
//  await cl.query(fs.readFileSync(`${path.resolve(dirname, '..')}/sql/schema.sql`, 'utf-8'));
//  cl.release();
// }
// createTable();
export async function query(q, values = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(q, values);
    return result;
  } finally {
    client.release();
  }
}

export async function fetchAll() {
  const res = await query('SELECT * FROM signatures ORDER BY signed DESC');
  return res.rows;
}

export async function insertIntoTable(data) {
  const q = `INSERT INTO signatures 
  (name,nationalId, comment, anonymous,signed)
  VALUES
  ($1, $2, $3, $4, $5) ON CONFLICT (nationalId) DO NOTHING`;
  const values = [data.name, data.nationalId, data.comment, data.anonymous, data.date];
  return query(q, values);
}

export async function select(offset = 0, limit = 10) {
  const client = await pool.connect();

  try {
    const q = 'SELECT * FROM signatures ORDER BY signed DESC OFFSET $1 LIMIT $2';
    const res = await client.query(q, [offset, limit]);

    return res.rows;
  } catch (e) {
    console.error('Error selecting', e);
  } finally {
    client.release();
  }

  return [];
}

export async function end() {
  await pool.end();
}
