const OpenAI = require("openai");
const { HttpsProxyAgent } = require("https-proxy-agent");

class OpenAIService {
  constructor() {
    const config = {
      apiKey: process.env.OPENAI_API_KEY,
    };

    // Add proxy configuration if HTTPS_PROXY is set
    if (process.env.HTTPS_PROXY) {
      config.httpAgent = new HttpsProxyAgent(process.env.HTTPS_PROXY);
    }

    this.openai = new OpenAI(config);
  }

  async generateImage(prompt) {
    try {
      console.log("Generating image with prompt:", prompt);

      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid",
      });

      if (!response.data || !response.data[0] || !response.data[0].url) {
        throw new Error("Invalid response format from OpenAI API");
      }

      return response.data[0].url;
    } catch (error) {
      console.error("Error generating image:", {
        message: error.message,
        status: error.status,
        type: error.type,
        code: error.code,
        details: error.details || "No additional details",
        prompt: prompt,
      });
      throw error;
    }
  }
}

module.exports = new OpenAIService();
