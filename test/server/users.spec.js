import request from 'supertest';
import { assert } from 'chai';
import 'babel-register';
import app from '../../build/server';

const Document = require('../../build/models').Document;

let userID;
let userName;
let token;

describe('In User controller when user is not an admin: ', () => {
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
          token = res.body.token;
          userID = res.body.user.userId;
          userName = res.body.user.name;
          done();
        }
      });
  });
  // listUsers
  describe('GET api/v1/users', () => {
    it('should list all users where user=admin and respond with status 200',
      (done) => {
        request(app)
          .get('/api/v1/users')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            if (!err) {
              assert.isDefined(res.body, 'User found');
            } else {
              const error = new Error('user not found');
              assert.ifError(error);
            }
            done();
          });
      });
    it('should list all where offset = - users where user=admin',
      (done) => {
        request(app)
          .get('/api/v1/users/?limit=10&offset=-')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'Please Set Offset and Limit as Integer',
              'Please Set Offset and Limit as Integer');
            } else {
              const error = new Error('user not found');
              assert.ifError(error);
            }
            done();
          });
      });
  });
  // signIn
  describe('POST /api/v1/users/auth/login', () => {
    it('should login user and respond with status 200',
      (done) => {
        request(app)
          .post('/api/v1/users/auth/login')
          .set('Authorization', `${token}`)
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
                'Login Successful', 'User Successfull Login');
            } else {
              const error = new Error('Unable to login');
              assert.ifError(error);
            }
            done();
          });
      });
    it('should respond with status 400 if email is empty',
      (done) => {
        request(app)
          .post('/api/v1/users/auth/login')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .send({
            password: 'ayo',
            email: ''
          })
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'Invalid Input, please provide appropriate input for all field',
                'Login failed');
            } else {
              const error = new Error('Unable to login');
              assert.ifError(error);
            }
            done();
          });
      });

    it('should respond with status 400 if email is not found',
      (done) => {
        request(app)
          .post('/api/v1/users/auth/login')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .send({
            password: 'ayo',
            email: 'omed@hoo.com'
          })
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'Not an existing user, Please sign up', 'Not an existing user');
            } else {
              const error = new Error('success');
              assert.ifError(error);
            }
            done();
          });
      });
    it('should respond with status 400 if password is not valid',
      (done) => {
        request(app)
          .post('/api/v1/users/auth/login')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .send({
            password: 'ayoooo',
            email: 'fellow@gmail.com'
          })
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'Invalid Password', 'Invalid Password');
            } else {
              const error = new Error(err);
              assert.ifError(error);
            }
            done();
          });
      });
  });

  // register
  describe('POST /api/v1/users/auth/register ', () => {
    it('should respond with status 400 if email is empty',
      (done) => {
        request(app)
          .post('/api/v1/users/auth/register')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .send({
            name: 'vgheri',
            password: 'test',
            phone: 2,
            email: ''
          })
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'Invalid Input, please provide appropriate input for all field',
                'Login failed');
            } else {
              const error = new Error('Unable to login');
              assert.ifError(error);
            }
            done();
          });
      });

    it('method signUp, it should respond with status 400 if email is found',
      (done) => {
        request(app)
          .post('/api/v1/users/auth/register')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .send({
            password: 'ayo',
            email: 'admin@gmail.com',
            name: 'tester'
          })
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'User Already Exist');
            } else {
              const error = new Error('Existing user error');
              assert.ifError(error);
            }
            done();
          });
      });
  });

  // updateUsers
  describe('PUT /api/v1/users/1', () => {
    it('should update phone number of user where id=2',
      (done) => {
        request(app)
          .put('/api/v1/users/1')
          .set('Authorization', `${token}`)
          .send({
            phone: '7033390748',
            name: 'Testing master',
            role: 'admin'
          })
          .expect(200)
          .end((err, res) => {
            if (!err) {
              assert(res.body.user.phone ===
                '7033390748', 'Users information updated');
            } else {
              const error = new Error('Update failed');
              assert.ifError(error);
            }
            done();
          });
      });
    it('should update phone number of user where id=2',
      (done) => {
        request(app)
          .put('/api/v1/users/2')
          .set('Authorization', `${token}`)
          .send({
            phone: '7033390748',
            name: 'Testing master',
            role: 'admin'
          })
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message === 'Access Denied', 'Access Denied');
            } else {
              const error = new Error('Access Denied');
              assert.ifError(error);
            }
            done();
          });
      });

    it('should not update where id = - and respond with status 400',
      (done) => {
        request(app)
          .put('/api/v1/users/-')
          .set('Authorization', `${token}`)
          .send({
            phone: '7033390748'
          })
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message === 'Invalid User ID', 'Invalid User ID');
            } else {
              const error = new Error('Valid user ID');
              assert.ifError(error);
            }
            done();
          });
      });
    it('should not update where id = 2 and email = omedalemail.com',
      (done) => {
        request(app)
          .put('/api/v1/users/2')
          .set('Authorization', `${token}`)
          .send({
            phone: '7033390748',
            email: 'omedalemail.com'
          })
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'Invalid Input, please provide appropriate input for all field',
                'Invalid Input, please provide appropriate input for all field');
            } else {
              const error = new Error('Valid Input');
              assert.ifError(error);
            }
            done();
          });
      });
    it('should not update where id = 21and email = admin@gemail.com',
      (done) => {
        request(app)
          .put('/api/v1/users/1')
          .set('Authorization', `${token}`)
          .send({
            phone: '7033390748',
            email: 'admin@gmail.com'
          })
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'Email Already Exist',
                'Email Already Exist');
            } else {
              const error = new Error('No User with email');
              assert.ifError(error);
            }
            done();
          });
      });
    it('should not update where id = 99 and email = kkk@gemail.com',
      (done) => {
        request(app)
          .put('/api/v1/users/99')
          .set('Authorization', `${token}`)
          .send({
            phone: '7033390748',
            role: 'fellow',
            name: 'femi'
          })
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'User Not Found',
                'User Not Found');
            } else {
              const error = new Error('No User found');
              assert.ifError(error);
            }
            done();
          });
      });
  });
  // findUser
  describe('GET /api/v1/users/1 ', () => {
    it('should get user with id=1 and respond with status 200',
      (done) => {
        request(app)
          .get('/api/v1/users/1')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            if (!err) {
              assert(res.body.user.id === 1, 'User is found');
            } else {
              const error = new Error('Unable to find users');
              assert.ifError(error);
            }
            done();
          });
      });
    it('should not get user where id= -',
      (done) => {
        request(app)
          .get('/api/v1/users/-')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'Invalid User ID', 'Invalid User ID');
            } else {
              const error = new Error('Invalid user error');
              assert.ifError(error);
            }
            done();
          });
      });
    it('should not get user where id= 90 and respond with status 400',
      (done) => {
        request(app)
          .get('/api/v1/users/90')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message === 'User Not Found', 'User Not Found');
            } else {
              const error = new Error('User not found error');
              assert.ifError(error);
            }
            done();
          });
      });
  });

  // Delete user
  describe('DELETE: /api/v1/users/-', () => {
    it('should not delete user where id=- and respond with status 400',
      (done) => {
        request(app)
          .delete('/api/v1/users/-')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end((err, res) => {
            console.log(res.body);
            if (!err) {
              assert(res.body.message === 'Invalid User ID', 'Invalid User ID');
            } else {
              const error = new Error('Invalid User ID Error');
              assert.ifError(error);
            }
            done();
          });
      });
    it('should respond with User Not Found where id=90, role=admin',
      (done) => {
        request(app)
          .delete('/api/v1/users/90')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message === 'User Not Found', 'User Not Found');
            } else {
              const error = new Error('User not found Delete function');
              assert.ifError(error);
            }
            done();
          });
      });
  });

  // findUserDocumentByPage
  describe('GET /api/v1/users/id/documents/', () => {
    it('should get documents where id=1 and respond with status 200',
      (done) => {
        request(app)
          .get('/api/v1/users/1/documents/')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            if (!err) {
              assert((res.body.documents).length >= 0, 'Documents found');
            } else {
              const error = new Error('Cannot find document');
              assert.ifError(error);
            }
            done();
          });
      });
  });
  // SeacrhUser
  describe('GET /api/v1/search/users/?q={key} ', () => {
    it('should search for user where name=ayomakun and respond with status 200',
      (done) => {
        request(app)
          .get('/api/v1/search/users/?q=fellow')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            if (!err) {
              assert((res.body.users).length >= 0, 'Users found');
            } else {
              const error = new Error('Cannot find user');
              assert.ifError(error);
            }
            done();
          });
      });
    it('should search for user where name=ayomakun and limit = -',
      (done) => {
        request(app)
          .get('/api/v1/search/users/?q=fellow&limit=-')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'Please Set Offset and Limit as Integer',
              'Please Set Offset and Limit as Integer');
            } else {
              const error = new Error('Please Set Offset and Limit as Integer');
              assert.ifError(error);
            }
            done();
          });
      });
  });
  // GetUserByPage
  describe('GET /api/v1/users/page/:pageNo ', () => {
    it('should return first 10 users and respond with status 200',
      (done) => {
        request(app)
          .get('/api/v1/users/page/page-1')
          .set('Authorization', `${token}`)
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
  });
  // UpdateUserRole
  describe('POST api/v1/users/role/4 ', () => {
    it('should update user role where id=4 and respond with status 200',
      (done) => {
        request(app)
          .put('/api/v1/users/role/1')
          .set('Authorization', `${token}`)
          .send({
            role: 'admin'
          })
          .expect(200)
          .end((err, res) => {
            if (!err) {
              assert(res.body.user.role === 'admin', 'Role updated');
            } else {
              const error = new Error('Update failed');
              assert.ifError(error);
            }
            done();
          });
      });

    it('should not update user role where id=- and respond with status 400',
      (done) => {
        request(app)
          .put('/api/v1/users/role/-')
          .set('Authorization', `${token}`)
          .send({
            role: 'success'
          })
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message === 'Invalid User ID', 'Invalid User ID');
            } else {
              const error = new Error('Valid User ID to Update Role');
              assert.ifError(error);
            }
            done();
          });
      });

    it('should not update user role where id=100 and respond with status 400',
      (done) => {
        request(app)
          .put('/api/v1/users/role/100')
          .set('Authorization', `${token}`)
          .send({
            role: 'success'
          })
          .expect(404)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message === 'User Not Found', 'User Not Found');
            } else {
              const error = new Error('Found User to Update role');
              assert.ifError(error);
            }
            done();
          });
      });

    it('should not update user role where id=1, role=nothing',
      (done) => {
        request(app)
          .put('/api/v1/users/role/4')
          .set('Authorization', `${token}`)
          .send({
            role: 'nothing'
          })
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message === 'Invalid Role', 'Invalid Role');
            } else {
              const error = new Error('Valid role');
              assert.ifError(error);
            }
            done();
          });
      });
  });
});


