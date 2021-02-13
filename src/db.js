import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const {
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv = 'development',
} = process.env;

if (!connectionString) {
  console.error('Vantar DATABASE_URL');
  process.exit(1);
}

console.log('process.env :>> ', process.env.DATABASE_URL);

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

const cl = await pool.connect();

await cl.query(fs.readFileSync(path.resolve(__dirname, '..')+'\\sql\\schema.sql','utf-8'));
cl.release();
async function query(q, values = []) {
  const client = await pool.connect();

  try {

    const result = await client.query(q, values);

    return result;
  } catch (err) {
    console.error("villa: ",err);
  } 
  
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
  const values = [data.name, data.nationalId,data.comment,data.anonymous];
  return await query(q,values);
}
