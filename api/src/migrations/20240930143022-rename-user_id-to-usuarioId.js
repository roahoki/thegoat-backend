'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Requests', 'user_id', 'usuarioId');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Requests', 'usuarioId', 'user_id');
  }
};

