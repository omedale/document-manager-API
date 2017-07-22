const LocalStrategy = require('passport-local').Strategy,
  User = require('./models/user').User;

/**
   * Defines Local passport strategy
   * @param {object} passport
   * @return {object} - returns authentication status and object
   */
module.exports = (passport) => {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  (email, password, done) => {
    User.findAll({
      where: {
        email
      }
    }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {
          message: 'Unknown user'
        });
      }
      if (!user.validatePassword(password, user[0].dataValues.password)) {
        return done(null, false, {
          message: 'Invalid password'
        });
      }
      return done(null, user);
    });
  }
  ));
};