import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
dotenv.config();

const {
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv = 'development',
} = process.env;

if (!connectionString) {
  console.error('Vantar DATABASE_URL');
  process.exit(1);
}

if (!connectionString) {
  console.error('Vantar DATABASE_URL!');
  process.exit(1);
}
const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });
// TODO gagnagrunnstengingar
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

async function createTable() {
  const cl = await pool.connect();
  await cl.query(fs.readFileSync(`${path.resolve(dirname, '..')}/sql/schema.sql`, 'utf-8'));
  cl.release();
}
createTable();
async function query(q, values = []) {
  const client = await pool.connect();
  const result = await client.query(q, values);
  return result;
}

export async function fetchAll() {
  const res = await query('SELECT * FROM signatures ORDER BY signed');
  return res.rows;
}

export async function insertIntoTable(data) {
  const q = `INSERT INTO signatures 
  (name,nationalId, comment, anonymous)
  VALUES
  ($1, $2, $3, $4) ON CONFLICT (nationalId) DO NOTHING`;
  const values = [data.name, data.nationalId, data.comment, data.anonymous];
  return query(q, values);
}
