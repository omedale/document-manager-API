import request from 'supertest';
import app from '../../server/server';
import './../mock/helper';

const assert = require('chai').assert;
require('babel-register');

let userID;
let userName;

describe('In User controller: ', () => {
  beforeEach((done) => {
    request(app)
      .post('/api/v1/users/auth/login')
      .send({
        password: 'ayo',
        email: 'admin@gmail.com'
      })
      .expect(200)
      .end((err, res) => {
        if (!err) {
          userID = res.body.userId;
          userName = res.body.name;
        }
        done();
      });
  });
  it('method listUsers should list all users and respond with status 200',
    (done) => {
      request(app)
        .get('/api/v1/users')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert.isDefined(res.body, 'Users is found');
          } else {
            const error = new Error('user not found');
            assert.ifError(error);
          }
          done();
        });
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
      .expect(200)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message ===
            'successful-login', 'User Successfull Login');
        } else {
          const error = new Error('Unable to login');
          assert.ifError(error);
        }
        done();
      });
  });
  it('method findUser should get user with id=1 and respond with status 200',
    (done) => {
      request(app)
        .get('/api/v1/users/1')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert(res.body.id === 1, 'User is found');
          } else {
            const error = new Error('Unable to find users');
            assert.ifError(error);
          }
          done();
        });
    });
  it('method findUserDocument should get documents where userId=4 and respond with status 200',
    (done) => {
      request(app)
        .get('/api/v1/users/4/documents')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert((res.body).length >= 0, 'Documents found');
          } else {
            const error = new Error('Cannot find document');
            assert.ifError(error);
          }
          done();
        });
    });
  it('method searchUser should search for user where name=ayomakun and respond with status 200',
    (done) => {
      request(app)
        .get('/api/v1/search/users/?q=medale')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert((res.body).length >= 0, 'Users found');
          } else {
            const error = new Error('Cannot find user');
            assert.ifError(error);
          }
          done();
        });
    });
  it('method getUserByPage should return first 10 users and respond with status 200',
    (done) => {
      request(app)
        .get('/api/v1/users/page/page-1')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert((res.body).length >= 0, 'Users found');
          } else {
            const error = new Error('Cannot find user');
            assert.ifError(error);
          }
          done();
        });
    });
  it('method updateUser should update phone number of user where id=4 and respond with status 200',
    (done) => {
      request(app)
        .put('/api/v1/users/4')
        .send({
          phoneno: '7033390748'
        })
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert(res.body.phoneno === '7033390748', 'Users information updated');
          } else {
            const error = new Error('Update failed');
            assert.ifError(error);
          }
          done();
        });
    });
    
  it('method updateUserRole should update user role where id=1 and respond with status 200',
    (done) => {
      request(app)
        .put('/api/v1/users/role/1')
        .send({
          role: 'success'
        })
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert(res.body.role === 'success', 'Role updated');
          } else {
            const error = new Error('Update failed');
            assert.ifError(error);
          }
          done();
        });
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