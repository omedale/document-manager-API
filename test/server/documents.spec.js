import jwt from 'jsonwebtoken';

const User = require('../../build/models').User;
const Document = require('../../build/models').Document;
const Role = require('../../build/models').Role;
const request = require('supertest');
const assert = require('chai').assert;
require('babel-register');
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
          console.log('users tables cleared');
          Document.destroy({
            where: {},
            truncate: true,
            cascade: true,
            restartIdentity: true
          })
            .then((err) => {
              if (!err) {
                console.log('tables cleared');
              }
            });
          Role.destroy({
            where: {},
            truncate: true,
            restartIdentity: true
          })
            .then((err) => {
              if (!err) {
                 Role.bulkCreate([{
                  role: 'admin'
                },
                {
                  role: 'technology'
                },
                {
                  role: 'success'
                },
                {
                  role: 'technology'
                },
                {
                  role: 'tester'
                }
              ]).then((err) => {
                  if (!err) {
                    console.log('roles created');
                  }
                  done();
                });
              }
            });
        }
        done();
      });
    const user = new User();
    User.create({
      name: process.env.NAME,
      password: user.generateHash(process.env.PASSWORD),
      email: process.env.ADMINEMAIL,
      phoneno: '0908889000',
      role: process.env.ADMINROLE
    }).then((err) => {
      if (!err) {
        console.log('Admin user created');
      }
      done();
    });

    token = jwt.sign({
      id: 1,
      email: process.env.ADMINEMAIL,
      name: process.env.NAME,
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
          console.log('fellow saved')
        } else {
          console.log('fellow not save')
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
          console.log('tester saved')
        } else {
          console.log('tester not save')
        }
        done();
      });
  });
  it('it should set token', () => {
    if (token) {
      assert.isDefined(token, 'token is defined');
    } else {
      const error = new Error('token not defind');
      assert.ifError(error);
    }
  }, 10000);
});

describe('On Document controller', () => {
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

  it('method findDocument should get document with id = 1, when user is an admin and respond with status 200',
    (done) => {
      request(app)
        .get('/api/v1/documents/1')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert(res.body.id === 1, 'Document is found');
          } else {
            const error = new Error('Unable to find document');
            assert.ifError(error);
          }
          done();
        });
    });
  it('method findDocument, it should not get document where id = 90, user = admin and respond with status 400',
    (done) => {
      request(app)
        .get('/api/v1/documents/90')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Document Not Found', 'Document is found');
          } else {
            const error = new Error(err);
            assert.ifError(error);
          }
          done();
        });
    });

  it('method updateDocument should update title of document where id = 1 and respond with status 200',
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
            assert(res.body.message === 'Update Successful', 'Document updated');
          } else {
            const error = new Error('Update failed');
            assert.ifError(error);
          }
          done();
        });
    });

  it('method updateDocument should update title of document where id = 9 and respond with status 404',
    (done) => {
      request(app)
        .put('/api/v1/documents/9')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          document: 'Andela is Fun'
        })
        .expect(404)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Document Not Found', 'Document Not Found');
          } else {
            const error = new Error('Document Not Found');
            assert.ifError(error);
          }
          done();
        });
    });

  it('method updateDocument, it should not update where id = - and respond with status 400',
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
            assert(res.body.message === 'Invalid document ID', 'Invalid document ID');
          } else {
            const error = new Error('Invalid document ID');
            assert.ifError(error);
          }
          done();
        });
    });


  it('method listDocuments should list all documents and respond with status 200',
    (done) => {
      request(app)
        .get('/api/v1/documents')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert((res.body).length >= 0, 'Documents is found');
          } else {
            const error = new Error('Documents not found');
            assert.ifError(error);
          }
          done();
        });
    });
  it('method searchDocument should search for document where title=test title and respond with status 200',
    (done) => {
      request(app)
        .get('/api/v1/search/documents/?q=test title')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert((res.body).length >= 0, 'Document found');
          } else {
            const error = new Error('Cannot find document');
            assert.ifError(error);
          }
          done();
        });
    });

  it('method getDocumentByPage should return first 10 documents and respond with status 200',
    (done) => {
      request(app)
        .get('/api/v1/documents/page/page-1')
        .set('Authorization', `${token}`)
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
  it('method deleteDocument, it should delete document where id = 2, user = admin and respond with status 200',
    (done) => {
      request(app)
        .delete('/api/v1/documents/2')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Document deleted successfully.', 'Document deleted successfully.');
          } else {
            console.log(err);
            const error = new Error(err);
            assert.ifError(error);
          }
          done();
        });
    });
  it('method createDocument, it should not create document when title is empty and respond with status 400',
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
            assert(res.body.message === 'Invalid Input, please provide appropriate input for all field', 'Invalid Input');
          } else {
            const error = new Error(err);
            assert.ifError(error);
          }
          done();
        });
    });

  it('method createDocument, it should not create document when role=badroleand respond with status 400',
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
            assert(res.body.message === 'Invalid Document Access, you may save document with your role', 'Access Denied');
          } else {
            const error = new Error(err);
            assert.ifError(error);
          }
          done();
        });
    });
});

