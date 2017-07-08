const User = require('../models').User;

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
          .then(user => res.status(201).send({
            message: 'Registration Successful'
          }))
          .catch(error => res.status(400).send(error));
      } else {
        return res.json({
          message: 'Existing user cannot sign up again. Please sign in'
        });
      }
    })
    .catch((error) => res.status(400).send(error));
};