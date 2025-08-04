# SFL Event Participation AP Bot

A Discord bot for tracking event participation and awarding activity points, written in TypeScript.

## Features

- Start events with unique join codes
- Track participant attendance and duration
- Calculate activity points based on participation time
- View personal participation history and points
- View server-wide leaderboard
- Admin commands for managing events

## Commands

- `/event start [event_id]` - Start a new event and generate a join code
- `/event join [code]` - Join an active event using a code
- `/event stop` - Stop the event you are hosting and calculate points
- `/event kick [member]` - Remove a participant from your event
- `/event list` - List all participants in your current event
- `/event me` - Show your total activity points and event history
- `/event id` - List all available event IDs and their types
- `/event summary` - Display the point leaderboard for the server
- `/event records` - Show all event participation records
- `/event reset` - Reset all event data and points (Admin only)

## Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file with your Discord bot token:
   ```
   DISCORD_TOKEN=your_token_here
   ```
4. Configure events in `config.json`
5. Build the project with `npm run build`
6. Start the bot with `npm start`

## Development

- `npm run dev` - Run the bot in development mode with hot reloading
- `npm run watch` - Watch for changes and rebuild automatically

## Requirements

- Node.js 16.9.0 or higher
- Discord.js v14
- TypeScript

## License

ISC