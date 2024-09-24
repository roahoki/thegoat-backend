'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Teams', [
      { id: 45, name: 'Everton', logo: 'https://media.api-sports.io/football/teams/45.png', createdAt: new Date(), updatedAt: new Date() },
      { id: 35, name: 'Bournemouth', logo: 'https://media.api-sports.io/football/teams/35.png', createdAt: new Date(), updatedAt: new Date() },
      { id: 42, name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png', createdAt: new Date(), updatedAt: new Date() },
      { id: 51, name: 'Brighton', logo: 'https://media.api-sports.io/football/teams/51.png', createdAt: new Date(), updatedAt: new Date() },
      { id: 55, name: 'Brentford', logo: 'https://media.api-sports.io/football/teams/55.png', createdAt: new Date(), updatedAt: new Date() },
      { id: 41, name: 'Southampton', logo: 'https://media.api-sports.io/football/teams/41.png', createdAt: new Date(), updatedAt: new Date() },
      { id: 49, name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/49.png', createdAt: new Date(), updatedAt: new Date() },
      { id: 52, name: 'Crystal Palace', logo: 'https://media.api-sports.io/football/teams/52.png', createdAt: new Date(), updatedAt: new Date() },
      // Añade más equipos aquí
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Teams', null, {});
  }
};
