'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Usuarios', 'auth0Token', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('Usuarios', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
    await queryInterface.addColumn('Usuarios', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // If you want to add validations or default values, include them here
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Usuarios', 'auth0Token');
    await queryInterface.removeColumn('Usuarios', 'email');
    await queryInterface.removeColumn('Usuarios', 'name');
  },
};
