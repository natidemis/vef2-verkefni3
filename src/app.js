import express from 'express';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import path from 'path';
import { fileURLToPath } from 'url';
import { nextTick } from 'process';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'ejs');


// TODO setja upp rest af virkni!

const nationalIdPattern = '^[0-9]{6}-?[0-9]{4}$';

app.get('/',(req,res) => {
  res.render('index', {errorId: [], errorMessages: []});
})


app.post(
  '/post',
  body('name')
    .isLength({min: 1})
    .withMessage('Nafn má ekki vera tómt'),
  body('nationalId')
    .isLength({min: 1})
    .withMessage('Kennitala má ekki vera tómt'),
  body('nationalId')
    .matches(new RegExp(nationalIdPattern))
    .withMessage('Kennitala verður að vera á formi 000000-0000 eða 0000000000'),
  
  (req,res,next) => {
      const errors = validationResult(req);
      if(!errors.isEmpty()) {
        const errorMessages = errors.array().map(i => i.msg);
        const errorId = errors.array().map(x => x.param);
        return res.render('index',{errorId, errorMessages});
      }
    return next();
  },
  (req,res) => {
    const {
      name,
      nationalId,
      comment,
      anonymouse,
    } = req.body;
  }


);
// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
