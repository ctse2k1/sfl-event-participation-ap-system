import { SlashCommandBuilder } from 'discord.js';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { EventConfig } from '../types';

// Import all subcommand handlers
import * as startCommand from './subcommands/start';
import * as joinCommand from './subcommands/join';
import * as stopCommand from './subcommands/stop';
import * as kickCommand from './subcommands/kick';
import * as listCommand from './subcommands/list';
import * as meCommand from './subcommands/me';
import * as idCommand from './subcommands/id';
import * as summaryCommand from './subcommands/summary';
import * as recordsCommand from './subcommands/records';
import * as resetCommand from './subcommands/reset';
import * as statusCommand from './subcommands/status';

// Create the main event command with all subcommands
export const data = new SlashCommandBuilder()
  .setName('event')
  .setDescription('Manage events and participation')
  
  // Start subcommand
  .addSubcommand(subcommand => 
    subcommand
      .setName('start')
      .setDescription('Starts a new event and generates a join code.')
      .addStringOption(option =>
        option.setName('event_id')
          .setDescription('The unique ID of the event to start.')
          .setRequired(true)
      )
  )
  
  // Join subcommand
  .addSubcommand(subcommand => 
    subcommand
      .setName('join')
      .setDescription('Joins an active event using a code.')
      .addStringOption(option =>
        option.setName('code')
          .setDescription('The 4-character code for the event.')
          .setRequired(true)
      )
  )
  
  // Stop subcommand
  .addSubcommand(subcommand => 
    subcommand
      .setName('stop')
      .setDescription('Stops the event you are hosting and calculates points.')
  )
  
  // Kick subcommand
  .addSubcommand(subcommand => 
    subcommand
      .setName('kick')
      .setDescription('Removes a participant from your event.')
      .addUserOption(option =>
        option.setName('member')
          .setDescription('The member to remove from the event.')
          .setRequired(true)
      )
  )
  
  // List subcommand
  .addSubcommand(subcommand => 
    subcommand
      .setName('list')
      .setDescription('Lists all participants in your current event.')
  )
  
  // Me subcommand
  .addSubcommand(subcommand => 
    subcommand
      .setName('me')
      .setDescription('Shows your total activity points and event history.')
  )
  
  // ID subcommand
  .addSubcommand(subcommand => 
    subcommand
      .setName('id')
      .setDescription('Lists all available event IDs and their types.')
  )
  
  // Summary subcommand
  .addSubcommand(subcommand => 
    subcommand
      .setName('summary')
      .setDescription('Displays the point leaderboard for the server.')
  )
  
  // Records subcommand
  .addSubcommand(subcommand => 
    subcommand
      .setName('records')
      .setDescription('Shows all event participation records.')
  )
  
  // Reset subcommand
  .addSubcommand(subcommand => 
    subcommand
      .setName('reset')
      .setDescription('Resets all event data and points (Admin only).')
  )
  
  // Status subcommand
  .addSubcommand(subcommand => 
    subcommand
      .setName('status')
      .setDescription('Shows your current event status and allows you to leave the event.')
  );

// Main execute function that routes to the appropriate subcommand
export async function execute(
  interaction: ChatInputCommandInteraction, 
  eventConfigs: Record<string, EventConfig>
): Promise<void> {
  const subcommand = interaction.options.getSubcommand();
  
  switch (subcommand) {
    case 'start':
      await startCommand.execute(interaction, eventConfigs);
      break;
    case 'join':
      await joinCommand.execute(interaction, eventConfigs);
      break;
    case 'stop':
      await stopCommand.execute(interaction, eventConfigs);
      break;
    case 'kick':
      await kickCommand.execute(interaction, eventConfigs);
      break;
    case 'list':
      await listCommand.execute(interaction, eventConfigs);
      break;
    case 'me':
      await meCommand.execute(interaction);
      break;
    case 'id':
      await idCommand.execute(interaction, eventConfigs);
      break;
    case 'summary':
      await summaryCommand.execute(interaction);
      break;
    case 'records':
      await recordsCommand.execute(interaction);
      break;
    case 'reset':
      await resetCommand.execute(interaction);
      break;
    case 'status':
      await statusCommand.execute(interaction);
      break;
    default:
      await interaction.reply({ 
        content: `Unknown subcommand: ${subcommand}`, 
        flags: MessageFlags.Ephemeral 
      });
  }
}

// Handle button interactions for leaving events
export async function handleInteraction(
  interaction: any, 
  eventConfigs: Record<string, EventConfig>
): Promise<void> {
  if (interaction.isButton() && interaction.customId.startsWith('leave_event_')) {
    await statusCommand.handleLeaveEvent(interaction, eventConfigs);
  }
}