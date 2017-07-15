import express from 'express';
import expressValidator from 'express-validator';
import logger from 'morgan';
import bodyParser from 'body-parser';
import http from 'http';
import dotenv from 'dotenv';
import passport from 'passport';
import { LocalStorage } from 'node-localstorage';
import auth from './../server/middlewares/authorization';

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8080;
const app = express();
app.set('port', port);

// disable or enable logger;
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
// verifies all routes that starts with users and documents
app.use('/users', auth.verifyToken);
app.use('/documents', auth.verifyToken);
require('./../server/router')(app, passport);

app.get('*', (req, res) => res.status(200).send({
  message: 'This is a Document Application',
}));

const server = http.createServer(app);
server.listen(port);

module.exports = app;
console.log('We are using port', port);