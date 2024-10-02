'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      Usuario.hasMany(models.Request, {
        foreignKey: 'usuarioId', // Foreign key
        as: 'requests'            // Pluralized 'request' to 'requests'
      });
    }
  }

  Usuario.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true, // Added autoIncrement
      },
      billetera: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // Added default value
      },
      auth0Token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Emails should be unique
        validate: {
          isEmail: true, // Validates email format
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: true, // Nueva columna para almacenar la IP
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true, // Nueva columna para almacenar la ubicación
      }
    },
    {
      sequelize,
      modelName: 'Usuario',
      timestamps: false, // If you don't need createdAt and updatedAt
    }
  );

  return Usuario;
};

