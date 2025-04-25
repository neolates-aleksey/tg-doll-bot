require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { initializeDatabase } = require("./config/database");
const startHandler = require("./handlers/start.handler");
const generationHandler = require("./handlers/generation.handler");
const openAIService = require("./services/openai.service");
const userModel = require("./models/user.model");

// Initialize bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Set bot instance for handlers
startHandler.setBot(bot);
generationHandler.setBot(bot);

// Initialize database
initializeDatabase().catch(console.error);

// Handle /start command
bot.onText(/\/start(.+)?/, async (msg, match) => {
  try {
    await startHandler.handle(msg, match);

    const response = await openAIService.generateImage("сгенерируй куклу в стиле Барби");
    console.log(response);
    const imageUrl = response.data[0].url;
    await bot.sendPhoto(chatId, imageUrl);
  } catch (error) {
    console.error("Error in start handler:", error);
    await bot.sendMessage(msg.chat.id, "Sorry, something went wrong. Please try again later.");
  }
});

// Handle /generate command
bot.onText(/\/generate/, async (msg) => {
  try {
    await generationHandler.handle(msg);
  } catch (error) {
    console.error("Error in generate handler:", error);
    await bot.sendMessage(msg.chat.id, "Sorry, something went wrong. Please try again later.");
  }
});

// Handle 'Start' button
bot.onText(/^Начать$/, (msg) => {
  const chatId = msg.chat.id;

  userModel.setUserState(chatId, {
    step: "photos",
    photos: [],
  });
  bot.sendMessage(chatId, "Пожалуйста, отправьте 2-3 фотографии для генерации куклы. После отправки всех фотографий, нажмите кнопку 'Продолжить'.");

  const keyboard = {
    reply_markup: {
      keyboard: [[{ text: "Продолжить" }]],
      resize_keyboard: true,
    },
  };

  bot.sendMessage(chatId, "Отправьте фотографии:", keyboard);
});

// Handle 'Referral' button
bot.onText(/^Реферальная система$/, (msg) => {
  const chatId = msg.chat.id;
  const referralLink = `https://t.me/${process.env.TELEGRAM_USERNAME}?start=${chatId}`;
  bot.sendMessage(chatId, `За каждого приглашенного друга вы получаете 1 бесплатную генерацию. Ссылка для приглашения:\n${referralLink}`);
});

// Handle 'Continue' button after photos
bot.onText(/^Продолжить$/, (msg) => {
  const chatId = msg.chat.id;
  const userState = userModel.getUserState(chatId);

  if (!userState || userState.step !== "photos") return;

  if (userState.photos.length < process.env.BOT_MIN_PHOTOS) {
    bot.sendMessage(chatId, "Пожалуйста, отправьте минимум 2 фотографии перед продолжением.");
    return;
  }

  userState.step = "color";
  userModel.setUserState(chatId, userState);
  bot.sendMessage(chatId, "Напиши цвет коробки в которой будет лежать кукла");
});

// Handle photo messages
bot.on("photo", async (msg) => {
  const chatId = msg.chat.id;
  const userState = userModel.getUserState(chatId);

  if (!userState || userState.step !== "photos") return;

  if (userState.photos.length >= process.env.BOT_MAX_PHOTOS) {
    bot.sendMessage(chatId, "Вы уже отправили максимальное количество фотографий (3). Нажмите 'Продолжить' для следующего шага.");
    return;
  }

  // Get the file_id of the largest photo (best quality)
  const photo = msg.photo[msg.photo.length - 1];
  userState.photos.push(photo.file_id);
  userModel.setUserState(chatId, userState);

  const remainingPhotos = process.env.BOT_MIN_PHOTOS - userState.photos.length;

  if (remainingPhotos > 0) {
    bot.sendMessage(chatId, `Фотография получена! Отправьте еще ${remainingPhotos} фотографию(и) или нажмите 'Продолжить' для следующего шага.`);
  } else {
    bot.sendMessage(chatId, "Все фотографии получены! Нажмите 'Продолжить' для следующего шага.");
  }
});

// Handle text messages for different steps
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userState = userModel.getUserState(chatId);

  if (!userState) return;

  if (userState.step === "color") {
    userState.color = msg.text;
    userState.step = "style";

    const keyboard = {
      reply_markup: {
        keyboard: [[{ text: "Barbie" }], [{ text: "Bratz" }]],
        resize_keyboard: true,
      },
    };

    bot.sendMessage(chatId, "Выбери стиль куклы", keyboard);
  } else if (userState.step === "style") {
    if (msg.text !== "Barbie" && msg.text !== "Bratz") return;

    userState.style = msg.text;
    userState.step = "accessories";

    const keyboard = {
      reply_markup: {
        keyboard: [[{ text: "Back" }]],
        resize_keyboard: true,
      },
    };

    bot.sendMessage(chatId, "Напиши любые аксессуары через запятую. Советуем вводить не более 5-ти аксессуаров", keyboard);
  } else if (userState.step === "accessories") {
    if (msg.text === "Back") {
      userModel.deleteUserState(chatId);
      const keyboard = {
        reply_markup: {
          keyboard: [[{ text: "Начать" }], [{ text: "Реферальная система" }]],
          resize_keyboard: true,
        },
      };
      bot.sendMessage(chatId, "Выберите опцию:", keyboard);
      return;
    }

    userState.accessories = msg.text;
    userState.step = "label";

    const keyboard = {
      reply_markup: {
        keyboard: [[{ text: "Back" }]],
        resize_keyboard: true,
      },
    };

    bot.sendMessage(chatId, "Напиши текст для этикетки на коробке", keyboard);
  } else if (userState.step === "label") {
    if (msg.text === "Back") {
      userState.step = "accessories";
      userModel.setUserState(chatId, userState);
      bot.sendMessage(chatId, "Напиши любые аксессуары через запятую. Советуем вводить не более 5-ти аксессуаров");
      return;
    }

    userState.label = msg.text;
    userState.step = "clothes";

    const keyboard = {
      reply_markup: {
        keyboard: [[{ text: "Back" }]],
        resize_keyboard: true,
      },
    };

    bot.sendMessage(chatId, "Опиши одежду для куклы", keyboard);
  } else if (userState.step === "clothes") {
    await generationHandler.handle(msg);
  }
});
