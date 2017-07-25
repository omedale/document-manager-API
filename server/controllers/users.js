
const User = require('../models').User;
const Document = require('../models').Document;
const Role = require('../models').Role;

/**
   * signUp: To creating accounts for users
   * @function signUp
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
module.exports.signUp = (req, res) => {
  req.checkBody('email', 'Invalid email').notEmpty().isEmail();
  req.checkBody('name', 'Invalid name').notEmpty();
  req.checkBody('password', 'Invalid password').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      message: 'Invalid Input, please provide appropriate input for all field'
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
            phoneno: req.body.phoneno,
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
                  token,
                  email: registeredUser.email,
                  name: registeredUser.name
                });
            });
          })
          .catch(error => res.status(400).send(error));
      } else {
        return res.status(400).send({
          message: 'Existing user cannot sign up again. Please sign in'
        });
      }
    })
    .catch(() => res.status(400).send({ message: 'Connection Error' }));
};

/**
   * signIn: Enables users to login to their accounts
   * @function signIn
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
module.exports.signIn = (req, res) => {
  req.checkBody('email', 'Invalid email').notEmpty().isEmail();
  req.checkBody('password', 'Invalid password').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      message: 'Invalid Input, please provide appropriate input for all field'
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
          email: response.dataValues.email,
          name: response.dataValues.name
        });
      });
    })
    .catch(error => res.status(400).send(error));
};

/**
   * listUsers: Enables users to get list of registered users
   *  It includes user's documents for admin users
   * @function listUsers
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
module.exports.listUsers = (req, res) => {
  if (req.decoded.role === 'admin') {
    return User
      .findAll({
        attributes: ['id', 'name', 'email', 'phoneno', 'createdAt']
      })
      .then(user => res.status(200).send(user))
      .catch(() => res.status(400).send({ message: 'Connection Error' }));
  } else {
    return res.status(400).send({
      message: 'Access Denied'
    });
  }
};
/**
   * updateUserRole: Enables admin users to update users role
   * @function updateUserRole
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
module.exports.updateUserRole = (req, res) => {
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
                    email: user.email,
                    role: user.role,
                    message: 'Role Updated'
                  }))
                  .catch(error => res.status(400).send(error));
              })
              .catch(() => res.status(400)
              .send({ message: 'Connection Error' }));
          }
        }
      })
      .catch(() => res.status(400).send({ message: 'Connection Error' }));
  } else {
    return res.status(400).send({
      message: 'Access Denied'
    });
  }
};
/**
   * updateUser: Enables users to update their information
   *  where email must be unique
   * @function updateUser
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
module.exports.updateUser = (req, res) => {
  if (!Number.isInteger(Number(req.params.userId))) {
    return res.status(400).send({
      message: 'Invalid User ID'
    });
  }
  if (req.body.email) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
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
      .catch(() => res.status(400).send({ message: 'Connection Error' }));
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
      return user
        .update(req.body, { fields: Object.keys(req.body) })
        .then(() => res.status(200).send({
          message: 'Account Updated',
          email: user.email,
          phoneno: user.phoneno,
          name: user.name,
          role: user.role,
          id: user.id
        }))
        .catch(() => res.status(400).send({ message: 'Connection Error' }));
    })
    .catch(() => res.status(400).send({ message: 'Connection Error' }));
};
/**
   * findUser: Enables users to find other registered users
   * @function findUser
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
module.exports.findUser = (req, res) => {
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
        attributes: ['id', 'name', 'role', 'email', 'phoneno', 'createdAt'],
      })
      .then((user) => {
        if (!user) {
          return res.status(404).send({
            message: 'User Not Found',
          });
        }
        return res.status(200).send(user);
      })
      .catch(() => res.status(400).send({ message: 'Connection Error' }));
  } else {
    return res.status(400).send({
      message: 'Access Denied'
    });
  }
};

/**
   * deleteUser: Enables users and admin users to delete account by ID
   * @function deleteUser
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
module.exports.deleteUser = (req, res) => {
  if (!Number.isInteger(Number(req.params.userId))) {
    return res.status(400).send({
      message: 'Invalid User ID'
    });
  }
  if (req.decoded.id === Number(req.params.userId)
    || req.decoded.role === 'admin') {
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
          .catch(() => res.status(400).send({ message: 'Connection Error' }));
      })
      .catch(() => res.status(400).send({ message: 'Connection Error' }));
  } else {
    return res.status(400).send({
      message: 'Access Denied',
    });
  }
};
/**
   * findUserDocument: Enables users get documents that belongs to the user
   * @function findUserDocument
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
module.exports.findUserDocument = (req, res) => {
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
  if (req.decoded.id === Number(req.params.userId)
    || req.decoded.role === 'admin') {
    if (!Number.isInteger(Number(req.params.userId))) {
      return res.status(400).send({
        message: 'Invalid User ID'
      });
    }
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
        return res.status(200).send(documents);
      })
      .catch(() => res.status(400).send({ message: 'Connection Error' }));
  } else {
    return res.status(400).send({
      message: 'Access Denied'
    });
  }
};
/**
   * searchUser: Enables users to search for other registered users
   * @function searchUser
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
module.exports.searchUser = (req, res) => {
  if (!req.query.q) {
    return res.send({
      message: 'No key word supplied'
    });
  }
  if (req.decoded.role === 'admin') {
    return User
      .findAll({
        where: {
          name: (req.query.q).toLowerCase()
        },
        attributes: ['id', 'name', 'role', 'email', 'phoneno', 'createdAt'],
      })
      .then((user) => {
        if (user.length === 0) {
          return res.status(404).send({
            message: 'User Not Found',
          });
        }
        return res.status(200).send(user);
      })
      .catch(() => res.status(400).send({ message: 'Connection Error' }));
  } else {
    return res.status(400).send({
      message: 'Access Denied'
    });
  }
};
/**
   * getUserPage: Enables users to get list of registered users by page
   * @function getUserPage
   * @param {object} req request
   * @param {object} res response
   * @return {object}  returns response status and json data
   */
module.exports.getUserPage = (req, res) => {
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
    attributes: ['id', 'name', 'email', 'phoneno', 'createdAt']
  })
    .then((user) => {
      if (user.length === 0) {
        return res.status(404).send({
          message: 'No User Found',
        });
      }
      return res.status(200).send(user);
    })
    .catch(() => res.status(400).send({ message: 'Connection Error' }));
};
