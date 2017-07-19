import usersController from './controllers/users';
import documentController from './controllers/documents';
import roleController from './controllers/roles';

module.exports = (app, passport) => {
  app.use(passport.initialize());

  app.post('/api/v1/users/auth/register', usersController.signUp);
  app.post('/api/v1/users/auth/login', usersController.signIn);
  app.get('/api/v1/users/test', usersController.test);
  app.get('/api/v1/users', usersController.listUsers);
  app.put('/api/v1/users/:userId', usersController.updateUser);
  app.get('/api/v1/users/:userId', usersController.findUser);
  app.delete('/api/v1/users/:userId', usersController.deleteUser);
  app.get('/api/v1/users/:userId/documents', usersController.findUserDocument);
  app.get('/api/v1/search/users/', usersController.searchUser);
  app.get('/api/v1/users/page/:pageNo', usersController.getUserPage);
  app.put('/api/v1/users/role/:userId', usersController.updateUserRole);

  app.post(
    '/api/v1/documents', documentController.createDocument);
  app.put(
    '/api/v1/documents/:documentId', documentController.updateDocument);
  app.get('/api/v1/documents', documentController.listDocuments);
  app.get('/api/v1/documents/:documentId', documentController.findDocument);
  app.delete('/api/v1/documents/:documentId',
  documentController.deleteDocument);
  app.get('/api/v1/search/documents/',
  documentController.searchDocument);
  app.get('/api/v1/documents/page/:pageNo', documentController.getDocumentPage);

  app.post(
    '/api/v1/roles', roleController.createRole);
  app.get('/api/v1/roles', roleController.listRoles);
  app.put(
    '/api/v1/roles/:roleId', roleController.updateRole);
  app.delete('/api/v1/roles/:roleId', roleController.deleteRole);
};