require("dotenv").config();
const { sequelize } = require("../config/database");
const User = require("../models/database/user.model");
const Generation = require("../models/database/generation.model");

// Define the association between User and Generation
User.hasMany(Generation, { foreignKey: "userId" });
Generation.belongsTo(User, { foreignKey: "userId" });

async function viewDatabase() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("Database connection established successfully.\n");

    // Get all users
    const users = await User.findAll({
      include: [
        {
          model: Generation,
          attributes: ["id", "prompt", "createdAt"],
        },
      ],
    });

    console.log("=== Users ===");
    users.forEach((user) => {
      console.log(`\nUser ID: ${user.chatId}`);
      console.log(`Free Generations: ${user.freeGenerations}`);
      console.log(`Referred By: ${user.referredBy || "None"}`);
      console.log(`Referral Count: ${user.referralCount}`);
      console.log(`Created At: ${user.createdAt}`);
      console.log("\nGenerations:");
      user.Generations.forEach((gen) => {
        console.log(`- ID: ${gen.id}`);
        console.log(`  Prompt: ${gen.prompt}`);
        console.log(`  Created: ${gen.createdAt}`);
      });
      console.log("-------------------");
    });

    process.exit(0);
  } catch (error) {
    console.error("Error viewing database:", error);
    process.exit(1);
  }
}

viewDatabase();
