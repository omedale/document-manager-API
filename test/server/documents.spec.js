import jwt from 'jsonwebtoken';
import { assert } from 'chai';
import request from 'supertest';
import 'babel-register';
import users from '../../build/controllers/users';

const User = require('../../build/models').User;
const Document = require('../../build/models').Document;
const Role = require('../../build/models').Role;

const app = require('../../build/server');

let userID;
let userName;
let token;

describe('Set Document controller for test', () => {
  beforeEach((done, req, res) => {
    User.destroy({
      where: {},
      truncate: true,
      cascade: true,
      restartIdentity: true
    })
      .then((err) => {
        if (!err) {
          Document.destroy({
            where: {},
            truncate: true,
            cascade: true,
            restartIdentity: true
          })
            .then((err) => {
              if (!err) {
                //
              }
            });
        }
        done();
      });
  });
  const set = true;
  it('set should be true', () => {
    if (set) {
      assert.isDefined(set, 'test is ready');
    } else {
      const error = new Error('test is not ready');
      assert.ifError(error);
    }
  }, 10000);
});

describe('On Document controller when user is an admin', () => {
  describe('route GET: /api/v1/documents', () => {
    beforeEach((done) => {
      Role.destroy({
        where: {},
        truncate: true,
        cascade: true,
        restartIdentity: true
      })
        .then((err) => {
          if (!err) {
            //
          }
        });
      Role.bulkCreate([{
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        role: 'success',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        role: 'technology',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        role: 'fellow',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      ]).then((err) => {
        if (!err) {
          //
        }
        done();
      });
      const user = new User();
      User.create({
        name: 'admin',
        email: 'admin@gmail.com',
        role: 'admin',
        password: user.generateHash('ayo'),
        phone: '09890',
      }).then((respond) => {
        //
      });

      token = jwt.sign({
        id: 1,
        role: process.env.ADMINROLE,
      }, process.env.JWT_SECRET, { expiresIn: '24h' });
      request(app)
        .post('/api/v1/users/auth/register')
        .send({
          password: 'ayo',
          email: 'fellow@gmail.com',
          name: 'fellow'
        })
        .expect(200)
        .end((err, res) => {
          if (!err) {
            //
          } else {
            //
          }
          done();
        });

      request(app)
        .post('/api/v1/users/auth/register')
        .send({
          password: 'ayo',
          email: 'testing@gmail.com',
          name: 'tester'
        })
        .expect(200)
        .end((err, res) => {
          if (!err) {
            //
          } else {
            //
          }
          done();
        });
    });
    it('should respond with No document Found message',
      (done) => {
        request(app)
          .get('/api/v1/documents')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message
                === 'Document Not Found', 'Document Not Found');
            } else {
              const error = new Error('Documents not found');
              assert.ifError(error);
            }
            done();
          });
      });
  });
});
describe('On Document controller when user is an admin', () => {
  beforeEach((done) => {
    request(app)
      .post('/api/v1/documents')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .send({
        title: 'test title',
        document: 'Great Place to Learn',
        owner: process.env.NAME,
        userId: 1,
        access: 'public',
      })
      .expect(201)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Document Saved', 'Document is Saved');
        } else {
          const error = new Error('Unable to save document');
          assert.ifError(error);
        }
        done();
      });
  });
  describe('route GET: /api/v1/documents/1', () => {
    it('should get document with id = 1',
      (done) => {
        request(app)
          .get('/api/v1/documents/1')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            if (!err) {
              assert(res.body.document.id === 1, 'Document is found');
            } else {
              const error = new Error('Unable to find document');
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('route GET: /api/v1/documents/90', () => {
    it('should respond with status 400',
      (done) => {
        request(app)
          .get('/api/v1/documents/90')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message
                === 'Document Not Found', 'Document is found');
            } else {
              const error = new Error(err);
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('route PUT: /api/v1/documents/1', () => {
    it('should update title of document where id = 1',
      (done) => {
        request(app)
          .put('/api/v1/documents/1')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .send({
            document: 'Andela is Fun',
            title: 'test title'
          })
          .expect(200)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message
                === 'Update Successful', 'Document updated');
            } else {
              const error = new Error('Update failed');
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('route PUT /api/v1/documents/90', () => {
    it('should not update title of document where id = 9',
      (done) => {
        request(app)
          .put('/api/v1/documents/90')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .send({
            document: 'Andela is Fun'
          })
          .expect(404)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message
                === 'Document Not Found', 'Document Not Found');
            } else {
              const error = new Error('Document Not Found');
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('route PUT: /api/v1/documents/-', () => {
    it('should not update where id = - and respond with status 400',
      (done) => {
        request(app)
          .put('/api/v1/documents/-')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .send({
            document: 'Andela is Fun'
          })
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message
                === 'Invalid document ID', 'Invalid document ID');
            } else {
              const error = new Error('Invalid document ID');
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('route GET /api/v1/documents,', () => {
    it('should list all documents and respond with status 200',
      (done) => {
        request(app)
          .get('/api/v1/documents')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            if (!err) {
              assert((res.body.documents).length >= 0, 'Documents is found');
            } else {
              const error = new Error('Documents not found');
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('route GET /api/v1/search/documents/?q=test title', () => {
    it('should search for document where title=test title',
      (done) => {
        request(app)
          .get('/api/v1/search/documents/?q=test title')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            if (!err) {
              assert((res.body.documents).length >= 0, 'Document found');
            } else {
              const error = new Error('Cannot find document');
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('route DELETE /api/v1/documents/2,', () => {
    it('should delete document where id = 2',
      (done) => {
        request(app)
          .delete('/api/v1/documents/2')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'Document deleted successfully.',
                'Document deleted successfully.');
            } else {
              const error = new Error(err);
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('route POST: /api/v1/documents', () => {
    it('should not create document when title is empty',
      (done) => {
        request(app)
          .post('/api/v1/documents')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .send({
            title: '',
            document: 'Great Place to Learn',
            owner: process.env.NAME,
            userId: 1,
            access: 'badrole',
          })
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'Invalid Input, please provide appropriate input for all field',
                'Invalid Input');
            } else {
              const error = new Error(err);
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('route POST /api/v1/documents', () => {
    it('should not create document when role=badrole',
      (done) => {
        request(app)
          .post('/api/v1/documents')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .send({
            title: 'something',
            document: 'Great Place to Learn',
            owner: process.env.NAME,
            userId: 1,
            access: 'badrole',
          })
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'Invalid Document Access, you may save document with your role',
                'Access Denied');
            } else {
              const error = new Error(err);
              assert.ifError(error);
            }
            done();
          });
      });
  });
});


describe('In Document controller when user is not an admin', () => {
  describe('route GET: /api/v1/documents/1', () => {
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
      Document.create({
        title: 'fellow',
        document: 'nothing',
        access: 'private',
        owner: 'fellow',
        userId: 2
      }).then((err) => {
        if (!err) {
          //
        }
        done();
      });
    });
    it('should get document where id = 1, role = fellow',
      (done) => {
        request(app)
          .get('/api/v1/documents/1')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            if (!err) {
              assert(res.body.document.id === 1, 'Document is found');
            } else {
              const error = new Error('Unable to find document');
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('route POST /api/v1/documents', () => {
    it('it should not get document where id = 90, role = fellow',
      (done) => {
        request(app)
          .post('/api/v1/documents')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .send({
            title: 'Andela',
            document: 'Great Place to work',
            owner: process.env.NAME,
            userId: 2,
            access: 'public',
          })
          .expect(201)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'Document Saved', 'Document is Saved');
            } else {
              const error = new Error('Unable to save document');
              assert.ifError(error);
            }
            done();
          });

        request(app)
          .get('/api/v1/documents/90')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'Document Not Found', 'Document is found');
            } else {
              const error = new Error(err);
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('route PUT /api/v1/documents/1', () => {
    it('should not update title of document where id = 1',
      (done) => {
        request(app)
          .put('/api/v1/documents/1')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .send({
            document: 'Andela is Fun'
          })
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message
                === 'Access denied', 'Access denied');
            } else {
              const error = new Error('Access denied for fellow');
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('route GET: /api/v1/documents', () => {
    it('should list all documents where role is fellow',
      (done) => {
        request(app)
          .get('/api/v1/documents')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            if (!err) {
              assert((res.body.documents).length >= 0, 'Documents is found');
            } else {
              const error = new Error('Documents not found');
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('route GET: /api/v1/documents/?limit=-', () => {
    it('should not list all documents where limit = -, user=fellow',
      (done) => {
        request(app)
          .get('/api/v1/documents/?limit=-')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message
                === 'Please Set Offset and Limit as Integer',
                'Please Set Offset and Limit as Integer');
            } else {
              const error = new Error('Documents not found');
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('route DELETE /api/v1/documents/12', () => {
    it('should delete document where id = 12, role = fellow',
      (done) => {
        request(app)
          .delete('/api/v1/documents/12')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'Document deleted successfully.',
                'Document deleted successfully.');
            } else {
              const error = new Error(err);
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('route DELETE /api/v1/documents/40', () => {
    it('should not delete document where id = 40, role = fellow',
      (done) => {
        request(app)
          .delete('/api/v1/documents/40')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'Document Not Found', 'Document Not Found');
            } else {
              const error = new Error(err);
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('route DELETE /api/v1/documents/1', () => {
    it('should not delete document where id = 1, role = fellow',
      (done) => {
        request(app)
          .delete('/api/v1/documents/1')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'Access Denied', 'Access Denied');
            } else {
              const error = new Error(err);
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('route DELETE /api/v1/documents/-', () => {
    it('should delete document where id = -, role = fellow',
      (done) => {
        request(app)
          .delete('/api/v1/documents/-')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'Invalid document ID', 'Invalid document ID');
            } else {
              const error = new Error(err);
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('route GET: /api/v1/search/documents/?q=test title', () => {
    it('should not get document where title=test title, role = fellow',
      (done) => {
        request(app)
          .get('/api/v1/search/documents/?q=kkkkkkkk')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .end((err, res) => {
            if (!err) {
              assert(res.body.message ===
                'Document Not Found', 'Document Not Found');
            } else {
              const error = new Error(err);
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('route GET: /api/v1/search/documents/?q=test title&limit=-', () => {
    it('should not get document where title=test title, role = fellow ',
      (done) => {
        request(app)
          .get('/api/v1/search/documents/?q=test title&limit=-')
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
              const error = new Error(err);
              assert.ifError(error);
            }
            done();
          });
      });
  });
  describe('route GET /api/v1/search/documents/?q=test title,', () => {
    it('should search for document where title=test title',
      (done) => {
        request(app)
          .get('/api/v1/search/documents/?q=test title')
          .set('Authorization', `${token}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            if (!err) {
              assert((res.body.documents).length >= 0, 'Document found');
            } else {
              const error = new Error('Cannot find document');
              assert.ifError(error);
            }
            done();
          });
      });
  });
});