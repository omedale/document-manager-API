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
    return res.json({
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
            role: req.body.role,
            password: user.generateHash(req.body.password),
            phoneno: req.body.phoneno,
            usertype: 'user',
          })
          .then((registeredUser) => {
            req.logIn(registeredUser, () => {
              const token = user
              .generateJWT(registeredUser.id,
                registeredUser.email,
                registeredUser.name);
              localStorage.setItem('JSONWT', token);
              return res.status(200)
                .json({
                  message: 'successful-reg-login',
                  token,
                  registeredUser });
            });
          })
          .catch(error => res.status(400).send(error));
      } else {
        return res.json({
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
    return res.json({
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
        return res.json({
          message: 'Not an existing user, Please sign up'
        });
      } else {
        if (user.validatePassword(req.body.password,
          response.dataValues.password) === false) {
          return res.json({
            message: 'Invalid Password'
          });
        }
      }
      req.logIn(response.dataValues, () => {
        const token = user.generateJWT(response.dataValues.id,
          response.dataValues.email, response.dataValues.name);
        localStorage.setItem('JSONWT', token);
        // return the token as JSON
        return res.status(200).json({ message: 'successful-login', token });
      });
    })
    .catch(error => res.status(400).send(error));
};

module.exports.listUsers = (req, res) => {
  return User
    .findAll({
      include: [{
        model: Document,
        as: 'myDocuments',
      }],
    })
    .then(user => res.status(200).send(user))
    .catch(error => res.status(400).send(error));
};

module.exports.updateUser = (req, res) => {
  if (req.body.email) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    const errors = req.validationErrors();
    if (errors) {
      return res.json({
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
        return res.json({
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
  }
};

module.exports.findUser = (req, res) => {
  if (!Number.isInteger(Number(req.params.userId))) {
    return res.json({
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
    return res.json({
      message: 'Invalid User ID'
    });
  }
  return User
    .findById(req.params.userId)
    .then((user) => {
      if (!user) {
        return res.status(400).send({
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
};
module.exports.findUserDocument = (req, res) => {
  if (!Number.isInteger(Number(req.params.userId))) {
    return res.json({
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
};

module.exports.searchUser = (req, res) => {
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
  return res.json({
    message: 'Jesus'
  });
};

