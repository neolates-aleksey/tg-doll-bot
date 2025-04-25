require("dotenv").config();

module.exports = {
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  database: {
    path: process.env.DATABASE_PATH || "./database.sqlite",
  },
  app: {
    freeGenerations: 3,
    referralBonus: 1,
  },
};
