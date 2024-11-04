'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Fixtures', 'available_bonds', {
      type: Sequelize.INTEGER,
      defaultValue: 40,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    console.log(Sequelize);
    await queryInterface.removeColumn('Fixtures', 'available_bonds');
  }
};

