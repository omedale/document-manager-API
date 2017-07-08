

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      }
    },
    usertype: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    phoneno: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  });

  User.prototype.generateHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  User.prototype.validatePassword = (password, savedPassword) => {
    return bcrypt.compareSync(password, savedPassword);
  };

  User.prototype.generateJWT = (id, email, name) => {
    return jwt.sign({
      id,
      email,
      name,
      exp: Math.floor(Date.now() / 1000) + (60 * 60),
    }, 'omedale');
  };

  User.associate = (models) => {
    User.hasMany(models.Document, {
      foreignKey: 'userId',
      as: 'myDocuments',
    });
  };
  return User;
};