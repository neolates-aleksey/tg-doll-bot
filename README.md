# Telegram Doll Generator Bot

A Telegram bot that generates doll images based on user preferences using OpenAI's DALL-E 3 API.

## Features

- Generate custom doll images with specified colors, styles, and accessories
- Upload reference photos to guide the generation process
- Customize box label and doll clothing
- Free generation system with 2 initial generations
- Referral system to earn more free generations
- Interactive button-based interface
- Support for Barbie and Bratz styles

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:

   ```
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   OPENAI_API_KEY=your_openai_api_key_here
   BOT_USERNAME=your_bot_username_here
   ```

   - Get your Telegram bot token from [@BotFather](https://t.me/botfather)
   - Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com)
   - Set your bot username (without @) in the BOT_USERNAME variable

4. Start the bot:
   ```bash
   node index.js
   ```

## Usage

1. Start the bot by sending `/start` command
2. Click "Начать" to begin generating a doll
3. Upload 2-3 reference photos and click "Продолжить"
4. Follow the prompts to specify:
   - Box color
   - Doll style (Barbie or Bratz)
   - Accessories
   - Box label text
   - Doll clothing description
5. Wait for the generated image
6. Use "Реферальная система" button to share your referral link and earn more generations

## Note

- Each user starts with 2 free generations
- Sharing your referral link and having someone start the bot using it will give you 1 additional free generation
- The bot uses OpenAI's DALL-E 3 model for image generation
- Reference photos help guide the generation process for better results
- You can go back to previous steps using the "Back" button
