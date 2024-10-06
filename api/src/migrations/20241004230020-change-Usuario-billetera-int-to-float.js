'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Usuarios', 'billetera', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Usuarios', 'billetera', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  }
};