const usersController = require('./controllers/users');

module.exports = (app) => {
  app.get('/api', (req, res) => res.status(200).send({
    message: 'API home route',
  }));

  app.post('/users', usersController.signUp);
};