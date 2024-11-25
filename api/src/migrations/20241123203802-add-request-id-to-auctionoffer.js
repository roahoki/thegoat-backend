'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('AuctionOffers', 'request_id', {
      type: Sequelize.UUID,
      allowNull: true, // Puede ser nulo para ofertas de otros equipos
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('AuctionOffers', 'request_id');
  },
};

