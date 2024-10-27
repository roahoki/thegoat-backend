'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    // Verificar si la columna 'location' existe
    const tableDescription = await queryInterface.describeTable('Requests');
    if (tableDescription.location) {
      // Eliminar la columna 'location' si existe
      await queryInterface.removeColumn('Requests', 'location');
    }
  },
  down: async (queryInterface, Sequelize) => {
    // Reagregar la columna 'location' en caso de deshacer la migración
    await queryInterface.addColumn('Requests', 'location', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};