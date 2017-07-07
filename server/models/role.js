
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    access: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });
  return Role;
};