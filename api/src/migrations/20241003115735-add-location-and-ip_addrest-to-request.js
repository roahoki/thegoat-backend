'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar las columnas 'location' e 'ip_address'
    await queryInterface.addColumn('Requests', 'location', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.addColumn('Requests', 'ip_address', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    // Eliminar las columnas en caso de deshacer la migración
    await queryInterface.removeColumn('Requests', 'location');
    await queryInterface.removeColumn('Requests', 'ip_address');
  }
};
