"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class AuctionOffer extends Model {
        static associate(models) {
        }
    }
    AuctionOffer.init(
        {
            auction_id: {
                type: DataTypes.UUID,
                allowNull: false,
                primarykey: true,
            },
            proposal_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            fixture_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            league_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            round: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            result: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            group_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            type: {
              type: DataTypes.STRING,
              allowNull: false,
            },
            request_id: {
              type: DataTypes.UUID,
              allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "AuctionOffer",
        }
    );
    return AuctionOffer;
};
