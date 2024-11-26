"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("AuctionOffers", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            auction_id: {
                type: Sequelize.UUID,
                allowNull: false,
            },
            proposal_id: {
                type: Sequelize.UUID,
                allowNull: true,
            },
            fixture_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            league_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            round: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            result: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            group_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("AuctionOffers");
    },
};
