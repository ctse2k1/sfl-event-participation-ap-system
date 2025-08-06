# SFL Event Participation AP System

A Discord bot for tracking event participation and awarding activity points, written in TypeScript using Discord.js v14.

## Overview

This bot helps community managers track participation in events and automatically award activity points based on attendance duration. It uses Discord's slash commands for all interactions, making it intuitive and easy to use for both event hosts and participants.

## Features

- Start events with unique join codes
- Track participant attendance and duration
- Calculate activity points based on participation time and event type
- View personal participation history and points
- View server-wide leaderboard
- Admin commands for managing events
- All commands use Discord's slash command system
- All command responses are ephemeral (only visible to the command user)
- Uses server display names instead of usernames for better identification

## Commands

All commands are subcommands under the main `/event` command:

- `/event start [event_id]` - Start a new event and generate a join code
- `/event join [code]` - Join an active event using a code
- `/event stop` - Stop the event you are hosting and calculate points
- `/event kick [member]` - Remove a participant from your event
- `/event list` - List all participants in your current event
- `/event me` - Show your total activity points and event history
- `/event id` - List all available event codes and their types
- `/event summary` - Display the point leaderboard for the server
- `/event records` - Show all event participation records
- `/event status` - Show your current event participation details
- `/event reset` - Reset all event data and points (Admin only)

## Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file with your Discord bot token:
   ```
   DISCORD_TOKEN=your_token_here
   ```
4. Configure events in `config.json` (see [Configuration](#configuration) section)
5. Build the project with `npm run build`
6. Start the bot with `npm start`

## Configuration

The bot uses a `config.json` file to define event types and their point values. Example:

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

## Development

- `npm run dev` - Run the bot in development mode with hot reloading
- `npm run watch` - Watch for changes and rebuild automatically
- `npm run build` - Build the TypeScript project
- `npm start` - Start the bot

## Requirements

- Node.js 16.9.0 or higher
- Discord.js v14
- TypeScript 5.0.0 or higher

## Documentation

- [Feature Specification](FEATURE_SPECIFICATION.md) - Detailed feature specifications
- [Design Document](DESIGN_DOCUMENT.md) - Technical design and architecture

## License

ISC
