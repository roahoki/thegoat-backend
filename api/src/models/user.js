'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {

      User.hasMany(models.Job, {
        foreignKey: 'user_id', // Foreign key in Job model
        as: 'jobs'             // Alias for the association
      });
      User.hasMany(models.Request, {
        foreignKey: 'user_id', // Foreign key

        as: 'requests'            // Pluralized 'request' to 'requests'
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true, // Added autoIncrement
      },
      wallet: {
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
      isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
      timestamps: false, // If you don't need createdAt and updatedAt
    }
  );

  return User;
};

