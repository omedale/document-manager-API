const Document = require('../models').Document;
const Role = require('../models').Role;

/**
   * createDocument: This allows registered users create documents
   * @function createDocument
   * @param {object} req request
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
module.exports.createDocument = (req, res) => {
  req.checkBody('title', 'Title is required').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    return res.json({
      message: 'Invalid Input, please provide appropriate input for all field'
    });
  }
  Role
    .findAll()
    .then((response) => {
      if (response !== null) {
        if (req.body.access === 'public'
          || req.body.access === 'private'
          || req.body.access === req.decoded.role) {
          return Document
            .create({
              title: (req.body.title).toLowerCase(),
              document: req.body.document,
              owner: req.decoded.name,
              userId: req.decoded.id,
              access: req.body.access
            })
            .then(document => res.status(201).send(document))
            .catch(error => res.status(400).send(error));
        } else {
          return res.json({
            message:
            `Invalid Document Access, you may save document with your role: '${req.decoded.role}' `
          });
        }
      }
    })
    .catch(error => res.status(400).send(error));
};
/**
   * updateDocument: This allows registered users update saved documents
   * @function updateDocument
   * @param {object} req request
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
module.exports.updateDocument = (req, res) => {
  if (!Number.isInteger(Number(req.params.documentId))) {
    return res.json({
      message: 'Invalid document ID'
    });
  }
  return Document
    .find({
      where: {
        id: req.params.documentId,
        userId: req.decoded.id
      },
    })
    .then((document) => {
      if (!document) {
        return res.status(404).send({
          message: 'Document Not Found',
        });
      }
      if (req.body.title) {
        req.body.title = (req.body.title).toLowerCase();
      }
      return document
        .update(req.body, { fields: Object.keys(req.body) })
        .then(updatedDocument => res.status(200).send(updatedDocument))
        .catch(error => res.status(400).send(error));
    })
    .catch(error => res.status(400).send(error));
};
/**
   * listDocuments: This allows registered users get saved documents,
   * where role = "user's role" and public documents.
   * It gets all available documents both privates and public for admin users
   * @function listDocuments
   * @param {object} req request
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
module.exports.listDocuments = (req, res) => {
  if (req.decoded.role === 'admin') {
    return Document
      .findAll({
        attributes: ['id', 'title', 'document', 'owner', 'createdAt']
      })
      .then(documents => res.status(200).send(documents))
      .catch(error => res.status(400).send(error));
  } else {
    return Document
      .findAll({
        where: { access: [req.decoded.role, 'public'] },
        attributes: ['id', 'title', 'document', 'owner', 'createdAt']
      })
      .then(documents => res.status(200).send(documents))
      .catch(error => res.status(400).send(error));
  }
};

/**
   * findDocument: This allows registered users get documents by ID
   * where role = "user's role" and public documents,
   * Its gets document either privates or public for admin user
   * @function findDocument
   * @param {object} req request
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
module.exports.findDocument = (req, res) => {
  if (!Number.isInteger(Number(req.params.documentId))) {
    return res.json({
      message: 'Invalid document ID'
    });
  }
  if (req.decoded.role === 'admin') {
    return Document
      .find({
        where: { id: req.params.documentId },
        attributes: ['id', 'title', 'document', 'owner', 'createdAt']
      })
      .then((document) => {
        if (!document) {
          return res.status(404).send({
            message: 'Document Not Found',
          });
        }
        return res.status(200).send(document);
      })
      .catch(error => res.status(400).send(error));
  } else {
    return Document
      .find({
        where: {
          id: req.params.documentId,
          access: [req.decoded.role, 'public']
        },
        attributes: ['id', 'title', 'document', 'owner', 'createdAt']
      })
      .then((document) => {
        if (!document) {
          return res.status(404).send({
            message: 'Document Not Found',
          });
        }
        return res.status(200).send(document);
      })
      .catch(error => res.status(400).send(error));
  }
};
/**
   * deleteDocument:
   * This allows registered users to delete thier documents by ID
   * Admin users can also delete user's documents with by just ID
   * @function deleteDocument
   * @param {object} req request
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
module.exports.deleteDocument = (req, res) => {
  if (!Number.isInteger(Number(req.params.documentId))) {
    return res.json({
      message: 'Invalid document ID'
    });
  }
  if (req.decoded.role === 'admin') {
    return Document
      .find({
        where: {
          id: req.params.documentId
        }
      })
      .then((document) => {
        if (!document) {
          return res.status(400).send({
            message: 'Document Not Found',
          });
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
        id: req.params.documentId,
        userId: req.decoded.id
      }
    })
    .then((document) => {
      if (!document) {
        return res.status(400).send({
          message: 'Document Not Found',
        });
      }
      return document
        .destroy()
        .then(() => res.status(200)
          .send({ message: 'Document deleted successfully.' }))
        .catch(error => res.status(400).send(error));
    })
    .catch(error => res.status(400).send(error));
};
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
module.exports.searchDocument = (req, res) => {
  if (!req.query.q) {
    return res.send({
      message: 'No key word supplied'
    });
  }
  if (req.decoded.role === 'admin') {
    return Document
      .findAll({
        where: {
          title: (req.query.q).toLowerCase()
        },
        attributes: ['id', 'title', 'document', 'owner', 'createdAt']
      })
      .then((document) => {
        if (document.length === 0) {
          return res.status(404).send({
            message: 'Document Not Found',
          });
        }
        return res.status(200).send(document);
      })
      .catch(error => res.status(400).send(error));
  } else {
    return Document
      .findAll({
        where: {
          userId: req.decoded.id,
          title: (req.query.q).toLowerCase(),
          access: [req.decoded.role, 'private', 'public'],
        },
        attributes: ['id', 'title', 'document', 'owner', 'createdAt']
      })
      .then((document) => {
        if (document.length === 0) {
          return res.status(404).send({
            message: 'Document Not Found',
          });
        }
        return res.status(200).send(document);
      })
      .catch(error => res.status(400).send(error));
  }
};
/**
   * getDocumentPage: This allows registered users get saved documents by page,
   * where role = "user's role" and public documents.
   * It gets all available documents both privates
   * and public for admin users by page
   * @function getDocumentPage
   * @param {object} req request
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
module.exports.getDocumentPage = (req, res) => {
  const newPageInfo = req.params.pageNo.split('-').map((val) => {
    return val;
  });
  if (!newPageInfo[1]) {
    return res.json({
      message: 'No Page number'
    });
  }
  if (!Number.isInteger(Number(newPageInfo[1]))) {
    return res.json({
      message: 'Invalid request'
    });
  }
  const page = Number(newPageInfo[1]);
  let offset = 0;
  const limit = 10;
  if (page !== 1) {
    offset = (page - 1) * 10;
  }

  if (req.decoded.role === 'admin') {
    return Document.findAll({
      offset,
      limit,
      attributes: ['id', 'title', 'document', 'owner', 'createdAt']
    })
      .then((docs) => {
        if (docs.length === 0) {
          return res.status(404).send({
            message: 'No Document Found',
          });
        }
        return res.status(200).send(docs);
      })
      .catch(error => res.status(400).send(error));
  } else {
    return Document.findAll({
      offset,
      limit,
      where: {
        access: [req.decoded.role, 'public']
      },
      attributes: ['id', 'title', 'document', 'owner', 'createdAt']
    })
      .then((docs) => {
        if (docs.length === 0) {
          return res.status(404).send({
            message: 'No Document Found',
          });
        }
        return res.status(200).send(docs);
      })
      .catch(error => res.status(400).send(error));
  }
};