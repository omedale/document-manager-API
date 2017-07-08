const usersController = require('./controllers/users');

module.exports = (app, passport) => {
  app.get('/api', (req, res) => res.status(200).send({
    message: 'API home route',
  }));
  app.use(passport.initialize());
  
  app.post('/users/auth/register', usersController.signUp);
  app.post('/users/auth/login', usersController.signIn);
  app.get('/users/test', usersController.test);
  app.get('/users', usersController.listUsers);
};