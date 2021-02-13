import express from 'express';
import dotenv from 'dotenv';
import { router } from './registration.js'
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const {
  PORT: port = 3000 || process.env.PORT,
} = process.env;

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'ejs');


// TODO setja upp rest af virkni!

app.use('/',router);


// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});