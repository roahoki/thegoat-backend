'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Fixtures', [
      {
        id: 1208044,
        league_id: 39,
        home_team_id: 45,
        away_team_id: 35,
        referee: null,
        timezone: 'UTC',
        date: new Date('2024-08-31T14:00:00+00:00'),
        timestamp: 1725112800,
        status_long: 'Not Started',
        status_short: 'NS',
        status_elapsed: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 1208041,
        league_id: 39,
        home_team_id: 42,
        away_team_id: 51,
        referee: null,
        timezone: 'UTC',
        date: new Date('2024-08-31T11:30:00+00:00'),
        timestamp: 1725103800,
        status_long: 'Not Started',
        status_short: 'NS',
        status_elapsed: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Añade más fixtures aquí
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Fixtures', null, {});
  }
};
