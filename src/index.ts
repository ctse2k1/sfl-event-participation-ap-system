import { Client, Collection, Events, GatewayIntentBits, REST, Routes, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { EventConfig, Config } from './types';
import { ensureDataDir } from './utils/dataUtils';

// Load environment variables
config();
const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error('FATAL: DISCORD_TOKEN not found in .env file.');
  process.exit(1);
}

// Create client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Load event configurations
let eventConfigs: Record<string, EventConfig> = {};
try {
  const configFile = fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf8');
  const config: Config = JSON.parse(configFile);
  eventConfigs = Object.fromEntries(
    config.events.map(event => [event.event_id, event])
  );
} catch (error) {
  console.error('FATAL: Could not load or parse config.json. Please ensure it exists and is valid.', error);
  process.exit(1);
}

// Ensure data directory exists
ensureDataDir();

// Create a collection for commands
interface CommandModule {
  data: any;
  execute: (interaction: ChatInputCommandInteraction, eventConfigs?: Record<string, EventConfig>) => Promise<void>;
}

const commands = new Collection<string, CommandModule>();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath)
  .filter(file => (file.endsWith('.js') || file.endsWith('.ts')) && !fs.statSync(path.join(commandsPath, file)).isDirectory());

// Load all command files
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command && 'execute' in command) {
    commands.set(command.data.name, command);
  } else {
    console.warn(`The command at ${filePath} is missing required "data" or "execute" property.`);
  }
}

// Register slash commands when the client is ready
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
  
  try {
    const rest = new REST().setToken(token);
    const commandData = Array.from(commands.values()).map(command => command.data.toJSON());
    
    console.log(`Started refreshing ${commandData.length} application (/) commands.`);
    
    // Get existing commands
    const existingCommands = await rest.get(
      Routes.applicationCommands(readyClient.user.id)
    ) as any[];
    
    console.log(`Found ${existingCommands.length} existing commands.`);
    
    // Delete old commands that are not in the new command set
    const newCommandNames = commandData.map(cmd => cmd.name);
    for (const existingCmd of existingCommands) {
      if (!newCommandNames.includes(existingCmd.name)) {
        console.log(`Deleting old command: ${existingCmd.name}`);
        await rest.delete(
          Routes.applicationCommand(readyClient.user.id, existingCmd.id)
        );
      }
    }
    
    // Register commands globally
    await rest.put(
      Routes.applicationCommands(readyClient.user.id),
      { body: commandData }
    );
    
    console.log(`Successfully reloaded application (/) commands.`);
  } catch (error) {
    console.error('Error registering slash commands:', error);
  }
});

// Handle slash command interactions
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  const command = commands.get(interaction.commandName);
  if (!command) return;
  
  try {
    await command.execute(interaction, eventConfigs);
  } catch (error) {
    console.error(`Error executing command ${interaction.commandName}:`, error);
    
    const errorMessage = 'There was an error while executing this command!';
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral });
    } else {
      await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral });
    }
  }
});

// Login to Discord
client.login(token);