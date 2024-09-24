'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Odd extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Odd pertenece a Fixture
      Odd.belongsTo(models.Fixture, {
        foreignKey: 'fixture_id',
        as: 'fixture'
      });
    }
  }
  Odd.init({
    fixture_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    value: DataTypes.STRING,
    odd: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'Odd',
  });
  return Odd;
};
