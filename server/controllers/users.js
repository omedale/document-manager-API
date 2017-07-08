const User = require('../models').User;
const Document = require('../models').Document;

module.exports.signUp = (req, res) =>  {
  User.findAll({
    where: {
      email: req.body.email
    }
  })
    .then((response) => {
      if (response.length === 0) {
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
    .catch((error) => res.status(400).send(error));
};

module.exports.signIn = (req, res) =>  {
  User.findAll({
    where: {
      email: req.body.email
    }
  })
    .then((response) => {
      const user = new User();
      if (response.length === 0) {
        return res.json({
          message: 'Not an existing user, Please sign up'
        });
      } else {
        if(user.validatePassword(req.body.password, response[0].dataValues.password) === false) {
          return res.json({
            message: 'Invalid Password'
          });
        }
      }
      req.logIn(response[0].dataValues, () => {
        const token = user.generateJWT(response[0].dataValues.id, response[0].dataValues.email, response[0].dataValues.name);
        localStorage.setItem('JSONWT', token);
        // return the token as JSON
        return res.status(200).json({ message: 'successful-login', token });
      });
    })
    .catch((error) => res.status(400).send(error));
};

module.exports.listUsers = (req, res) =>  {
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

module.exports.test = (req, res) =>  {
  return res.json({
    message: 'Jesus'
  });
};