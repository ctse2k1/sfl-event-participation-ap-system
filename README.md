# 🎮 SFL Event Participation Activity Points (AP) System

## Overview

The SFL Event Participation AP System is a powerful Discord bot designed to streamline community event tracking and reward participation. Built with TypeScript and Discord.js v14, this bot provides an intuitive way to manage events, track attendance, and award activity points automatically.

## 🌟 Key Features

- 🚀 Easy event creation with unique join codes
- 📊 Automatic attendance and duration tracking
- 🏆 Dynamic activity points calculation
- 📈 Personal and server-wide point tracking
- 👥 Flexible event management
- 🔒 Secure, ephemeral command responses

## 🤖 Commands Overview

All commands are subcommands under `/event`:

| Command | Description | 
|---------|-------------|
| `/event start [event_id]` | Start a new event and generate a join code |
| `/event join [code]` | Join an active event using a code |
| `/event stop` | Stop your event and calculate points |
| `/event kick [member]` | Remove a participant from your event |
| `/event list` | List participants in your current event |
| `/event me` | View your total activity points and event history |
| `/event id` | List available event codes and types |
| `/event summary` | Display server-wide point leaderboard |
| `/event records` | Show your event participation records |
| `/event status` | Check your current event participation |
| `/event reset` | Reset all event data (Admin only) |

## 🛠 Setup and Installation

### Prerequisites
- Node.js 16.9.0+
- Discord Bot Token

### Installation Steps
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your Discord bot token:
   ```
   DISCORD_TOKEN=your_discord_bot_token_here
   ```
4. Configure event types in `config.json`
5. Build the project:
   ```bash
   npm run build
   ```
6. Start the bot:
   ```bash
   npm start
   ```

## 🔧 Configuration

The `config.json` file defines event types and point rates:

```json
{
  "events": {
    "raid": {
      "event_id": "1",
      "event_type": "Raid",
      "points_per_minute": 1.0
    },
    "dungeon": {
      "event_id": "2",
      "event_type": "Dungeon Run",
      "points_per_minute": 0.8
    },
    "pvp": {
      "event_id": "3",
      "event_type": "PvP Tournament",
      "points_per_minute": 1.2
    }
  }
}
```

## 💻 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Development mode with hot reloading |
| `npm run watch` | Watch for changes and rebuild |
| `npm run build` | Build TypeScript project |
| `npm start` | Start the bot |

## 📚 Additional Documentation

- [Feature Specification](FEATURE_SPECIFICATION.md)
- [Design Document](DESIGN_DOCUMENT.md)

## 🔒 Permissions

- Requires Discord bot permissions to manage server interactions
- Admin commands restricted to server administrators

## 📝 License

ISC License

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before getting started.

## 🐛 Issues and Support

Found a bug? Have a suggestion? [Open an issue](https://github.com/ctse2k1/sfl-event-participation-ap-system/issues) on our GitHub repository.
