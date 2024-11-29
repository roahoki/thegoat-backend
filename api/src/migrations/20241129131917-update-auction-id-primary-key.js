'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('AuctionOffers', 'auction_id', {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('AuctionOffers', 'auction_id', {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: false,
        });
    },
};

