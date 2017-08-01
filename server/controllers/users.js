import {
  notFound,
  validationError,
  checkErrors,
  documentPaginationHelper,
  userPaginationHelper } from './helper';

const User = require('../models').User;
const Document = require('../models').Document;
const Role = require('../models').Role;

export default {
  /**
   * signUp: To creating accounts for users
   * @function signUp
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
  signUp: (req, res) => {
    const errorMessage = 'createuser';
    const errors = checkErrors(req, errorMessage);
    if (errors) {
      validationError(res, errors);
      return;
    }
    User.find({
      where: {
        email: req.body.email
      }
    })
      .then((userFound) => {
        if (!userFound) {
          const user = new User();
          return User
            .create({
              name: (req.body.name).toLowerCase(),
              email: req.body.email,
              role: 'fellow',
              password: user.generateHash(req.body.password),
              phone: req.body.phone,
            })
            .then((registeredUser) => {
              req.logIn(registeredUser, () => {
                const token = user
                  .generateJWT(
                    registeredUser.id,
                  registeredUser.role);
                return res.status(200)
                  .send({
                    message: 'Registration Successfull and Logged In',
                    user: {
                      token,
                      id: registeredUser.id,
                      email: registeredUser.email,
                      name: registeredUser.name
                    }
                  });
              });
            })
            .catch(error => res.status(400).send(error));
        } else {
          return res.status(400).send({
            message: 'User Already Exist'
          });
        }
      })
      .catch(error => res.status(400).send(error));
  },
  /**
   * signIn: Enables users to login to their accounts
   * @function signIn
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
  signIn: (req, res) => {
    const errorMessage = 'login';
    const errors = checkErrors(req, errorMessage);
    if (errors) {
      validationError(res, errors);
      return;
    }
    User.find({
      where: {
        email: req.body.email
      }
    })
      .then((userFound) => {
        const user = new User();
        if (userFound === null) {
          return res.status(400).send({
            message: 'Not an existing user, Please sign up'
          });
        } else {
          const userDetail = userFound.dataValues;
          if (user.validatePassword(req.body.password,
            userDetail.password) === false) {
            return res.status(400).send({
              message: 'Invalid Password'
            });
          }
        }
        const userDetail = userFound.dataValues;
        req.logIn(userDetail, () => {
          const token = user.generateJWT(
            userDetail.id,
            userDetail.role);
          // return the token as JSON
          return res.status(200).send({
            message: 'Login Successful',
            token,
            user: {
              id: userDetail.id,
              email: userDetail.email,
              name: userDetail.name
            }
          });
        });
      })
      .catch(error => res.status(400).send(error));
  },
  /**
   * updateUserRole: Enables admin users to update users role
   * @function updateUserRole
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
  updateUserRole: (req, res) => {
    if (req.decoded.role === 'admin') {
      if (!Number.isInteger(Number(req.params.id))) {
        return res.status(400).send({
          message: 'Invalid User ID'
        });
      }
      Role
        .findAll()
        .then((roles) => {
          if (roles !== null) {
            let roleExist = false;
            roles.forEach((role) => {
              if (role.role === req.body.role) {
                roleExist = true;
              }
            });
            if (!roleExist) {
              return res.status(400).json({
                message: 'Invalid Role'
              });
            } else {
              return User
                .findById(req.params.id)
                .then((user) => {
                  if (!user) {
                    return res.status(404).send({
                      message: 'User Not Found',
                    });
                  }
                  return user
                    .update({ role: req.body.role })
                    .then(() => res.status(200).send({
                      user: {
                        email: user.email,
                        role: user.role,
                      },
                      message: 'Role Updated'
                    }))
                    .catch(error => res.status(400).send(error));
                })
                .catch(error => res.status(400).send(error));
            }
          }
        })
        .catch(error => res.status(400).send(error));
    } else {
      return res.status(400).send({
        message: 'Access Denied'
      });
    }
  },
  /**
   * updateUser: Enables users to update their information
   *  where email must be unique
   * @function updateUser
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
  updateUser: (req, res) => {
    if (!Number.isInteger(Number(req.params.id))) {
      return res.status(400).send({
        message: 'Invalid User ID'
      });
    }
    if (req.body.email) {
      const errorMessage = 'updateuser';
      const errors = checkErrors(req, errorMessage);
      if (errors) {
        validationError(res, errors);
        return;
      }
      return User.find({
        where: {
          email: req.body.email
        }
      })
        .then((userFound) => {
          if (userFound) {
            return res.status(400).send({
              message: 'Email Already Exist'
            });
          }
        })
        .catch(error => res.status(400).send(error));
    }
    return User
      .findById(req.params.id)
      .then((user) => {
        if (!user) {
          return res.status(400).send({
            message: 'User Not Found',
          });
        }
        if (Number(req.decoded.id) !== Number(req.params.id)) {
          return res.status(400).send({
            message: 'Access Denied'
          });
        }
        if (req.body.role) {
          if (req.decoded.role !== 'admin') {
            return res.status(400).send({
              message: 'Access Denied, Only Admin can Update Role'
            });
          }
        }
        return user
          .update(req.body, { fields: Object.keys(req.body) })
          .then(() => res.status(200).send({
            message: 'Account Updated',
            user: {
              email: user.email,
              phone: user.phone,
              name: user.name,
              role: user.role,
              id: user.id
            }
          }))
          .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  },
  /**
   * findUser: Enables users to find other registered users
   * @function findUser
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
  findUser: (req, res) => {
    if (!Number.isInteger(Number(req.params.id))) {
      return res.status(400).send({
        message: 'Invalid User ID'
      });
    }
    if (req.decoded.role === 'admin') {
      return User
        .find({
          where: {
            id: req.params.id,
          },
          attributes: ['id', 'name', 'role', 'email', 'phone'],
        })
        .then((user) => {
          if (!user) {
            return res.status(404).send({
              message: 'User Not Found',
            });
          }
          return res.status(200).send({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              phone: user.phone,
              role: user.role
            }
          });
        })
        .catch(error => res.status(400).send(error));
    } else {
      return res.status(400).send({
        message: 'Access Denied'
      });
    }
  },

  /**
   * deleteUser: Enables users and admin users to delete account by ID
   * @function deleteUser
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
  deleteUser: (req, res) => {
    if (!Number.isInteger(Number(req.params.id))) {
      return res.status(400).send({
        message: 'Invalid User ID'
      });
    }
    if (req.decoded.id === Number(req.params.id) ||
      req.decoded.role === 'admin') {
      return User
        .findById(req.params.id)
        .then((user) => {
          if (!user) {
            return res.status(404).send({
              message: 'User Not Found',
            });
          }
          return user
            .destroy()
            .then(() => res.status(200)
              .send({ message: 'User deleted successfully.' }))
            .catch(error => res.status(400).send(error));
        })
        .catch(error => res.status(400).send(error));
    } else {
      return res.status(400).send({
        message: 'Access Denied',
      });
    }
  },
  /**
   * findUserDocument: Enables users get documents that belongs to the user
   * @function findUserDocument
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
  findUserDocument: (req, res) => {
    if (req.query.limit || req.query.offset) {
      if (!Number.isInteger(Number(req.query.limit))
        || !Number.isInteger(Number(req.query.offset))) {
        return res.status(400).send({
          message: 'Please Set Offset and Limit as Integer'
        });
      }
    }
    if (req.decoded.id === Number(req.params.id) ||
      req.decoded.role === 'admin') {
      if (!Number.isInteger(Number(req.params.id))) {
        return res.status(400).send({
          message: 'Invalid User ID'
        });
      }
      Document.findAll({
        where: {
          userId: req.params.id
        }
      })
        .then((allDocuments) => {
          const totalCount = allDocuments.length;
          const offset = req.query.offset || 0;
          const limit = req.query.limit || 10;
          return Document
            .findAll({
              offset,
              limit,
              where: {
                userId: req.params.id,
              },
              attributes:
              ['id', 'title', 'access', 'document', 'owner', 'createdAt']
            })
            .then((documents) => {
              if (documents.length === 0) {
                return res.status(404).send({
                  message: 'Document Not Found',
                });
              }
              documentPaginationHelper(
                limit, offset,
                totalCount, documents, res);
            });
        })
        .catch(error => res.status(400).send(error));
    } else {
      return res.status(400).send({
        message: 'Access Denied'
      });
    }
  },
  /**
   * searchUser: Enables users to search for other registered users
   * @function searchUser
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
  searchUser: (req, res) => {
    if (!req.query.q) {
      return res.send({
        message: 'No key word supplied'
      });
    }
    if (req.query.limit || req.query.offset) {
      if (!Number.isInteger(Number(req.query.limit))
        || !Number.isInteger(Number(req.query.offset))) {
        return res.status(400).send({
          message: 'Please Set Offset and Limit as Integer'
        });
      }
    }
    if (req.decoded.role === 'admin') {
      User
        .findAll({
          where: {
            name: (req.query.q).toLowerCase()
          },
        })
        .then((user) => {
          const totalCount = user.length;
          const offset = req.query.offset || 0;
          const limit = req.query.limit || 10;
          if (user.length === 0) {
            return res.status(404).send({
              message: 'User Not Found',
            });
          }
          return User.findAll({
            offset,
            limit,
            where: {
              name: (req.query.q).toLowerCase()
            },
            attributes: ['id', 'name', 'role', 'email', 'phone', 'createdAt']
          })
            .then((userslist) => {
              userPaginationHelper(
                limit, offset,
                totalCount, userslist, res);
            });
        })
        .catch(error => res.status(400).send(error));
    } else {
      return res.status(400).send({
        message: 'Access Denied'
      });
    }
  },
  /**
   * listUsers: Enables users to get list of registered users
   * query parameters are offset and limit
   * default offset is 0 and default limit is 10
   * @function listUsers
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
  getUsers: (req, res) => {
    if (req.decoded.role !== 'admin') {
      return res.status(400).send({
        message: 'Access Denied'
      });
    }
    if (req.query.limit || req.query.offset) {
      if (!Number.isInteger(Number(req.query.limit))
        || !Number.isInteger(Number(req.query.offset))) {
        return res.status(400).send({
          message: 'Please Set Offset and Limit as Integer'
        });
      }
    }
    User.findAll()
      .then((allUsers) => {
        const totalCount = allUsers.length;
        const offset = req.query.offset || 0;
        const limit = req.query.limit || 10;
        return User.findAll({
          offset,
          limit,
          attributes: ['id', 'name', 'role', 'email', 'phone', 'createdAt']
        })
          .then((userslist) => {
            if (userslist.length !== 0) {
              userPaginationHelper(
                limit, offset,
                totalCount, userslist, res);
            } else {
              return res.status(404).send({
                message: 'No User Found',
              });
            }
          });
      })
      .catch(error => res.status(400).send(error));
  }
};