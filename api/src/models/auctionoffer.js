"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class AuctionOffer extends Model {
        static associate(models) {
        }
    }
    AuctionOffer.init(
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            auction_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            proposal_id: {
                type: DataTypes.UUID,
                allowNull: true,
                validate: {
                    isUUIDorEmpty(value) {
                        if (value !== null && value !== "" && !/^[0-9a-fA-F-]{36}$/.test(value)) {
                            throw new Error("proposal_id must be a valid UUID or an empty string");
                        }
                    },
                },
                set(value) {
                    if (value === "") {
                        this.setDataValue("proposal_id", null);
                    } else {
                        this.setDataValue("proposal_id", value);
                    }
                },
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
