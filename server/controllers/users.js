const User = require('../models').User;
const Document = require('../models').Document;

module.exports.signUp = (req, res) => {
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
            name: req.body.name,
            email: req.body.email,
            password: user.generateHash(req.body.password),
            phoneno: req.body.phoneno,
            usertype: 'user',
          })
          .then((registeredUser) => {
            req.logIn(registeredUser, () => {
              const token = user.generateJWT(registeredUser.id, registeredUser.email, registeredUser.name);
              localStorage.setItem('JSONWT', token);
              return res.status(200)
                .json({ message: 'successful-reg-login', token, registeredUser });
            });
          })
          .catch(error => res.status(400).send(error));
      } else {
        return res.json({
          message: 'Existing user cannot sign up again. Please sign in'
        });
      }
    })
    .catch(error => res.status(400).send(error));
};

module.exports.signIn = (req, res) => {
  User.find({
    where: {
      email: req.body.email
    }
  })
    .then((response) => {
      const user = new User();
      if (!response.dataValues) {
        return res.json({
          message: 'Not an existing user, Please sign up'
        });
      } else {
        if (user.validatePassword(req.body.password, response.dataValues.password) === false) {
          return res.json({
            message: 'Invalid Password'
          });
        }
      }
      req.logIn(response.dataValues, () => {
        const token = user.generateJWT(response.dataValues.id, response.dataValues.email, response.dataValues.name);
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

module.exports.test = (req, res) => {
  return res.json({
    message: 'Jesus'
  });
};

module.exports.updateUser = (req, res) => {
  if (req.body.email) {
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
        .then(() => res.status(200).send({ message: 'User deleted successfully.' }))
        .catch(error => res.status(400).send(error));
    })
    .catch(error => res.status(400).send(error));
};
