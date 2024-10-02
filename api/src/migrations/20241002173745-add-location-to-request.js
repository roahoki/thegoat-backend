'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('Requests', 'location', {
          type: Sequelize.STRING,  // Ajusta el tipo de dato según tus necesidades
          allowNull: true,         // Cambia a false si quieres que sea obligatorio
      });
  },
  down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('Requests', 'location');
  }
};

