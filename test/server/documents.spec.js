
const test = require('tape');
const request = require('supertest');
require('babel-register');
const app = require('../../server/server');

describe('On Document controller', () => {
  beforeEach(() => {
    request(app)
      .post('/users/auth/login')
      .send({
        password: 'ayo',
        email: 'presi@gmail.com'
      });
  });
  it('GET: /documents/47 should respond with status 200', (done) => {
    request(app)
      .get('/documents/47')
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