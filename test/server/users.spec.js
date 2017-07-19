
const request = require('supertest');
require('babel-register');
const app = require('../../server/server');

describe('In User controller: ', () => {
  before(() => {
    request(app)
      .post('/api/v1/users/auth/login')
      .send({
        password: 'ayo',
        email: 'admin@gmail.com'
      });
  });
  it('method listUsers should list all users and respond with status 200',
  (done) => {
    request(app)
      .get('/api/v1/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
  it('method signIn should login user and respond with status 200', (done) => {
    request(app)
      .post('/api/v1/users/auth/login')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .send({
        password: 'ayo',
        email: 'admin@gmail.com'
      })
      .expect(200, done);
  });
  it('method findUser should get user with id=4 and respond with status 200',
  (done) => {
    request(app)
      .get('/api/v1/users/4')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
  it('method findUserDocument should get documents where userId=4 and respond with status 200',
  (done) => {
    request(app)
      .get('/api/v1/users/4/documents')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
  it('method searchUser should search for user with name=ayomakun and respond with status 200',
  (done) => {
    request(app)
      .get('/api/v1/search/users/?q=medale')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
  it('method getUserPage should return first 10 users and respond with status 200',
  (done) => {
    request(app)
      .get('/api/v1/users/page/page-1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
  it('method updateUser should update phone number of user with id=4 and respond with status 200',
  (done) => {
    request(app)
      .put('/api/v1/users/4')
      .send({
        phoneo: '7033390748'
      })
      .expect(200, done);
  });

  // it('POST: /users/auth/register should respond with status 200', (done) => {
  //   request(app)
  //     .post('/users/auth/register')
  //     .send({
  //       name: 'vgheri',
  //       password: 'test',
  //       phoneno: 2,
  //       role: 'fellow',
  //       email: 'omedle@gmail.com'
  //     })
  //     .expect(200, done);
  // });

  // it('DELETE: /users/2 should respond with status 200', (done) => {
  //   request(app)
  //     .delete('/users/2')
  //     .set('Accept', 'application/json')
  //     .expect('Content-Type', /json/)
  //     .expect(200, done);
  // });
});