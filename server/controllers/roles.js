
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

module.exports.updateRole = (req, res) => {
  return Role
    .find({
      where: {
        id: req.params.roleId,
      },
    })
    .then((role) => {
      if (!role) {
        return res.status(404).send({
          message: 'Role Not Found',
        });
      }

      return role
        .update(req.body, { fields: Object.keys(req.body) })
        .then(updatedRole => res.status(200).send(updatedRole))
        .catch(error => res.status(400).send(error));
    })
    .catch(error => res.status(400).send(error));
};

module.exports.deleteRole = (req, res) => {
  return Role
    .findById(req.params.roleId)
    .then((role) => {
      if (!role) {
        return res.status(400).send({
          message: 'Role Not Found',
        });
      }
      return role
        .destroy()
        .then(() => res.status(200)
        .send({ message: 'Role deleted successfully.' }))
        .catch(error => res.status(400).send(error));
    })
    .catch(error => res.status(400).send(error));
};