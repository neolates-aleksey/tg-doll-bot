const config = require("../config/config");
const openaiService = require("../services/openai.service");
const databaseService = require("../services/database.service");

class GenerateHandler {
  async handle(msg) {
    const chatId = msg.chat.id;
    const user = await databaseService.getUser(chatId);

    if (user.freeGenerations <= 0) {
      await this.bot.sendMessage(chatId, "У вас закончились бесплатные генерации. Пригласите друзей, чтобы получить больше!");
      return;
    }

    await this.bot.sendMessage(chatId, "Опишите куклу, которую хотите сгенерировать. Например: 'Кукла в стиле аниме с розовыми волосами и в платье'");

    this.bot.on("message", async (responseMsg) => {
      if (responseMsg.chat.id === chatId && responseMsg.text) {
        try {
          const prompt = `Generate a doll image: ${responseMsg.text}`;
          const imageUrl = await openaiService.generateImage(prompt);

          if (imageUrl) {
            await databaseService.decrementFreeGenerations(chatId);
            await this.bot.sendPhoto(chatId, imageUrl, {
              caption: "Вот ваша сгенерированная кукла! У вас осталось " + (user.freeGenerations - 1) + " бесплатных генераций.",
            });
          } else {
            await this.bot.sendMessage(chatId, "Извините, произошла ошибка при генерации изображения. Попробуйте еще раз.");
          }
        } catch (error) {
          console.error("Error generating image:", error);
          await this.bot.sendMessage(chatId, "Извините, произошла ошибка при генерации изображения. Попробуйте еще раз.");
        }
      }
    });
  }

  setBot(bot) {
    this.bot = bot;
  }
}

module.exports = new GenerateHandler();
