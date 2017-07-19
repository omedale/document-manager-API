import request from 'supertest';
import app from '../../server/server';
import './../mock/helper';

const assert = require('chai').assert;
require('babel-register');

let userID;
let userName;

describe('On Document controller', () => {
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

  it('method updateRoles should update role of Roles where id = 7 and respond with status 200',
    (done) => {
      request(app)
        .put('/api/v1/roles/7')
        .send({
          role: 'testing'
        })
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert(res.body.role === 'testing', 'Role updated');
          } else {
            const error = new Error('Update failed');
            assert.ifError(error);
          }
          done();
        });
    });
    
  it('method listRoles should list all roles and respond with status 200',
    (done) => {
      request(app)
        .get('/api/v1/roles')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert((res.body).length >= 0, 'Roles found');
          } else {
            const error = new Error('Role not found');
            assert.ifError(error);
          }
          done();
        });
    });
  // it('method deleteRole should delete role where id =  and respond with status 200', (done) => {
  //   request(app)
  //     .delete('/api/v1/roles/7')
  //     .set('Accept', 'application/json')
  //     .expect('Content-Type', /json/)
  //     .expect(200)
  //     .end((err, res) => {
  //       if (!err) {
  //         assert(res.body.message === 'Role deleted successfully.', 'Role deleted successfully.');
  //       } else {
  //         const error = new Error('Cannot delete role');
  //         assert.ifError(error);
  //       }
  //       done();
  //     });
  // });

  // it('method createRole should create a role and respond with status 200',
  //   (done) => {
  //     request(app)
  //       .post('/api/v1/roles')
  //       .send({
  //         role: 'test',
  //       })
  //       .expect(201)
  //       .end((err, res) => {
  //         if (!err) {
  //           assert(res.body.role === 'test', 'Role is Saved');
  //         } else {
  //           const error = new Error('Unable to save role');
  //           assert.ifError(error);
  //         }
  //         done();
  //       });
  //   });
});