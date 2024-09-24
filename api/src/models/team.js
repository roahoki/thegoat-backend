'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Un Team puede ser el equipo local en muchos Fixtures
      Team.hasMany(models.Fixture, {
        foreignKey: 'home_team_id',
        as: 'homeFixtures'
      });

      // Un Team puede ser el equipo visitante en muchos Fixtures
      Team.hasMany(models.Fixture, {
        foreignKey: 'away_team_id',
        as: 'awayFixtures'
      });
    }
  }
  Team.init({
    name: DataTypes.STRING,
    logo: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Team',
  });
  return Team;
};
