# TG Doll Bot

A Telegram bot that generates AI-powered image generation with user management and referral system.

## Features

- 🎨 AI Image Generation using OpenAI's DALL-E
- 👥 User Management System
- 💰 Referral System with rewards
- ⚙️ Admin Panel for bot management
- 📊 Usage Statistics and Analytics
- 🔒 Rate Limiting and Usage Quotas
- 💳 Premium Features Support

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- OpenAI API Key

## Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/tg-doll-bot.git
cd tg-doll-bot
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:

- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token from [@BotFather](https://t.me/BotFather)
- `OPENAI_API_KEY`: Your OpenAI API key
- `DATABASE_PATH`: Path to SQLite database file (default: ./data/bot.db)
- `FREE_GENERATIONS_LIMIT`: Number of free generations per user (default: 5)

5. Initialize the database:

```bash
npm run init-db
```

6. Start the bot:

```bash
npm start
```

## Development

- `npm run dev`: Start in development mode with hot reload
- `npm test`: Run tests
- `npm run lint`: Run linter
- `npm run init-db`: Initialize the database

## Bot Commands

- `/start` - Start the bot and get welcome message
- `/help` - Show help information
- `/generate <prompt>` - Generate an image based on your prompt
- `/balance` - Check your generation credits
- `/referral` - Get your referral link
- `/stats` - View your generation statistics

## Admin Commands

- `/admin` - Access admin panel
- `/users` - View user statistics
- `/broadcast` - Send message to all users
- `/addcredits <user_id> <amount>` - Add credits to user

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
