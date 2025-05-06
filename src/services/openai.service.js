const OpenAI = require("openai");
const { HttpsProxyAgent } = require("https-proxy-agent");
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const fs = require("fs");
const { toFile } = require("openai");

class OpenAIService {
  constructor() {
    const config = {
      apiKey: process.env.OPENAI_API_KEY,
    };

    if (process.env.HTTPS_PROXY) {
      config.httpAgent = new HttpsProxyAgent(process.env.HTTPS_PROXY);
    }

    this.openai = new OpenAI(config);
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
  }

  async downloadPhoto(fileId) {
    try {
      const file = await this.bot.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

      const response = await axios.get(fileUrl, {
        responseType: "arraybuffer",
      });

      const imageBuffer = response.data;
      const imageStream = fs.createReadStream(Buffer.from(imageBuffer));

      // Prepare the image for OpenAI
      const openAIFile = await toFile(imageStream, "telegram_photo.jpg", {
        type: "image/jpeg", // Telegram typically sends JPEGs
      });

      return openAIFile;

      // // Download image and convert to base64
      // const response = await axios.get(fileUrl, {
      //   responseType: "arraybuffer",
      //   headers: {
      //     Accept: "image/*",
      //   },
      // });

      // if (!response.data) {
      //   throw new Error("No data received from Telegram");
      // }

      // // Convert to base64 with proper format
      // const base64Image = `data:image/jpeg;base64,${Buffer.from(
      //   response.data
      // ).toString("base64")}`;

      // return base64Image;
    } catch (error) {
      console.log(error);
    }
  }

  async generateImage(prompt, referencePhoto) {
    // try {

    let base64Image = null;
    if (referencePhoto) {
      base64Image = await this.downloadPhoto(referencePhoto);
    }

    // const response = await this.openai.images.edit({
    //   model: "gpt-image-1",
    //   prompt: prompt,
    //   n: 1,
    //   quality: "low",
    //   size: "1024x1536",
    //   image: [base64Image],
    // });

    // console.log(response);

    if (!response.data || !response.data[0] || !response.data[0].url) {
      throw new Error("Invalid response format from OpenAI API");
    }

    return response.data[0].url;
    // } catch (error) {
    //   console.error("Error generating image:", {
    //     message: error.message,
    //     status: error.status,
    //     type: error.type,
    //     code: error.code,
    //     details: error.details || "No additional details",
    //     prompt: prompt,
    //   });
    // }
  }
}

module.exports = new OpenAIService();
