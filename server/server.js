import express from 'express';
import expressValidator from 'express-validator';
import bodyParser from 'body-parser';
import http from 'http';
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

// verifies all routes that starts with /api
app.use('/api', auth.verifyToken);

// reqires route file
require('./../build/router')(app, passport);

app.get('*', (req, res) => res.status(400)
.send('Welcome to DocME Application'));

const server = http.createServer(app);
server.listen(port);
module.exports = app;
console.log('We are using port', port);