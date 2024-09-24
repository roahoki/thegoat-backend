'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Goal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Goal pertenece a un Fixture
      Goal.belongsTo(models.Fixture, {
        foreignKey: 'fixture_id',
        as: 'fixture'
      });
    }
  }
  Goal.init({
    fixture_id: DataTypes.INTEGER,
    home: DataTypes.INTEGER,
    away: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Goal',
  });
  return Goal;
};
