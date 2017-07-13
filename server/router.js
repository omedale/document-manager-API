const usersController = require('./controllers/users');
const documentController = require('./controllers/documents');
const roleController = require('./controllers/roles');

module.exports = (app, passport) => {
  app.get('/api', (req, res) => res.status(200).send({
    message: 'API home route',
  }));
  app.use(passport.initialize());

  app.post('/users/auth/register', usersController.signUp);
  app.post('/users/auth/login', usersController.signIn);
  app.get('/users/test', usersController.test);
  app.get('/users', usersController.listUsers);
  app.put('/users/:userId', usersController.updateUser);
  app.get('/users/:userId', usersController.findUser);
  app.delete('/users/:userId', usersController.deleteUser);
  app.get('/users/:userId/documents', usersController.findUserDocument);
  app.get('/search/users/', usersController.searchUser);
  app.get('/users/page/:pageNo', usersController.getUserPage);

  app.post(
    '/documents', documentController.createDocument);
  app.put(
    '/documents/:documentId', documentController.updateDocument);
  app.get('/documents', documentController.listDocuments);
  app.get('/documents/:documentId', documentController.findDocument);
  app.delete('/documents/:documentId', documentController.deleteDocument);
  app.get('/search/documents/', documentController.searchDocument);
  app.get('/documents/public/:access', documentController.getPublicDocument);
  app.get('/documents/page/:pageNo', documentController.getDocumentPage);

  app.post(
    '/roles', roleController.createRole);
  app.get('/roles', roleController.listRoles);
};