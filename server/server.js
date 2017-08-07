import express from 'express';
import expressValidator from 'express-validator';
import bodyParser from 'body-parser';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import passport from 'passport';
import auth from './../build/middlewares/authorization';

dotenv.config();
const port = process.env.PORT || 8080;
const app = express();
app.set('port', port);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(express.static(path.resolve(`${__dirname}./../public`)));

app.use('/api', auth.verifyToken);

require('./../build/route')(app, passport);

app.get('/', (req, res) => {
  res.status(200).render('index.html');
});

app.get('*', (req, res) => {
  res.redirect(302, '/');
});

const server = http.createServer(app);
server.listen(port);
module.exports = app;