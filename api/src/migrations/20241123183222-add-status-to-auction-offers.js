module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('AuctionOffers', 'type', {
          type: Sequelize.STRING,
          allowNull: false
      });
  },
  down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('AuctionOffers', 'type');
  }
};
