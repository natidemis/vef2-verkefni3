import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

const app = express();

app.get('/',(req,res) => {
  res.send(
    `<form method="post" action="/post" enctype="application/x-www-form-urlencoded>
        <input type="text" name ="data">
        <input type="file" name="file">
        <button>senda</button>
    </form>
  `);
});

app.use(express.urlencoded({ extended: true }));

app.post('/post',(req,res) => {
  console.log('req.body :>>',req.body);
  res.send(`POST gögn: ${JSON.stringify(req.body)}`);
});

// TODO setja upp rest af virkni!

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
