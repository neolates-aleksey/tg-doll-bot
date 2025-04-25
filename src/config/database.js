const { Sequelize } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env.DATABASE_PATH || path.join(__dirname, "../../data/bot.db"),
  logging: false,
});

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Sync all models
    await sequelize.sync();
    console.log("Database models synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
}

module.exports = {
  sequelize,
  initializeDatabase,
};
