import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { router } from './registration.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

dotenv.config();

const {
  PORT: port = 3000 || process.env.PORT,
} = process.env;

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(dirname, 'views'));
app.set('view engine', 'ejs');

// TODO setja upp rest af virkni!

app.use('/', router);

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
