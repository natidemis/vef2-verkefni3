import express from 'express';

// TODO skráningar virkni
const app = express();

const router = express.Router();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/**
 * Higher-order fall sem umlykur async middleware með villumeðhöndlun.
 *
 * @param {function} fn Middleware sem grípa á villur fyrir
 * @returns {function} Middleware með villumeðhöndlun
 */
function catchErrors(fn) {
    return (req, res, next) => fn(req, res, next).catch(next);
  }


export default function register(req,res) {
    console.log(`gögn: ${JSON.stringify(req.body)}`);
    res.send(`POST gögn: ${JSON.stringify(req.body)}`);
    res.render('index');
}

function renderPage(req,res){
    res.render('index');
}

