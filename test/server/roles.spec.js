import request from 'supertest';
import app from '../../build/server';
import jwt from 'jsonwebtoken';

const User = require('../../build/models').User;
const assert = require('chai').assert;
require('babel-register');

let userID;
let userName;
let token;


describe('sign in', () => {
  beforeEach((done, req, res) => {
    User.find({
      where: {
        email: 'admin@gmail.com'
      }
    })
      .then((response) => {
        const user = new User();
        if (response === null) {
          return res.status(400).send({
            message: 'Not an existing user, Please sign up'
          });
        } else {
          if (user.validatePassword('ayo',
            response.dataValues.password) === false) {
            return res.status(400).send({
              message: 'Invalid Password'
            });
          }
        }
        token = jwt.sign({
          id: response.dataValues.id,
          email: response.dataValues.email,
          name: response.dataValues.name,
          role: response.dataValues.role,
        }, process.env.JWT_SECRET, { expiresIn: '24h' });
      });
  });
  it('it should set token', () => {
    if (token) {
      assert.isDefined(token, 'token is defined');
    } else {
      const error = new Error('token not defind');
      assert.ifError(error);
    }
  });
}, 10000);
describe('On Role controller', () => {
  it('method updateRoles should update role of Roles where id = 5 and respond with status 200',
    (done) => {
      request(app)
        .put('/api/v1/roles/5')
        .set('Authorization', `Bearer+${token}`)
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
        .set('Authorization', `Bearer+${token}`)
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