'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AdminRequests', {
      request_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      group_id: {
        type: Sequelize.STRING,
        allowNull: false,
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
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      result: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      deposit_token: {
        type: Sequelize.STRING,
        defaultValue: "",
        allowNull: true,
      },
      datetime: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      seller: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 15, // Valor por defecto
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      wallet: {
        type: Sequelize.BOOLEAN,
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

  async down(queryInterface) {
    await queryInterface.dropTable('AdminRequests');
  },
};
