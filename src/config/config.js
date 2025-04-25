require("dotenv").config();

module.exports = {
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN,
    username: process.env.BOT_USERNAME,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    proxy: process.env.HTTPS_PROXY,
  },
  bot: {
    initialGenerations: 1,
    maxPhotos: 3,
    minPhotos: 2,
  },
};
