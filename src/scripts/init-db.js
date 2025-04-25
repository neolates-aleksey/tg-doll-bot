require("dotenv").config();
const { initializeDatabase } = require("../config/database");
const User = require("../models/database/user.model");
const Generation = require("../models/database/generation.model");

// Define the association between User and Generation
User.hasMany(Generation, { foreignKey: "userId" });
Generation.belongsTo(User, { foreignKey: "userId" });

async function initDatabase() {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Create tables
    await User.sync({ force: true });
    await Generation.sync({ force: true });

    console.log("Database initialized successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

initDatabase();
