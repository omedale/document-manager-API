
const test = require('tape');
const request = require('supertest');
const app = require('../server');

describe('GET /users', () => {
  it('respond with json', (done) => {
    request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});

describe('POST /users/auth/register', () => {
  it('respond with json', (done) => {
    request(app)
      .post('/users/auth/register')
      .send({
        name: 'vgheri',
        password: 'test',
        phoneno: 'Valerio',
        email: 'omedale@gmail.com'
      })
      .expect(200, done);
  });
});

describe('POST /users/auth/login', () => {
  it('respond with json', (done) => {
    request(app)
      .post('/users/auth/login')
      .send({
        password: 'ayo',
        email: 'omedale@gmail.com'
      })
      .expect(200, done);
  });
});
describe('POST /documents', () => {
  it('respond with json', (done) => {
    request(app)
      .post('/documents')
      .send({
        title: 'ayo',
        document: 'omedale@gmail.com',
        userId: 2,
        access: 'public',
      })
      .expect(201, done);
  });
});

describe('GET /documents', () => {
  it('respond with json', (done) => {
    request(app)
      .get('/documents/3')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { 
        id: 3,
        title: 'Jesus Lord',
        document: 'new document',
        owner: 'medale',
        access: 'private',
        userId: 2,
        createdAt: '2017-07-09T13:55:45.485Z',
        updatedAt: '2017-07-09T13:55:45.485Z' }, done);
  });
});