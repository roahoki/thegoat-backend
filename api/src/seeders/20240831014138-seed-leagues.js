'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Leagues', [
      {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb.svg',
        season: 2024,
        round: 'Regular Season - 3',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 140,
        name: 'La Liga',
        country: 'Spain',
        logo: 'https://media.api-sports.io/football/leagues/140.png',
        flag: 'https://media.api-sports.io/flags/es.svg',
        season: 2024,
        round: 'Regular Season - 3',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Leagues', null, {});
  }
};
