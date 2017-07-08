const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const http = require('http');
const passport = require('passport');
const LocalStorage = require('node-localstorage').LocalStorage;
const auth = require('./server/middlewares/authorization');

const port = parseInt(process.env.PORT, 10) || 8080;
const app = express();
app.set('port', port);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Initialize localstorage
if (typeof localStorage === 'undefined' || localStorage === null) {
  localStorage = new LocalStorage('./scratch');
}
// verifies all routes that starts with users
app.use('/users', auth.verifyToken);

require('./server/router')(app, passport);

app.get('*', (req, res) => res.status(200).send({
  message: 'This is a Document Application',
}));

const server = http.createServer(app);
server.listen(port);
console.log('We are using port', port);