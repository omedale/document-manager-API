const Document = require('../models').Document;
const Role = require('../models').Role;

module.exports.test = (req, res) => {
  return res.json({
    message: 'Jesus'
  });
};

/**
   * This creates documents
   * @method createDocument
   * @param {string} req
   * @param {string} res
   * @return {json} - returns error or newly created document
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
module.exports.listDocuments = (req, res) => {
  if (req.decoded.role === 'admin') {
    return Document
      .findAll({
        attributes: ['title', 'document', 'owner', 'createdAt']
      })
      .then(documents => res.status(200).send(documents))
      .catch(error => res.status(400).send(error));
  } else {
    return Document
      .findAll({
        where: { access: [req.decoded.role, 'public'] },
        attributes: ['title', 'document', 'owner', 'createdAt']
      })
      .then(documents => res.status(200).send(documents))
      .catch(error => res.status(400).send(error));
  }
};

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
        attributes: ['title', 'document', 'owner', 'createdAt']
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
        attributes: ['title', 'document', 'owner', 'createdAt']
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

module.exports.deleteDocument = (req, res) => {
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
        attributes: ['title', 'document', 'owner', 'createdAt']
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
        attributes: ['title', 'document', 'owner', 'createdAt']
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
      attributes: ['title', 'document', 'owner', 'createdAt']
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
      attributes: ['title', 'document', 'owner', 'createdAt']
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