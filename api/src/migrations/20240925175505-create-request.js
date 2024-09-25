'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Requests', {
      request_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      group_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fixture_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      league_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      round: {
        type: Sequelize.STRING,
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      result: {
        type: Sequelize.STRING,
        allowNull: false
      },
      deposit_token: {
        type: Sequelize.STRING,
        defaultValue: "",
        allowNull: true
      },
      datetime: {
        type: Sequelize.STRING,  // Si estás usando strings para la fecha
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      seller: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Usuarios',  // Referencia a la tabla Usuarios
          key: 'id'
        }
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending'
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Requests');
  }
};
