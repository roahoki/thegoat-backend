'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Request extends Model {
    static associate(models) {
      // Definir la asociación con el modelo Usuario
      Request.belongsTo(models.Usuario, {
        foreignKey: 'user_id',
        as: 'usuario'  // El alias que quieras usar para la relación
      });
    }
  }

  Request.init({
    request_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,  // Genera automáticamente un UUID
      allowNull: false,
      primaryKey: true
    },
    group_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fixture_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    league_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    round: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    result: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deposit_token: {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: true
    },
    datetime: {
      type: DataTypes.STRING,  // Cambia a STRING si necesitas otro formato
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    seller: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuarios',  // Nombre de la tabla Usuarios
        key: 'id'
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending'  // Valor por defecto
    }
  }, {
    sequelize,
    modelName: 'Request',
  });

  return Request;
};