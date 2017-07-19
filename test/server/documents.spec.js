const request = require('supertest');
require('babel-register');
const app = require('../../server/server');

describe('On Document controller', () => {
  before(() => {
    request(app)
      .post('/api/v1/users/auth/login')
      .send({
        password: 'ayo',
        email: 'admin@gmail.com'
      });
  });
  it('GET: documents/12 should respond with status 200', (done) => {
    request(app)
      .get('/api/v1/documents/12')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
  // it('POST: /documents should respond with status 200', (done) => {
  //   request(app)
  //     .post('/documents')
  //     .send({
  //       title: 'ayo',
  //       document: 'omedale@gmail.com',
  //       userId: 4,
  //       access: 'public',
  //     })
  //     .expect(201, done);
  // });
});