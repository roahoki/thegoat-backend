'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Fixture extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Fixture pertenece a una League
      Fixture.belongsTo(models.League, {
        foreignKey: 'league_id',
        as: 'league'
      });

      // Fixture tiene un equipo de local (home_team)
      Fixture.belongsTo(models.Team, {
        foreignKey: 'home_team_id',
        as: 'homeTeam'
      });

      // Fixture tiene un equipo visitante (away_team)
      Fixture.belongsTo(models.Team, {
        foreignKey: 'away_team_id',
        as: 'awayTeam'
      });

      // Fixture tiene muchos Goals
      Fixture.hasMany(models.Goal, {
        foreignKey: 'fixture_id',
        as: 'goals'
      });

      // Fixture tiene muchos Odds
      Fixture.hasMany(models.Odd, {
        foreignKey: 'fixture_id',
        as: 'odds'
      });
    }
  }
  Fixture.init({
    league_id: DataTypes.INTEGER,
    home_team_id: DataTypes.INTEGER,
    away_team_id: DataTypes.INTEGER,
    referee: DataTypes.STRING,
    timezone: DataTypes.STRING,
    date: DataTypes.DATE,
    timestamp: DataTypes.INTEGER,
    status_long: DataTypes.STRING,
    status_short: DataTypes.STRING,
    status_elapsed: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Fixture',
  });
  return Fixture;
};
