'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ExternalRequest extends Model {
    static associate(models) {
    }
  }

  ExternalRequest.init({
    request_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
      type: DataTypes.STRING,
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
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'ExternalRequest',
  });

  return ExternalRequest;
};
