import { SlashCommandBuilder } from 'discord.js';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { getActiveEvents, getEventByCreator, saveActiveEvents } from '../utils/dataUtils';
import { generateEventCode } from '../utils/eventUtils';
import { EventConfig } from '../types';

export const data = new SlashCommandBuilder()
  .setName('start')
  .setDescription('Starts a new event and generates a join code.')
  .addStringOption(option =>
    option.setName('event_id')
      .setDescription('The unique ID of the event to start.')
      .setRequired(true));

export async function execute(
  interaction: CommandInteraction, 
  eventConfigs: Record<string, EventConfig>
): Promise<void> {
  const eventId = interaction.options.get('event_id')?.value as string;
  const creatorId = interaction.user.id;
  const activeEvents = getActiveEvents();

  // Check if user is already hosting an event
  const [existingEventCode] = getEventByCreator(creatorId, activeEvents);
  if (existingEventCode) {
    await interaction.reply({ 
      content: "❌ You are already hosting an event. Please stop it first.", 
      ephemeral: true 
    });
    return;
  }

  // Check if event ID is valid
  if (!eventConfigs[eventId]) {
    await interaction.reply({ 
      content: `❌ Event ID \`${eventId}\` is not valid. Use \`/event id\` to see available IDs.`, 
      ephemeral: true 
    });
    return;
  }

  // Generate a unique event code
  let eventCode = generateEventCode();
  while (activeEvents[eventCode]) {
    eventCode = generateEventCode();
  }

  // Create new event
  activeEvents[eventCode] = {
    creator_id: creatorId,
    event_id: eventId,
    start_time: new Date().toISOString(),
    participants: {
      [creatorId]: { join_time: new Date().toISOString() }
    }
  };

  saveActiveEvents(activeEvents);

  // Create response embed
  const embed = new EmbedBuilder()
    .setTitle('🎉 Event Started!')
    .setDescription(`Your event \`${eventConfigs[eventId].event_type}\` is now active.`)
    .setColor(0x00FF00)
    .addFields({ name: 'Join Code', value: `**\`${eventCode}\`**`, inline: false })
    .setFooter({ text: 'Participants can now use this code with /event join.' });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}