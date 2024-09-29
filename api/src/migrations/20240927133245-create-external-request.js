'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ExternalRequests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      request_id: {
        type: Sequelize.UUID
      },
      group_id: {
        type: Sequelize.STRING
      },
      fixture_id: {
        type: Sequelize.INTEGER
      },
      league_name: {
        type: Sequelize.STRING
      },
      round: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATE
      },
      result: {
        type: Sequelize.STRING
      },
      deposit_token: {
        type: Sequelize.STRING
      },
      datetime: {
        type: Sequelize.STRING
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      seller: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ExternalRequests');
  }
};