#!/bin/bash

# Stop any running instance
echo "Stopping any running bot instances..."
pkill -f "node dist/index.js" || true

# Pull latest changes
echo "Pulling latest changes from GitHub..."
git pull

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building the project..."
npm run build

# Start the bot in the background
echo "Starting the bot..."
nohup node dist/index.js > bot.log 2>&1 &

echo "Bot has been deployed! Check bot.log for output."
echo "To view logs: tail -f bot.log"