const request = require('supertest');
const assert = require('chai').assert;
require('babel-register');
const app = require('../../build/server');

let userID;
let userName;
let token;

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
        console.log('---tes1', res.body);
        if (!err) {
          token = res.body.token;
          userID = res.body.userId;
          userName = res.body.name;
        } else {
           console.log('---tes1 erer');
          assert.ifError('Connection Error');
        }
        done();
      });
  });

  it('method findDocument should get document with id = 5 and respond with status 200',
    (done) => {
      request(app)
        .get('/api/v1/documents/5')
        .set('Authorization', `Bearer+${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert(res.body.id === 5, 'Document is found');
          } else {
            const error = new Error('Unable to find document');
            assert.ifError(error);
          }
          done();
        });
    });

  it('method updateDocument should update title of document where id = 7 and respond with status 200',
    (done) => {
      request(app)
        .put('/api/v1/documents/7')
        .set('Authorization', `Bearer+${token}`)
        .send({
          title: 'good test'
        })
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert(res.body.title === 'good test', 'Document updated');
          } else {
            const error = new Error('Update failed');
            assert.ifError(error);
          }
          done();
        });
    });

  it('method listDocuments should list all documents and respond with status 200',
    (done) => {
      request(app)
        .get('/api/v1/documents')
        .set('Authorization', `Bearer+${token}`)
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
  it('method searchDocument should search for document where title=mydoc and respond with status 200',
    (done) => {
      request(app)
        .get('/api/v1/search/documents/?q=doc5')
        .set('Authorization', `Bearer+${token}`)
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
        .set('Authorization', `Bearer+${token}`)
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
  // it('method deleteDocument should delete documents where id =  and respond with status 200', (done) => {
  //   request(app)
  //     .delete('/api/v1/documents/20')
  //     .set('Accept', 'application/json')
  //     .expect('Content-Type', /json/)
  //     .expect(200)
  //     .end((err, res) => {
  //       if (!err) {
  //         assert(res.body.message === 'Document deleted successfully.', 'Document deleted successfully.');
  //       } else {
  //         const error = new Error('Cannot delete document');
  //         assert.ifError(error);
  //       }
  //       done();
  //     });
  // });
  // it('method createDocument should create a document and respond with status 200',
  //   (done) => {
  //     request(app)
  //       .post('/api/v1/documents')
  //       .send({
  //         title: 'mydoc',
  //         document: 'reasonable',
  //         owner: userName,
  //         userId: userID,
  //         access: 'public',
  //       })
  //       .expect(201)
  //       .end((err, res) => {
  //         if (!err) {
  //           assert(res.body.userId === userID, 'Document is Saved');
  //         } else {
  //           const error = new Error('Unable to save document');
  //           assert.ifError(error);
  //         }
  //         done();
  //       });
  //   });
});