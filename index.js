require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Store user states and data
const userStates = new Map();
const userGenerations = new Map();

// Handle /start command
bot.onText(/\/start(.+)?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const referrer = match[1] ? match[1].trim() : null;

  // Initialize user data if not exists
  if (!userGenerations.has(chatId)) {
    userGenerations.set(chatId, {
      freeGenerations: 2,
      referredBy: null,
    });
  }

  // Handle referral
  if (referrer) {
    const referrerId = parseInt(referrer);
    if (referrerId && referrerId !== chatId) {
      const referrerData = userGenerations.get(referrerId);
      if (referrerData) {
        referrerData.freeGenerations += 1;
        userGenerations.set(referrerId, referrerData);
        bot.sendMessage(referrerId, "Вы получили 1 бесплатную генерацию от приглашенного друга!");
      }
    }
  }

  const userData = userGenerations.get(chatId);
  const message = `Привет! В этом боте вы можете сгенерировать куклу в любом стиле и цвете и с любыми аксессуарами. У вас ${userData.freeGenerations} бесплатных генераций. Чтобы добавить больше, вы можете пригласить друзей по кнопке ниже.`;

  const keyboard = {
    reply_markup: {
      keyboard: [[{ text: "Начать" }], [{ text: "Реферальная система" }]],
      resize_keyboard: true,
    },
  };

  bot.sendMessage(chatId, message, keyboard);
});

// Handle 'Start' button
bot.onText(/^Начать$/, (msg) => {
  const chatId = msg.chat.id;
  userStates.set(chatId, {
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
  const botUsername = process.env.BOT_USERNAME;
  const referralLink = `https://t.me/${botUsername}?start=${chatId}`;
  bot.sendMessage(chatId, `За каждого приглашенного друга вы получаете 1 бесплатную генерацию. Ссылка для приглашения:\n${referralLink}`);
});

// Handle 'Continue' button after photos
bot.onText(/^Продолжить$/, (msg) => {
  const chatId = msg.chat.id;
  const userState = userStates.get(chatId);

  if (!userState || userState.step !== "photos") return;

  if (userState.photos.length < 2) {
    bot.sendMessage(chatId, "Пожалуйста, отправьте минимум 2 фотографии перед продолжением.");
    return;
  }

  userState.step = "color";
  userStates.set(chatId, userState);
  bot.sendMessage(chatId, "Напиши цвет коробки в которой будет лежать кукла");
});

// Handle photo messages
bot.on("photo", async (msg) => {
  const chatId = msg.chat.id;
  const userState = userStates.get(chatId);

  if (!userState || userState.step !== "photos") return;

  if (userState.photos.length >= 3) {
    bot.sendMessage(chatId, "Вы уже отправили максимальное количество фотографий (3). Нажмите 'Продолжить' для следующего шага.");
    return;
  }

  // Get the file_id of the largest photo (best quality)
  const photo = msg.photo[msg.photo.length - 1];
  userState.photos.push(photo.file_id);
  userStates.set(chatId, userState);

  const remainingPhotos = 3 - userState.photos.length;
  if (remainingPhotos > 0) {
    bot.sendMessage(chatId, `Фотография получена! Отправьте еще ${remainingPhotos} фотографию(и) или нажмите 'Продолжить' для следующего шага.`);
  } else {
    bot.sendMessage(chatId, "Все фотографии получены! Нажмите 'Продолжить' для следующего шага.");
  }
});

// Handle color input
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userState = userStates.get(chatId);

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
      userStates.delete(chatId);
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
      userStates.set(chatId, userState);
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
    if (msg.text === "Back") {
      userState.step = "label";
      userStates.set(chatId, userState);
      bot.sendMessage(chatId, "Напиши текст для этикетки на коробке");
      return;
    }

    const userData = userGenerations.get(chatId);
    if (userData.freeGenerations <= 0) {
      bot.sendMessage(chatId, "У вас закончились бесплатные генерации. Используйте реферальную систему чтобы добавить новые генерации");
      return;
    }

    bot.sendMessage(chatId, "Пожалуйста, подождите. Примерное время генерации 1-2 минуты");

    try {
      // Create a prompt that includes information about the uploaded photos
      const photoCount = userState.photos.length;
      let photoReference = "";

      if (photoCount > 0) {
        // Create a reference to each photo in the prompt
        photoReference = "Use these reference photos for style and details: ";
        userState.photos.forEach((fileId, index) => {
          photoReference += `[Photo ${index + 1}: ${fileId}] `;
        });
      }

      const prompt = `Создай куклу по моему фото. Кукла в полный рост и находится внутри коробки. Коробка выполнена из ${userState.color}, её переднюю часть покрывает прозрачный пластик. Стиль куклы — ${userState.style}. В коробке рядом с куклой размести аксессуары: ${userState.accessories}. Надпись на верхней части коробки: "${userState.label}". Одежда куклы: ${msg.text}. Примеры фотографий: ${photoReference}`;

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });

      const imageUrl = response.data[0].url;
      await bot.sendPhoto(chatId, imageUrl);

      userData.freeGenerations -= 1;
      userGenerations.set(chatId, userData);

      bot.sendMessage(chatId, `Генераций осталось: ${userData.freeGenerations}`);
    } catch (error) {
      console.error("Error generating image:", error);
      bot.sendMessage(chatId, "Извините, произошла ошибка при генерации изображения. Пожалуйста, попробуйте снова.");
    }

    userStates.delete(chatId);
  }
});
