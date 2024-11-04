'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ExternalRequests', 'wallet', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    console.log(Sequelize);
    await queryInterface.removeColumn('ExternalRequests', 'wallet');
  }
};

