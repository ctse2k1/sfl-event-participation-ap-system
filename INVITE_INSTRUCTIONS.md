# How to Add Your Bot to a Discord Server

## Step 1: Generate an OAuth2 URL

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click on your application ("SFL Event Participation AP Bot")
3. In the left sidebar, click on "OAuth2"
4. In the OAuth2 URL Generator section, select the following scopes:
   - `bot`
   - `applications.commands`
5. In the Bot Permissions section, select the following permissions:
   - Read Messages/View Channels
   - Send Messages
   - Embed Links
   - Read Message History
   - Use Slash Commands
   - (You can add more permissions if needed for future features)
6. Copy the generated URL at the bottom of the page

## Step 2: Invite the Bot to Your Server

1. Paste the URL you copied into your web browser
2. Select the server you want to add the bot to from the dropdown menu
3. Click "Authorize"
4. Complete the CAPTCHA verification if prompted
5. The bot should now appear in your server's member list

## Step 3: Start the Bot

1. Make sure your bot is running with:
   ```
   npm start
   ```
2. The bot should show as "Online" in your server

## Step 4: Test the Bot

1. Try using one of the slash commands, such as `/event id` to see if the bot responds
2. If the slash commands don't appear immediately, it may take up to an hour for Discord to register them globally

## Troubleshooting

- If slash commands don't appear, make sure the bot has the `applications.commands` scope
- If the bot doesn't respond, check your console logs for any errors
- Ensure your `.env` file contains the correct Discord token
- Make sure the bot has the necessary permissions in your server

## Note on Bot Token Security

Your bot token should be kept secret. It's already in your `.env` file, but never share it publicly or commit it to a public repository.