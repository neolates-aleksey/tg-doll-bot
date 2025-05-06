const config = require("../config/config");
const userModel = require("../models/user.model");
const databaseService = require("../services/database.service");
const openAIService = require("../services/openai.service");

class GenerationHandler {
  async handle(msg) {
    const chatId = msg.chat.id;
    const userState = userModel.getUserState(chatId);

    if (!userState || userState.step !== "clothes") return;

    if (msg.text === "Back") {
      userState.step = "label";
      userModel.setUserState(chatId, userState);
      await this.bot.sendMessage(
        chatId,
        "Напиши текст для этикетки на коробке"
      );
      return;
    }

    const user = await databaseService.getUser(chatId);
    if (user.freeGenerations <= 0) {
      await this.bot.sendMessage(
        chatId,
        "У вас закончились бесплатные генерации. Используйте реферальную систему чтобы добавить новые генерации"
      );
      return;
    }

    await this.bot.sendMessage(
      chatId,
      "Пожалуйста, подождите. Примерное время генерации 1-2 минуты"
    );

    try {
      const prompt = `Создай куклу по моему фото. Кукла в полный рост и находится внутри коробки. Коробка выполнена из цвета: ${userState.color}, её переднюю часть покрывает прозрачный пластик. Стиль куклы — ${userState.style}. B коробке рядом c куклой размести аксессуары: ${userState.accessories}. Надпись на верхней части коробки: "${userState.label}". Одежда куклы: ${msg.text}.`;

      const response = await openAIService.generateImage(
        prompt,
        userState.photos[0]
      );
      const imageUrl = response;

      await this.bot.sendPhoto(chatId, imageUrl);
      await databaseService.decrementFreeGenerations(chatId);

      const updatedUser = await databaseService.getUser(chatId);
      await this.bot.sendMessage(
        chatId,
        `Генераций осталось: ${updatedUser.freeGenerations}`
      );
    } catch (error) {
      console.error("Error generating image:", error);
      await this.bot.sendMessage(
        chatId,
        `Извините, произошла ошибка при генерации изображения: ${error.message}`
      );
    }

    userModel.deleteUserState(chatId);
  }

  setBot(bot) {
    this.bot = bot;
  }
}

module.exports = new GenerationHandler();
