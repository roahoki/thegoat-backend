'use strict';

module.exports = {
  up: async (queryInterface) => {
    // Insert Leagues
    await queryInterface.bulkInsert('Leagues', [
      {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb-eng.svg',
        season: 2024,
        round: 'Regular Season - 10',
        createdAt: new Date('2024-10-28T16:15:01.073Z'),
        updatedAt: new Date('2024-10-28T16:15:01.764Z'),
      },
      {
        id: 140,
        name: 'La Liga',
        country: 'Spain',
        logo: 'https://media.api-sports.io/football/leagues/140.png',
        flag: 'https://media.api-sports.io/flags/es.svg',
        season: 2024,
        round: 'Regular Season - 12',
        createdAt: new Date('2024-10-28T16:15:01.388Z'),
        updatedAt: new Date('2024-10-28T16:15:01.748Z'),
      },
      // Añade otras ligas si es necesario
    ], {});

    // Insert Teams
    await queryInterface.bulkInsert('Teams', [
      // Premier League Teams
      {
        id: 34,
        name: 'Newcastle',
        logo: 'https://media.api-sports.io/football/teams/34.png',
        createdAt: new Date('2024-10-28T16:15:01.768Z'),
        updatedAt: new Date('2024-10-28T16:15:01.768Z'),
      },
      {
        id: 42,
        name: 'Arsenal',
        logo: 'https://media.api-sports.io/football/teams/42.png',
        createdAt: new Date('2024-10-28T16:15:01.698Z'),
        updatedAt: new Date('2024-10-28T16:15:01.771Z'),
      },
      {
        id: 40,
        name: 'Liverpool',
        logo: 'https://media.api-sports.io/football/teams/40.png',
        createdAt: new Date('2024-10-28T16:15:01.163Z'),
        updatedAt: new Date('2024-10-28T16:15:01.701Z'),
      },
      {
        id: 65,
        name: 'Nottingham Forest',
        logo: 'https://media.api-sports.io/football/teams/65.png',
        createdAt: new Date('2024-10-28T16:15:01.681Z'),
        updatedAt: new Date('2024-10-28T16:15:01.681Z'),
      },
      {
        id: 48,
        name: 'West Ham',
        logo: 'https://media.api-sports.io/football/teams/48.png',
        createdAt: new Date('2024-10-28T16:15:01.684Z'),
        updatedAt: new Date('2024-10-28T16:15:01.684Z'),
      },
      // La Liga Teams
      {
        id: 530,
        name: 'Atletico Madrid',
        logo: 'https://media.api-sports.io/football/teams/530.png',
        createdAt: new Date('2024-10-28T16:15:01.727Z'),
        updatedAt: new Date('2024-10-28T16:15:01.750Z'),
      },
      {
        id: 543,
        name: 'Real Betis',
        logo: 'https://media.api-sports.io/football/teams/543.png',
        createdAt: new Date('2024-10-28T16:15:01.428Z'),
        updatedAt: new Date('2024-10-28T16:15:01.724Z'),
      },
      {
        id: 534,
        name: 'Las Palmas',
        logo: 'https://media.api-sports.io/football/teams/534.png',
        createdAt: new Date('2024-10-28T16:15:01.753Z'),
        updatedAt: new Date('2024-10-28T16:15:01.753Z'),
      },
      {
        id: 529,
        name: 'Barcelona',
        logo: 'https://media.api-sports.io/football/teams/529.png',
        createdAt: new Date('2024-10-28T16:15:01.656Z'),
        updatedAt: new Date('2024-10-28T16:15:01.656Z'),
      },
      {
        id: 540,
        name: 'Espanyol',
        logo: 'https://media.api-sports.io/football/teams/540.png',
        createdAt: new Date('2024-10-28T16:15:01.658Z'),
        updatedAt: new Date('2024-10-28T16:15:01.658Z'),
      },
      // Añade otros equipos si es necesario
    ], {});

    // Insert Fixtures
    await queryInterface.bulkInsert('Fixtures', [
      // Fixture 1
      {
        id: 1208118,
        league_id: 39,
        home_team_id: 34,
        away_team_id: 42,
        referee: null,
        timezone: 'UTC',
        date: '2024-11-02T12:30:00.000Z',
        timestamp: 1730550600,
        status_long: 'Not Started',
        status_short: 'NS',
        status_elapsed: null,
        available_bonds: 40,
        createdAt: new Date('2024-10-28T16:15:01.774Z'),
        updatedAt: new Date('2024-10-28T16:15:01.774Z'),
      },
      // Fixture 2
      {
        id: 1208103,
        league_id: 39,
        home_team_id: 42,
        away_team_id: 40,
        referee: 'A. Taylor',
        timezone: 'UTC',
        date: '2024-10-27T16:30:00.000Z',
        timestamp: 1730046600,
        status_long: 'Not Started',
        status_short: 'NS',
        status_elapsed: null,
        available_bonds: 40,
        createdAt: new Date('2024-10-28T16:15:01.704Z'),
        updatedAt: new Date('2024-10-28T16:15:01.704Z'),
      },
      // Fixture 3
      {
        id: 1208594,
        league_id: 140,
        home_team_id: 530,
        away_team_id: 534,
        referee: null,
        timezone: 'UTC',
        date: '2024-11-03T13:00:00.000Z',
        timestamp: 1730638800,
        status_long: 'Not Started',
        status_short: 'NS',
        status_elapsed: null,
        available_bonds: 40,
        createdAt: new Date('2024-10-28T16:15:01.757Z'),
        updatedAt: new Date('2024-10-28T16:15:01.757Z'),
      },
      // Fixture 4
      {
        id: 1212921,
        league_id: 140,
        home_team_id: 529,
        away_team_id: 540,
        referee: null,
        timezone: 'UTC',
        date: '2024-11-03T15:15:00.000Z',
        timestamp: 1730646900,
        status_long: 'Not Started',
        status_short: 'NS',
        status_elapsed: null,
        available_bonds: 40,
        createdAt: new Date('2024-10-28T16:15:01.662Z'),
        updatedAt: new Date('2024-10-28T16:15:01.662Z'),
      },
      // Añade otros fixtures según sea necesario
    ], {});

    // Insert Goals
    await queryInterface.bulkInsert('Goals', [
      {
        id: 22,
        fixture_id: 1208118,
        home: null,
        away: null,
        createdAt: new Date('2024-10-28T16:15:01.779Z'),
        updatedAt: new Date('2024-10-28T16:15:01.779Z'),
      },
      {
        id: 19,
        fixture_id: 1208103,
        home: null,
        away: null,
        createdAt: new Date('2024-10-28T16:15:01.708Z'),
        updatedAt: new Date('2024-10-28T16:15:01.708Z'),
      },
      {
        id: 21,
        fixture_id: 1208594,
        home: null,
        away: null,
        createdAt: new Date('2024-10-28T16:15:01.761Z'),
        updatedAt: new Date('2024-10-28T16:15:01.761Z'),
      },
      {
        id: 17,
        fixture_id: 1212921,
        home: null,
        away: null,
        createdAt: new Date('2024-10-28T16:15:01.665Z'),
        updatedAt: new Date('2024-10-28T16:15:01.665Z'),
      },
      // Añade otros goles según sea necesario
    ], {});

    // Insert Odds
    await queryInterface.bulkInsert('Odds', [
      // Odds para el fixture 1208118
      {
        id: 52,
        fixture_id: 1208118,
        name: 'Match Winner',
        value: 'Home',
        odd: '3.65',
        createdAt: new Date('2024-10-28T16:15:01.783Z'),
        updatedAt: new Date('2024-10-28T16:15:01.783Z'),
      },
      {
        id: 53,
        fixture_id: 1208118,
        name: 'Match Winner',
        value: 'Draw',
        odd: '3.75',
        createdAt: new Date('2024-10-28T16:15:01.786Z'),
        updatedAt: new Date('2024-10-28T16:15:01.786Z'),
      },
      {
        id: 54,
        fixture_id: 1208118,
        name: 'Match Winner',
        value: 'Away',
        odd: '2.05',
        createdAt: new Date('2024-10-28T16:15:01.789Z'),
        updatedAt: new Date('2024-10-28T16:15:01.789Z'),
      },
      // Odds para el fixture 1208103
      {
        id: 46,
        fixture_id: 1208103,
        name: 'Match Winner',
        value: 'Home',
        odd: '2.48',
        createdAt: new Date('2024-10-28T16:15:01.712Z'),
        updatedAt: new Date('2024-10-28T16:15:01.712Z'),
      },
      {
        id: 47,
        fixture_id: 1208103,
        name: 'Match Winner',
        value: 'Draw',
        odd: '3.35',
        createdAt: new Date('2024-10-28T16:15:01.715Z'),
        updatedAt: new Date('2024-10-28T16:15:01.715Z'),
      },
      {
        id: 48,
        fixture_id: 1208103,
        name: 'Match Winner',
        value: 'Away',
        odd: '3.05',
        createdAt: new Date('2024-10-28T16:15:01.718Z'),
        updatedAt: new Date('2024-10-28T16:15:01.718Z'),
      },
      // Odds para el fixture 1208594
      {
        id: 49,
        fixture_id: 1208586,
        name: 'Match Winner',
        value: 'Home',
        odd: '3.25',
        createdAt: new Date('2024-10-28T16:15:01.738Z'),
        updatedAt: new Date('2024-10-28T16:15:01.738Z'),
      },
      {
        id: 50,
        fixture_id: 1208586,
        name: 'Match Winner',
        value: 'Draw',
        odd: '3.25',
        createdAt: new Date('2024-10-28T16:15:01.741Z'),
        updatedAt: new Date('2024-10-28T16:15:01.741Z'),
      },
      {
        id: 51,
        fixture_id: 1208586,
        name: 'Match Winner',
        value: 'Away',
        odd: '2.35',
        createdAt: new Date('2024-10-28T16:15:01.745Z'),
        updatedAt: new Date('2024-10-28T16:15:01.745Z'),
      },
      // Odds para el fixture 1212921
      {
        id: 43,
        fixture_id: 1212921,
        name: 'Match Winner',
        value: 'Home',
        odd: '1.16',
        createdAt: new Date('2024-10-28T16:15:01.670Z'),
        updatedAt: new Date('2024-10-28T16:15:01.670Z'),
      },
      {
        id: 44,
        fixture_id: 1212921,
        name: 'Match Winner',
        value: 'Draw',
        odd: '9',
        createdAt: new Date('2024-10-28T16:15:01.673Z'),
        updatedAt: new Date('2024-10-28T16:15:01.673Z'),
      },
      {
        id: 45,
        fixture_id: 1212921,
        name: 'Match Winner',
        value: 'Away',
        odd: '15',
        createdAt: new Date('2024-10-28T16:15:01.676Z'),
        updatedAt: new Date('2024-10-28T16:15:01.676Z'),
      },
      // Añade otros odds según sea necesario
    ], {});
  },

  down: async (queryInterface) => {
    // Eliminar Odds
    await queryInterface.bulkDelete('Odds', null, {});
    // Eliminar Goals
    await queryInterface.bulkDelete('Goals', null, {});
    // Eliminar Fixtures
    await queryInterface.bulkDelete('Fixtures', null, {});
    // Eliminar Teams
    await queryInterface.bulkDelete('Teams', null, {});
    // Eliminar Leagues
    await queryInterface.bulkDelete('Leagues', null, {});
  },
};
