'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      Usuario.hasMany(models.Request, {
        foreignKey: 'request_id',
        as: 'request'
      });

    }
  }

  Usuario.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      billetera: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    },
    {
      sequelize,
      modelName: 'Usuario',
      timestamps: false, // If you don't need createdAt and updatedAt
    }
  );

  return Usuario;
};
