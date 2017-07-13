
const Role = require('../models').Role;

module.exports.createRole = (req, res) => {
  return Role.find({
    where: {
      role: req.body.role
    }
  })
  .then((response) => {
    if (response) { 
      return res.json({
        message: 'Role Already Exist'
      });
    } else {
      return Role
      .create({
        role: req.body.role
      })
      .then(role => res.status(201).send(role))
      .catch(error => res.status(400).send(error));
    }
  })
  .catch(error => res.status(400).send(error));
};

module.exports.listRoles = (req, res) => {
  return Role
    .findAll()
    .then(role => res.status(200).send(role))
    .catch(error => res.status(400).send(error));
};

