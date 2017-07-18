import { LocalStorage } from 'node-localstorage';

const User = require('../models').User;
const Document = require('../models').Document;

const localStorage = LocalStorage('./scratch');

/**
   * To sign up users
   * @method signUp
   * @param {string} req
   * @param {string} res
   * @return {json} - returns error or registrstion successfull
   */
module.exports.signUp = (req, res) => {
  req.checkBody('email', 'Invalid email').notEmpty().isEmail();
  req.checkBody('name', 'Invalid name').notEmpty().isAlpha();
  req.checkBody('role', 'Invalid role').isAlpha();
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
            role: 'user',
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
              localStorage.setItem('JSONWT', token);
              return res.status(200)
                .send({
                  message: 'successful-reg-login',
                  token,
                  registeredUser
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
    .catch(error => res.status(400).send({ error }));
};

module.exports.signIn = (req, res) => {
  req.checkBody('email', 'Invalid email').notEmpty().isEmail();
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
        localStorage.setItem('JSONWT', token);
        // return the token as JSON
        return res.status(200).send({ message: 'successful-login', token });
      });
    })
    .catch(error => res.status(400).send(error));
};

module.exports.listUsers = (req, res) => {
  if (req.decoded.role === 'admin') {
    return User
      .findAll({
        include: [{
          model: Document,
          as: 'myDocuments',
        }],
      })
      .then(user => res.status(200).send(user))
      .catch(error => res.status(400).send(error));
  } else {
    return User
      .findAll()
      .then(user => res.status(200).send(user))
      .catch(error => res.status(400).send(error));
  }
};

module.exports.updateUser = (req, res) => {
  if (!Number.isInteger(Number(req.params.userId))) {
    return res.status(400).send({
      message: 'Invalid User ID'
    });
  }
  if (req.decoded.id !== Number(req.params.userId)) {
    return res.status(400).send({
      message: 'Access Denied'
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
        } else {
          return User
            .findById(req.params.userId, {
              include: [{
                model: Document,
                as: 'myDocuments',
              }],
            })
            .then((user) => {
              if (!user) {
                return res.status(404).send({
                  message: 'User Not Found',
                });
              }
              return user
                .update(req.body, { fields: Object.keys(req.body) })
                .then(() => res.status(200).send(user))
                .catch(error => res.status(400).send(error));
            })
            .catch(error => res.status(400).send(error));
        }
      })
      .catch(error => res.status(400).send(error));
  } else {
    return User
      .findById(req.params.userId, {
        include: [{
          model: Document,
          as: 'myDocuments',
        }],
      })
      .then((user) => {
        if (!user) {
          return res.status(404).send({
            message: 'User Not Found',
          });
        }
        return user
          .update(req.body, { fields: Object.keys(req.body) })
          .then(() => res.status(200).send(user))
          .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  }
};

module.exports.findUser = (req, res) => {
  if (!Number.isInteger(Number(req.params.userId))) {
    return res.status(400).send({
      message: 'Invalid User ID'
    });
  }
  return User
    .findById(req.params.userId, {
      include: [{
        model: Document,
        as: 'myDocuments',
      }],
    })
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: 'User Not Found',
        });
      }
      return res.status(200).send(user);
    })
    .catch(error => res.status(400).send(error));
};

module.exports.deleteUser = (req, res) => {
  if (!Number.isInteger(Number(req.params.userId))) {
    return res.send({
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
          .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  } else {
    return res.status(404).send({
      message: 'Access Denied',
    });
  }
};

module.exports.findUserDocument = (req, res) => {
  if (req.decoded.id === Number(req.params.userId)
    || req.decoded.role === 'admin') {
    if (!Number.isInteger(Number(req.params.userId))) {
      return res.status(400).send({
        message: 'Invalid User ID'
      });
    }
    return Document
      .findAll({
        where: {
          userId: req.params.userId,
        }
      })
      .then((documents) => {
        if (documents.length === 0) {
          return res.status(404).send({
            message: 'No document Found',
          });
        }
        return res.status(200).send(documents);
      })
      .catch(error => res.status(400).send(error));
  } else {
    return res.status(400).send({
      message: 'Access Denied'
    });
  }
};

module.exports.searchUser = (req, res) => {
  if (!req.query.q) {
    return res.send({
      message: 'No key word supplied'
    });
  }
  return User
    .find({
      where: {
        name: (req.query.q).toLowerCase()
      }
    })
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: 'User Not Found',
        });
      }
      return res.status(200).send(user);
    })
    .catch(error => res.status(400).send(error));
};

module.exports.getUserPage = (req, res) => {
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
    offset, limit
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
};

module.exports.test = (req, res) => {
  return res.status(400).send({
    message: 'Jesus'
  });
};

