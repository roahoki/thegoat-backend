'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Fixture extends Model {
    static associate(models) {
      // Asociaciones existentes
      Fixture.belongsTo(models.League, {
        foreignKey: 'league_id',
        as: 'league'
      });

      Fixture.belongsTo(models.Team, {
        foreignKey: 'home_team_id',
        as: 'homeTeam'
      });

      Fixture.belongsTo(models.Team, {
        foreignKey: 'away_team_id',
        as: 'awayTeam'
      });

      Fixture.hasMany(models.Goal, {
        foreignKey: 'fixture_id',
        as: 'goals'
      });

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
    status_elapsed: DataTypes.INTEGER,
    available_bonds: {
      type: DataTypes.INTEGER,
      defaultValue: 40,  // Valor por defecto
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Fixture',
  });

  return Fixture;
};