describe('In User controller when user is not an admin ', () => {
  beforeEach((done) => {
    request(app)
      .post('/api/v1/users/auth/login')
      .send({
        password: 'ayo',
        email: 'fellow@gmail.com'
      })
      .expect(200)
      .end((err, res) => {
        if (!err) {
          token = res.body.token;
          userID = res.body.user.userId;
          userName = res.body.user.name;
          done();
        }
      });
  });

  describe('GET api/v1/users ', () => {
    it('should not get list all users where users is not an admin',
      (done) => {
        request(app)
          .get('/api/v1/users')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message === 'Access Denied', 'Access Denied');
            } else {
              const error = new Error('Access Denied For non Admin ');
              assert.ifError(error);
            }
            done();
          });
      });
  });

  describe('PUT api/v1/users/role/4 ', () => {
    it('should update user role where id=4 and respond with status 200',
      (done) => {
        request(app)
          .put('/api/v1/users/role/4')
          .set('Authorization', `${token}`)
          .send({
            role: 'success'
          })
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message === 'Access Denied', 'Access Denied');
            } else {
              const error = new Error('failed');
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('PUT api/v1/users/ ', () => {
    it('should not update user where id=4 and respond with status 200',
      (done) => {
        request(app)
          .put('/api/v1/users/2')
          .set('Authorization', `${token}`)
          .send({
            role: 'success'
          })
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message === 'Access Denied, Only Admin can Update Role',
              'Access Denied, Only Admin can Update Role');
            } else {
              const error =
              new Error('Access Denied, Only Admin can Update Role');
              assert.ifError(error);
            }
            done();
          });
      });
  });
  // Delete user
  describe('DELETE: /api/v1/users/- ', () => {
    it('should respond with User Not Found where id=90, role=fellow ',
      (done) => {
        request(app)
          .delete('/api/v1/users/90')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end((err, res) => {
            console.log(res.body);
            if (!err) {
              assert(res.body.message === 'Access Denied', 'Access Denied');
            } else {
              const error = new Error('Access denied error');
              assert.ifError(error);
            }
            done();
          });
      });
  });

  describe('GET api/v1/users/3  ', () => {
    it('hould not get user where id= 3 and user = fellow ',
      (done) => {
        request(app)
          .get('/api/v1/users/3')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message === 'Access Denied', 'Access Denied');
            } else {
              const error = new Error('Access Denied for non Admin');
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('GET api/v1/search/users', () => {
    it('should not get user where key=fellow and user = fellow',
      (done) => {
        request(app)
          .get('/api/v1/search/users/?q=fellow')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message === 'Access Denied', 'Access Denied');
            } else {
              const error = new Error('Access Denied for non Admin');
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('GET /api/v1/users/page/page-1 ', () => {
    it('should not get user where pageId=page-1 and user = fellow',
      (done) => {
        request(app)
          .get('/api/v1/users/page/page-1')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message === 'Access Denied', 'Access Denied');
            } else {
              const error = new Error('Access Denied for non Admin');
              assert.ifError(error);
            }
            done();
          });
      });
  });
    // findUserDocumentByPage
  describe('GET /api/v1/users/userId/documents/', () => {
    it('should not get documents where userId=1 and respond with status 400',
      (done) => {
        request(app)
          .get('/api/v1/users/1/documents/')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message === 'Access Denied', 'Access Denied');
            } else {
              const error = new Error('Cannot find document');
              assert.ifError(error);
            }
            done();
          });
      });
  });
  it('should not get documents where userId=1, limit = - ',
      (done) => {
        request(app)
          .get('/api/v1/users/1/documents/?limit=-')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'Please Set Offset and Limit as Integer',
              'Please Set Offset and Limit as Integer');
            } else {
              const error = new Error('Cannot find document');
              assert.ifError(error);
            }
            done();
          });
      });
});
