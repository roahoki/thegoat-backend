'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Eliminar la columna 'location'
    await queryInterface.removeColumn('Requests', 'location');
  },
  down: async (queryInterface, Sequelize) => {
    // Reagregar la columna 'location' en caso de deshacer la migración
    await queryInterface.addColumn('Requests', 'location', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};

