const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const http = require('http');

const port = parseInt(process.env.PORT, 10) || 8080;
const app = express();
app.set('port', port);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Require our routes into the application.
// require('./server/router')(app);
app.get('*', (req, res) => res.status(200).send({
  message: 'This is a Document Application',
}));

const server = http.createServer(app);
server.listen(port);
console.log('We are using port', port);