describe('In Document controller ', () => {

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
          userID = res.body.userId;
          userName = res.body.name;
          done();
        }
      });

  });
  it('method getDocumentByPage should return no documents found when padeId = page-hg, role=fellow and respond with status 200',
    (done) => {
      request(app)
        .get('/api/v1/documents/page/page-hg')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
          console.log(res.body);
          if (!err) {
            assert(res.body.message === 'Invalid request', 'Invalid request');
          } else {
            const error = new Error(err);
            assert.ifError(error);
          }
          done();
        });
    });
  it('method getDocumentByPage should return no documents found when padeId = page, role=fellow and respond with status 200',
    (done) => {
      request(app)
        .get('/api/v1/documents/page/page')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'No Page number', 'No Page number');
          } else {
            const error = new Error(err);
            assert.ifError(error);
          }
          done();
        });
    });
  it('method findDocument should get document where id = 1, role = fellow and respond with status 200',
    (done) => {
      request(app)
        .get('/api/v1/documents/1')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert(res.body.id === 1, 'Document is found');
          } else {
            console.log(err);
            const error = new Error('Unable to find document');
            assert.ifError(error);
          }
          done();
        });
    });
  it('method getDocumentByPage should return first 10 documents and respond with status 200',
    (done) => {
      request(app)
        .get('/api/v1/documents/page/page-1')
        .set('Authorization', `${token}`)
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
  it('method getDocumentByPage should return no documents found when padeId = page-2, role = fellow and respond with status 404',
    (done) => {
      request(app)
        .get('/api/v1/documents/page/page-2')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'No Document Found', 'No Document Found');
          } else {
            const error = new Error(err);
            assert.ifError(error);
          }
          done();
        });
    });
  it('method findDocument, it should not get document where id = 90, role = fellow and respond with status 200',
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
            assert(res.body.message === 'Document Saved', 'Document is Saved');
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
            assert(res.body.message === 'Document Not Found', 'Document is found');
          } else {
            console.log(err);
            const error = new Error(err);
            assert.ifError(error);
          }
          done();
        });
    });

  it('method listDocuments, should list all documents where user is a role and respond with status 200',
    (done) => {
      request(app)
        .get('/api/v1/documents')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert((res.body).length >= 0, 'Documents is found');
          } else {
            const error = new Error('Documents not found');
            assert.ifError(error);
          }
          done();
        });
    });
  it('method deleteDocument, it should delete document where id = 12, role = fellow and respond with status 200',
    (done) => {
      request(app)
        .delete('/api/v1/documents/12')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Document deleted successfully.', 'Document deleted successfully.');
          } else {
            console.log(err);
            const error = new Error(err);
            assert.ifError(error);
          }
          done();
        });
    });
  it('method deleteDocument, it should not delete document where id = 40, role = fellow and respond with status 400',
    (done) => {
      request(app)
        .delete('/api/v1/documents/40')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Document Not Found', 'Document Not Found');
          } else {
            console.log(err);
            const error = new Error(err);
            assert.ifError(error);
          }
          done();
        });
    });
  it('method deleteDocument, it should delete document where id = -, role = fellow and respond with status 400',
    (done) => {
      request(app)
        .delete('/api/v1/documents/-')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Invalid document ID', 'Invalid document ID');
          } else {
            const error = new Error(err);
            assert.ifError(error);
          }
          done();
        });
    });
  it('method searchDocument, it should not get document where title=test title, role = fellow and respond with status 404',
    (done) => {
      request(app)
        .get('/api/v1/search/documents/?q=test title')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Document Not Found', 'Document Not Found');
          } else {
            const error = new Error(err);
            assert.ifError(error);
          }
          done();
        });
    });
});