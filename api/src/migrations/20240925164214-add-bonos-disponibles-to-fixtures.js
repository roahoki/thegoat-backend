'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Fixtures', 'bonos_disponibles', {
      type: Sequelize.INTEGER,
      defaultValue: 40,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Fixtures', 'bonos_disponibles');
  }
};

