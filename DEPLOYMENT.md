# Deployment Guide

This guide explains how to deploy and update the SFL Event Participation AP Bot.

## Initial Deployment

1. Clone the repository:
   ```bash
   git clone https://github.com/ctse2k1/sfl-event-participation-ap-system.git
   cd sfl-event-participation-ap-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Discord bot token:
   ```bash
   echo "DISCORD_TOKEN=your_token_here" > .env
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Start the bot:
   ```bash
   node dist/index.js
   ```

## Using the Deployment Script

We've included a deployment script to make updates easier:

1. Make sure the script is executable:
   ```bash
   chmod +x deploy.sh
   ```

2. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

Note: The script name is `deploy.sh` (not `.deploy.sh`). Make sure to include the `./` prefix when running it.

## Troubleshooting

If you encounter issues with slash commands not appearing or not working:

1. Check the bot logs for errors:
   ```bash
   tail -f bot.log
   ```

2. If commands are not showing up, you may need to:
   - Remove the bot from your server
   - Re-invite the bot using the invite link in INVITE_INSTRUCTIONS.md
   - Wait a few minutes for Discord to update the command cache

3. Verify that your bot has the correct permissions:
   - bot
   - applications.commands

## Running in Production

For production environments, consider using a process manager like PM2:

```bash
# Install PM2
npm install -g pm2

# Start the bot with PM2
pm2 start dist/index.js --name "sfl-event-bot"

# Set PM2 to start on system boot
pm2 startup
pm2 save
```

## Updating the Bot

To update the bot:

1. Pull the latest changes:
   ```bash
   git pull
   ```

2. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

Or manually:

1. Stop the current bot process
2. Pull the latest changes
3. Install dependencies: `npm install`
4. Build the project: `npm run build`
5. Start the bot: `node dist/index.js`