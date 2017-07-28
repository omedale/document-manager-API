import dateFormat from 'dateformat';

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
    req.checkBody('email', 'Invalid email').isEmail();
    req.checkBody('email', 'Email not defined').notEmpty();
    req.checkBody('name', 'Invalid name').notEmpty();
    req.checkBody('password', 'Invalid password').notEmpty();
    const errors = req.validationErrors();
    if (errors) {
      return res.status(400).send({
        message: 'Invalid Input, please provide appropriate input for all field',
        errors
      });
    }
    User.find({
      where: {
        email: req.body.email
      }
    })
      .then((response) => {
        if (!response) {
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
                  .generateJWT(registeredUser.id,
                  registeredUser.email,
                  registeredUser.name,
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
    req.checkBody('email', 'Invalid email').isEmail();
    req.checkBody('email', 'Email not Defined').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    const errors = req.validationErrors();
    if (errors) {
      return res.status(400).send({
        message: 'Invalid Input, please provide appropriate input for all field',
        errors
      });
    }
    User.find({
      where: {
        email: req.body.email
      }
    })
      .then((response) => {
        const user = new User();
        if (response === null) {
          return res.status(400).send({
            message: 'Not an existing user, Please sign up'
          });
        } else {
          if (user.validatePassword(req.body.password,
            response.dataValues.password) === false) {
            return res.status(400).send({
              message: 'Invalid Password'
            });
          }
        }
        req.logIn(response.dataValues, () => {
          const token = user.generateJWT(response.dataValues.id,
            response.dataValues.email,
            response.dataValues.name,
            response.dataValues.role);
          // return the token as JSON
          return res.status(200).send({
            message: 'Login Successful',
            token,
            user: {
              id: response.dataValues.id,
              email: response.dataValues.email,
              name: response.dataValues.name
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
      if (!Number.isInteger(Number(req.params.userId))) {
        return res.status(400).send({
          message: 'Invalid User ID'
        });
      }
      Role
        .findAll()
        .then((response) => {
          if (response !== null) {
            let roleExist = false;
            response.forEach((array) => {
              if (array.role === req.body.role) {
                roleExist = true;
              }
            });
            if (!roleExist) {
              return res.status(400).json({
                message: 'Invalid Role'
              });
            } else {
              return User
                .findById(req.params.userId)
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
    if (!Number.isInteger(Number(req.params.userId))) {
      return res.status(400).send({
        message: 'Invalid User ID'
      });
    }
    if (req.body.email) {
      req.checkBody('email', 'Invalid email').isEmail();
      req.checkBody('email', 'Email required').notEmpty();
      const errors = req.validationErrors();
      if (errors) {
        return res.status(400).send({
          message: 'Invalid Input, please provide appropriate input for all field'
        });
      }
      return User.find({
        where: {
          email: req.body.email
        }
      })
        .then((response) => {
          if (response) {
            return res.status(400).send({
              message: 'Email Already Exist'
            });
          }
        })
        .catch(error => res.status(400).send(error));
    }
    return User
      .findById(req.params.userId)
      .then((user) => {
        if (!user) {
          return res.status(400).send({
            message: 'User Not Found',
          });
        }
        if (Number(req.decoded.id) !== Number(req.params.userId)) {
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
    if (!Number.isInteger(Number(req.params.userId))) {
      return res.status(400).send({
        message: 'Invalid User ID'
      });
    }
    if (req.decoded.role === 'admin') {
      return User
        .find({
          where: {
            id: req.params.userId,
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
    if (!Number.isInteger(Number(req.params.userId))) {
      return res.status(400).send({
        message: 'Invalid User ID'
      });
    }
    if (req.decoded.id === Number(req.params.userId) ||
      req.decoded.role === 'admin') {
      return User
        .findById(req.params.userId)
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
      if (!Number.isInteger(Number(req.query.limit)) || !Number.isInteger(Number(req.query.offset))) {
        return res.status(400).send({
          message: 'Please Set Offset and Limit as Integer'
        });
      }
    }
    if (req.decoded.id === Number(req.params.userId) ||
      req.decoded.role === 'admin') {
      if (!Number.isInteger(Number(req.params.userId))) {
        return res.status(400).send({
          message: 'Invalid User ID'
        });
      }
      Document.findAll({
        where: {
          userId: req.params.userId
        }
      })
        .then((allDocs) => {
          const totalCount = allDocs.length;
          const offset = req.query.offset || 0;
          const limit = req.query.limit || 10;
          return Document
            .findAll({
              offset,
              limit,
              where: {
                userId: req.params.userId,
              },
              attributes: ['id', 'title', 'access', 'document', 'owner', 'createdAt']
            })
            .then((documents) => {
              if (documents.length === 0) {
                return res.status(404).send({
                  message: 'No document Found',
                });
              }
              let pageCount = Math.round(totalCount / limit);
              pageCount = (pageCount < 1 && totalCount > 0) ? 1 : pageCount;
              const page = Math.round(offset / limit) + 1;
              return res.status(200).send({
                documents,
                metaData: {
                  page,
                  pageCount,
                  count: documents.length,
                  totalCount,
                }
              });
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
      if (!Number.isInteger(Number(req.query.limit)) || !Number.isInteger(Number(req.query.offset))) {
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
              let pageCount = Math.round(totalCount / limit);
              pageCount = (pageCount < 1 && totalCount > 0) ? 1 : pageCount;
              const page = Math.round(offset / limit) + 1;
              return res.status(200).send({
                users: userslist,
                metaData: {
                  page,
                  pageCount,
                  count: userslist.length,
                  totalCount,
                }
              });
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
   * getUserPage: Enables users to get list of registered users by page
   * @function getUserPage
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
  getUserPage: (req, res) => {
    if (req.decoded.role !== 'admin') {
      return res.status(400).send({
        message: 'Access Denied'
      });
    }
    const newPageInfo = req.params.pageNo.split('-').map((val) => {
      return val;
    });
    if (!newPageInfo[1]) {
      return res.status(400).send({
        message: 'No Page number'
      });
    }
    if (!Number.isInteger(Number(newPageInfo[1]))) {
      return res.status(400).send({
        message: 'Invalid request'
      });
    }
    const page = Number(newPageInfo[1]);
    let offset = 0;
    const limit = 10;
    if (page !== 1) {
      offset = (page - 1) * 10;
    }
    return User.findAll({
      offset,
      limit,
      attributes: ['id', 'name', 'role', 'email', 'phone', 'createdAt']
    })
      .then((user) => {
        if (user.length === 0) {
          return res.status(404).send({
            message: 'No User Found',
          });
        }
        return res.status(200).send(user);
      })
      .catch(error => res.status(400).send(error));
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
  getUserByPage: (req, res) => {
    if (req.decoded.role !== 'admin') {
      return res.status(400).send({
        message: 'Access Denied'
      });
    }
    if (req.query.limit || req.query.offset) {
      if (!Number.isInteger(Number(req.query.limit)) || !Number.isInteger(Number(req.query.offset))) {
        return res.status(400).send({
          message: 'Please Set Offset and Limit as Integer'
        });
      }
    }
    User.findAll()
      .then((response) => {
        const totalCount = response.length;
        const offset = req.query.offset || 0;
        const limit = req.query.limit || 10;
        return User.findAll({
          offset,
          limit,
          attributes: ['id', 'name', 'role', 'email', 'phone', 'createdAt']
        })
          .then((userslist) => {
            if (userslist.length !== 0) {
              let pageCount = Math.round(totalCount / limit);
              pageCount = (pageCount < 1 && totalCount > 0) ? 1 : pageCount;
              const page = Math.round(offset / limit) + 1;
              return res.status(200).send({
                users: userslist,
                metaData: {
                  page,
                  pageCount,
                  count: userslist.length,
                  totalCount,
                }
              });
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