import { SlashCommandBuilder } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import { getActiveEvents, saveActiveEvents } from '../utils/dataUtils';
import { EventConfig } from '../types';

export const data = new SlashCommandBuilder()
  .setName('join')
  .setDescription('Joins an active event using a code.')
  .addStringOption(option =>
    option.setName('code')
      .setDescription('The 4-character code for the event.')
      .setRequired(true));

export async function execute(
  interaction: CommandInteraction, 
  eventConfigs: Record<string, EventConfig>
): Promise<void> {
  const code = (interaction.options.get('code')?.value as string).toLowerCase();
  const participantId = interaction.user.id;
  const activeEvents = getActiveEvents();

  // Check if event code is valid
  if (!activeEvents[code]) {
    await interaction.reply({ 
      content: "❌ Invalid event code.", 
      ephemeral: true 
    });
    return;
  }

  // Check if user is already in the event
  if (activeEvents[code].participants[participantId]) {
    await interaction.reply({ 
      content: "🤔 You have already joined this event.", 
      ephemeral: true 
    });
    return;
  }

  // Add user to event
  activeEvents[code].participants[participantId] = {
    join_time: new Date().toISOString()
  };

  saveActiveEvents(activeEvents);

  const eventId = activeEvents[code].event_id;
  const eventType = eventConfigs[eventId].event_type;

  await interaction.reply({ 
    content: `✅ You have successfully joined the event: **${eventType}**.`, 
    ephemeral: true 
  });
}