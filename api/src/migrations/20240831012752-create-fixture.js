'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Fixtures', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      league_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Leagues',
          key: 'id'
        }
      },
      home_team_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Teams',
          key: 'id'
        }
      },
      away_team_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Teams',
          key: 'id'
        }
      },
      referee: {
        type: Sequelize.STRING
      },
      timezone: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATE
      },
      timestamp: {
        type: Sequelize.INTEGER
      },
      status_long: {
        type: Sequelize.STRING
      },
      status_short: {
        type: Sequelize.STRING
      },
      status_elapsed: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('Fixtures');
  }
};