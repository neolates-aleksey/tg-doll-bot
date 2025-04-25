const User = require("../models/database/user.model");

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

      const message = `Привет! В этом боте вы можете сгенерировать куклу в любом стиле и цвете и с любыми аксессуарами. У вас ${user.freeGenerations} бесплатных генераций. Чтобы добавить больше, вы можете пригласить друзей по кнопке ниже.`;

      const keyboard = {
        reply_markup: {
          keyboard: [[{ text: "Начать" }], [{ text: "Реферальная система" }]],
          resize_keyboard: true,
        },
      };

      await this.bot.sendMessage(chatId, message, keyboard);
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
