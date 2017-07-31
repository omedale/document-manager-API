

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
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
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
    }, process.env.JWT_SECRET, { expiresIn: '24h' });
  };

  User.associate = (models) => {
    User.hasMany(models.Document, {
      foreignKey: 'userId',
      as: 'myDocuments',
    });
    User.belongsTo(models.Role, {
      foreignKey: 'role',
      onDelete: 'CASCADE',
    });
  };
  return User;
};