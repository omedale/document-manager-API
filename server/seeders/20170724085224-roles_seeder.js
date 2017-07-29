module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Roles',
      [{
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        role: 'success',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        role: 'technology',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        role: 'fellow',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Roles', null, {});
  }
};
