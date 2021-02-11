import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'ejs');

app.get('/',(req,res) => {
  res.render('index')
})


app.post('/post',(req,res) => {
  console.log('req.body :>>',req.body);
  res.send(`POST gögn: ${JSON.stringify(req.body)}`);
});

// TODO setja upp rest af virkni!

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
