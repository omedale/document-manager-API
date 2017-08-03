import users from './controllers/users';
import documents from './controllers/documents';

module.exports = (app, passport) => {

  app.use(passport.initialize());
// Users routes
  app.post('/api/v1/users/auth/register', users.signUp);
  app.post('/api/v1/users/auth/login', users.signIn);
  app.get('/api/v1/users', users.getUsers);
  app.put('/api/v1/users/:id', users.updateUser);
  app.get('/api/v1/users/:id', users.findUser);
  app.delete('/api/v1/users/:id', users.deleteUser);
  app.get('/api/v1/users/:id/documents/', users.findUserDocument);
  app.get('/api/v1/search/users/', users.searchUser);
  app.put('/api/v1/users/role/:id', users.updateUserRole);

// Documents routes
  app.post(
    '/api/v1/documents', documents.createDocument);
  app.put(
    '/api/v1/documents/:id', documents.updateDocument);
  app.get('/api/v1/documents', documents.listDocuments);
  app.get('/api/v1/documents/:id', documents.findDocument);
  app.delete('/api/v1/documents/:id',
  documents.deleteDocument);
  app.get('/api/v1/search/documents/',
  documents.searchDocument);
};