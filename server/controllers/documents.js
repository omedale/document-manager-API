import {
  notFound,
  validationError,
  checkErrors, documentPaginationHelper,
  verifyLimitAndOffset
} from './helper';

const Document = require('../models').Document;
const Role = require('../models').Role;

export default {
  /**
   * createDocument: This allows registered users create documents
   * @function createDocument
   * @param {object} req request
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
  createDocument: (req, res) => {
    const errorMessage = 'createdocument';
    const errors = checkErrors(req, errorMessage);
    if (errors) {
      validationError(res, errors);
      return;
    }
    Role
      .findAll()
      .then((allDocuments) => {
        if (allDocuments !== null) {
          if (req.body.access === 'public' ||
            req.body.access === 'private' ||
            req.body.access === req.decoded.role) {
            return Document
              .create({
                title: (req.body.title).toLowerCase(),
                document: req.body.document,
                owner: req.decoded.name,
                userId: req.decoded.id,
                access: req.body.access
              })
              .then(document => res.status(201).send({
                message: 'Document Saved',
                document: {
                  id: document.id,
                  title: document.title,
                  document: document.document,
                  access: document.access,
                  createdAt: document.createdAt
                }
              }))
              .catch(error => res.status(400).send(error));
          } else {
            return res.status(400).send({
              message:
              'Invalid Document Access, you may save document with your role'
            });
          }
        }
      })
      .catch(error => res.status(400).send(error));
  },
  /**
   * updateDocument: This allows registered users update saved documents
   * @function updateDocument
   * @param {object} req request
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
  updateDocument: (req, res) => {
    if (!Number.isInteger(Number(req.params.id))) {
      return res.status(400).json({
        message: 'Invalid document ID'
      });
    }
    return Document
      .find({
        where: {
          id: req.params.id,
        },
      })
      .then((document) => {
        if (!document) {
          notFound(res);
          return;
        }
        if (Number(document.userId) !== Number(req.decoded.id)) {
          return res.status(400).send({
            message: 'Access denied',
          });
        }
        if (req.body.title) {
          req.body.title = (req.body.title).toLowerCase();
        }
        return document
          .update(req.body, { fields: Object.keys(req.body) })
          .then(doc => res.status(200).send({
            message: 'Update Successful',
            document: {
              id: doc.id,
              title: doc.title,
              document: doc.document,
              access: doc.access,
              createdAt: doc.createdAt
            }
          }))
          .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  },
  /**
   * listDocuments: This allows registered users get saved documents,
   * where role = "user's role" and public documents.
   * It gets all available documents both privates and public for admin users
   * @function listDocuments
   * @param {object} req request
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
  listDocuments: (req, res) => {
    if (req.query.limit || req.query.offset) {
      verifyLimitAndOffset(req.query.limit, req.query.offset, res);
      return;
    }
    const offset = req.query.offset || 0;
    const limit = req.query.limit || 10;
    if (req.decoded.role === 'admin') {
      Document.findAll()
        .then((allDocuments) => {
          const totalCount = allDocuments.length;
          return Document
            .findAll({
              offset,
              limit,
              attributes:
              ['id', 'title', 'document', 'access', 'owner', 'createdAt']
            })
            .then((documents) => {
              if (documents.length === 0) {
                notFound(res);
                return;
              }
              documentPaginationHelper(
                limit, offset, totalCount, documents, res);
            });
        })
        .catch(error => res.status(400).send(error));
    } else {
      Document.findAll({
        where: { access: [req.decoded.role, 'public'] }
      })
        .then((allDocuments) => {
          const totalCount = allDocuments.length;
          return Document
            .findAll({
              offset: req.query.offset || 0,
              limit: req.query.limit || 10,
              where: { access: [req.decoded.role, 'public'] },
              attributes:
              ['id', 'title', 'access', 'document', 'owner', 'createdAt']
            })
            .then((documents) => {
              if (documents.length === 0) {
                return res.status(404).send({
                  message: 'No document Found',
                });
              }
              documentPaginationHelper(
                limit, offset, totalCount, documents, res);
            });
        })
        .catch(error => res.status(400).send(error));
    }
  },
  /**
   * findDocument: This allows registered users get documents by ID
   * where role = "user's role" and public documents,
   * Its gets document either privates or public for admin user
   * @function findDocument
   * @param {object} req request
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
  findDocument: (req, res) => {
    if (!Number.isInteger(Number(req.params.id))) {
      return res.json({
        message: 'Invalid document ID'
      });
    }
    if (req.decoded.role === 'admin') {
      return Document
        .find({
          where: { id: req.params.id },
          attributes:
          ['id', 'title', 'access', 'document', 'owner', 'createdAt']
        })
        .then((document) => {
          if (!document) {
            notFound(res);
            return;
          }
          return res.status(200).send({
            document: {
              id: document.id,
              title: document.title,
              owner: document.owner,
              document: document.document,
              access: document.access,
              createdAt: document.createdAt
            }
          });
        })
        .catch(error => res.status(400).send(error));
    } else {
      return Document
        .find({
          where: {
            id: req.params.id
          },
          attributes:
          ['id', 'title', 'access', 'document', 'owner', 'createdAt']
        })
        .then((document) => {
          if (!document) {
            notFound(res);
            return;
          }
          if (document.access === req.decoded.role
            || document.access === 'public') {
            return res.status(200).send({
              document: {
                id: document.id,
                title: document.title,
                owner: document.owner,
                document: document.document,
                access: document.access,
                createdAt: document.createdAt
              }
            });
          } else {
            return res.status(400).send({
              message: 'Access Denied'
            });
          }
        })
        .catch(error => res.status(400).send(error));
    }
  },
  /**
   * deleteDocument:
   * This allows registered users to delete thier documents by ID
   * Admin users can also delete user's documents with by just ID
   * @function deleteDocument
   * @param {object} req request
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
  deleteDocument: (req, res) => {
    if (!Number.isInteger(Number(req.params.id))) {
      return res.status(400).send({
        message: 'Invalid document ID'
      });
    }
    if (req.decoded.role === 'admin') {
      return Document
        .find({
          where: {
            id: req.params.id
          }
        })
        .then((document) => {
          if (!document) {
            notFound(res);
            return;
          }
          return document
            .destroy()
            .then(() => res.status(200)
            .send({ message: 'Document deleted successfully.' }))
            .catch(error => res.status(400).send(error));
        })
        .catch(error => res.status(400).send(error));
    }
    return Document
      .find({
        where: {
          id: req.params.id,
        }
      })
      .then((document) => {
        if (!document) {
          notFound(res);
          return;
        }
        if (document.userId !== req.decoded.id) {
          return res.status(400).send({
            message: 'Access Denied',
          });
        }
        return document
          .destroy()
          .then(() => res.status(200)
            .send({ message: 'Document deleted successfully.' }))
          .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  },
  /**
   * searchDocument: This allows registered users get documents by search key
   * where role = "user's role" and userId = "user's ID"  and
   * public & private document.
   * Its gets document either privates or public for admin user
   * @function searchDocument
   * @param {object} req request
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
  searchDocument: (req, res) => {
    if (!req.query.q) {
      return res.send({
        message: 'No key word supplied'
      });
    }
    const query = req.query.q.trim();
    if (req.query.limit || req.query.offset) {
      verifyLimitAndOffset(req.query.limit, req.query.offset, res);
      return;
    }
    const offset = req.query.offset || 0;
    const limit = req.query.limit || 10;
    if (req.decoded.role === 'admin') {
      Document
        .findAll({
          where: {
            $and: [
              {
                title: {
                  $iLike: `%${query.toLowerCase()}%`
                }
              },
              {
                access: [req.decoded.role, 'private', 'public']
              },
              {
                userId: req.decoded.id
              }
            ]
          }
        })
        .then((allDocuments) => {
          const totalCount = allDocuments.length;
          if (allDocuments.length === 0) {
            notFound(res);
            return;
          }
          return Document
            .findAll({
              offset: req.query.offset || 0,
              limit: req.query.limit || 10,
              where: {
                $and: [
                  {
                    title: {
                      $iLike: `%${query.toLowerCase()}%`
                    }
                  },
                  {
                    access: [req.decoded.role, 'private', 'public']
                  },
                  {
                    userId: req.decoded.id
                  }
                ]
              },
              attributes:
              ['id', 'title', 'access', 'document', 'owner', 'createdAt']
            })
            .then((documents) => {
              documentPaginationHelper(
                limit, offset, totalCount, documents, res);
            });
        })
        .catch(error => res.status(400).send(error));
    } else {
      Document
        .findAll({
          where: {
            $and: [
              {
                title: {
                  $iLike: `%${query.toLowerCase()}%`
                }
              },
              {
                access: [req.decoded.role, 'private', 'public']
              },
              {
                userId: req.decoded.id
              }
            ]
          },
        })
        .then((allDocuments) => {
          const totalCount = allDocuments.length;
          if (allDocuments.length === 0) {
            notFound(res);
            return;
          }
          return Document
            .findAll({
              offset: req.query.offset || 0,
              limit: req.query.limit || 10,
              where: {
                $and: [
                  {
                    title: {
                      $iLike: `%${query.toLowerCase()}%`
                    }
                  },
                  {
                    access: [req.decoded.role, 'private', 'public']
                  },
                  {
                    userId: req.decoded.id
                  }
                ]
              },
              attributes:
              ['id', 'title', 'access', 'document', 'owner', 'createdAt']
            })
            .then((documents) => {
              documentPaginationHelper(
                limit, offset, totalCount, documents, res);
            });
        })
        .catch(error => res.status(400).send(error));
    }
  }
};