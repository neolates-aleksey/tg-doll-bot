const User = require("../models/database/user.model");
const fs = require("fs");
const openAIService = require("../services/openai.service");
const path = require("path");

class StartHandler {
  async handle(msg, match) {
    const chatId = msg.chat.id;
    const referrer = match[1] ? match[1].trim() : null;

    try {
      // Find or create user
      const [user] = await User.findOrCreate({
        where: { chatId: chatId.toString() },
        defaults: {
          freeGenerations: process.env.FREE_GENERATIONS_LIMIT || 5,
          referralCount: 0,
        },
      });

      // Handle referral
      if (referrer) {
        const referrerId = referrer.toString();
        if (referrerId && referrerId !== chatId.toString()) {
          const referrerUser = await User.findByPk(referrerId);
          if (referrerUser) {
            // Update referral information
            await user.update({ referredBy: referrerId });
            await referrerUser.increment("referralCount");
            await referrerUser.increment("freeGenerations");

            await this.bot.sendMessage(referrerId, "Вы получили 1 бесплатную генерацию от приглашенного друга!");
          }
        }
      }

      const response = await openAIService.generateImage("generate doll with red hair");
      const imageUrl = response.data[0].url;
      await this.bot.sendPhoto(chatId, imageUrl);

      const message = `
Этот бот создаёт уникальных кукол по твоему описанию

🎁 Количество твоих генераций: <b>${user.freeGenerations}</b>
✨ Хочешь больше?
- Пригласи друзей (+1 за каждого)
- Купи нужное количество генераций

👇 Опиши куклу — и получи шедевр!
`;

      // Пути к изображениям (замените на реальные пути к вашим изображениям)
      const image1Path = path.join(__dirname, "../assets/1.png");
      const image2Path = path.join(__dirname, "../assets/2.png");

      // Проверяем, существуют ли файлы
      if (fs.existsSync(image1Path) && fs.existsSync(image2Path)) {
        // Создаем массив медиа-объектов для sendMediaGroup
        const mediaGroup = [
          {
            type: "photo",
            media: fs.createReadStream(image1Path),
            caption: message,
            parse_mode: "HTML",
          },
          {
            type: "photo",
            media: fs.createReadStream(image2Path),
          },
        ];

        // Отправляем группу медиафайлов
        await this.bot.sendMediaGroup(chatId, mediaGroup);
      } else {
        // Если файлы не найдены, отправляем только текст с клавиатурой
        const keyboard = {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Начать", callback_data: "start_generation" }],
              [{ text: "Реферальная система", callback_data: "referral_system" }],
              [{ text: "Купить генерации", callback_data: "buy_generations" }],
            ],
          },
        };

        await this.bot.sendMessage(chatId, message, { ...keyboard, parse_mode: "HTML" });
      }

      // Отправляем клавиатуру отдельным сообщением, если отправляем медиагруппу
      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Начать", callback_data: "start_generation" }],
            [{ text: "Реферальная система", callback_data: "referral_system" }],
            [{ text: "Купить генерации", callback_data: "buy_generations" }],
          ],
        },
      };

      await this.bot.sendMessage(chatId, "Выберите действие:", keyboard);
    } catch (error) {
      console.error("Error in start handler:", error);
      await this.bot.sendMessage(chatId, "Извините, произошла ошибка. Пожалуйста, попробуйте позже.");
    }
  }

  setBot(bot) {
    this.bot = bot;
  }
}

module.exports = new StartHandler();
