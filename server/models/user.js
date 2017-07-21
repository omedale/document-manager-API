

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
   * Defines users model
   * @param {object} sequelize
   * @param {object} DataTypes
   * @return {object} - returns instance of the model
   */
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
    role: {
      type: DataTypes.STRING,
      allowNull: true,
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

  User.prototype.generateJWT = (id, email, name, role) => {
    return jwt.sign({
      id,
      email,
      name,
      role,
      exp: Math.floor(Date.now() / 1000) + (60 * 60),
    }, process.env.JWT_SECRET);
  };

  User.associate = (models) => {
    User.hasMany(models.Document, {
      foreignKey: 'userId',
      as: 'myDocuments',
    });
  };
  return User;
};