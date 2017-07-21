
const Role = require('../models').Role;

/**
   * createRole: Enables admin users to create roles
   * @function createRole
   * @param {object} req request
   * @param {object} res response
   * @return {object} returns response status and json data
   */
module.exports.createRole = (req, res) => {
  if (req.decoded.role !== 'admin') {
    return res.status(400).send({
      message: 'Access Denied'
    });
  }
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
/**
   * listRoles: Enables registered users to get available roles
   * @function listRoles
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
module.exports.listRoles = (req, res) => {
  return Role
    .findAll()
    .then(role => res.status(200).send(role))
    .catch(error => res.status(400).send(error));
};
/**
   * updateRole: Enables admin users to update roles by ID
   * @function updateRole
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
module.exports.updateRole = (req, res) => {
  if (req.decoded.role !== 'admin') {
    return res.status(400).send({
      message: 'Access Denied'
    });
  }
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
        .update({ role: req.body.role })
        .then(updatedRole => res.status(200).send(updatedRole))
        .catch(error => res.status(400).send(error));
    })
    .catch(error => res.status(400).send(error));
};
/**
   * deleteRole: Enables admin users to delete roles by ID
   * @function deleteRole
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
module.exports.deleteRole = (req, res) => {
  if (req.decoded.role !== 'admin') {
    return res.status(400).send({
      message: 'Access Denied'
    });
  }
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