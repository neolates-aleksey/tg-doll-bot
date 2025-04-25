const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const User = sequelize.define("User", {
  chatId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  freeGenerations: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
  },
  referredBy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  referralCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = User;
