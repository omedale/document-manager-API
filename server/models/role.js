/**
   * Defines user model
   * @param {object} sequelize
   * @param {object} DataTypes
   * @return {object} - returns instance of the model
   */
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });
  Role.associate = (models) => {
    Role.hasMany(models.User, {
      foreignKey: 'role',
      as: 'myRole',
    });
  };
  return Role;
};