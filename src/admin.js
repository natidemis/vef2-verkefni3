import express from 'express';
import { body, validationResult } from 'express-validator';
import xss from 'xss';
import { fetchAll, insertIntoTable, query, select } from './db.js';
import { port } from './app.js';
import {catchErrors} from './registration.js';

export const router_admin = express.Router();

async function login(req, res) {
    res.render('login',{
        title: "Innskráning",
        errorInfo: [],
    });
}

router_admin.get('/admin/login',catchErrors(login))