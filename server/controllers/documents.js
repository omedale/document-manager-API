const Document = require('../models').Document;

module.exports.test = (req, res) => {
  return res.json({
    message: 'Jesus'
  });
};

module.exports.createDocument = (req, res) => {
  return Document
      .create({
        title: req.body.title,
        document: req.body.document,
        owner: req.body.owner,
        userId: req.body.userId,
        access: req.body.access
      })
      .then(document => res.status(201).send(document))
      .catch(error => res.status(400).send(error));
};

module.exports.updateDocument = (req, res) => {
  return Document
    .find({
      where: {
        id: req.params.documentId,
        userId: req.body.userId
      },
    })
    .then((document) => {
      if (!document) {
        return res.status(404).send({
          message: 'Document Not Found',
        });
      }

      return document
        .update(req.body, { fields: Object.keys(req.body) })
        .then(updatedDocument => res.status(200).send(updatedDocument))
        .catch(error => res.status(400).send(error));
    })
    .catch(error => res.status(400).send(error));
};
module.exports.listDocuments = (req, res) => {
  return Document
    .findAll()
    .then(documents => res.status(200).send(documents))
    .catch(error => res.status(400).send(error));
};

module.exports.findDocument = (req, res) => {
  return Document
    .findById(req.params.documentId)
    .then((document) => {
      if (!document) {
        return res.status(404).send({
          message: 'Document Not Found',
        });
      }
      return res.status(200).send(document);
    })
    .catch(error => res.status(400).send(error));
};

module.exports.deleteDocument = (req, res) => {
  return Document
    .findById(req.params.documentId)
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
  return Document
    .find({
      where: {
        title: req.query.q
      }
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
};