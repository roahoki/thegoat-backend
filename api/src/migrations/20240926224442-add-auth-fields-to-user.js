'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'auth0Token', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('Users', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
    await queryInterface.addColumn('Users', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // If you want to add validations or default values, include them here
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Users', 'auth0Token');
    await queryInterface.removeColumn('Users', 'email');
    await queryInterface.removeColumn('Users', 'name');
  },
};
