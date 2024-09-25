'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      // Definir asociaciones si son necesarias
    }
  }
  Usuario.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    billetera: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Usuario',
    timestamps: false  // Si no necesitas createdAt y updatedAt
  });
  return Usuario;
};
