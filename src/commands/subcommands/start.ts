import { ChatInputCommandInteraction, MessageFlags, EmbedBuilder } from 'discord.js';
import { getActiveEvents, getEventByCreator, saveActiveEvents } from '../../utils/dataUtils';
import { generateEventCode } from '../../utils/eventUtils';
import { getDisplayName } from '../../utils/userUtils';
import { EventConfig } from '../../types';

export async function execute(
  interaction: ChatInputCommandInteraction, 
  eventConfigs: Record<string, EventConfig>
): Promise<void> {
  const eventId = interaction.options.getString('event_id', true);
  const creatorId = interaction.user.id;
  const activeEvents = getActiveEvents();

  // Check if user is already hosting an event
  const existingEvent = getEventByCreator(creatorId);
  if (existingEvent) {
    await interaction.reply({ 
      content: `❌ You are already hosting an event with code **${existingEvent.code}**. Stop that event first before starting a new one.`, 
      flags: MessageFlags.Ephemeral 
    });
    return;
  }

  // Check if event ID is valid
  if (!eventConfigs[eventId]) {
    await interaction.reply({ 
      content: `❌ Invalid event ID: **${eventId}**. Use \`/event id\` to see available event IDs.`, 
      flags: MessageFlags.Ephemeral 
    });
    return;
  }

  // Generate a unique code
  const code = generateEventCode();
  
  // Create new event
  activeEvents[code] = {
    event_id: eventId,
    event_type: eventConfigs[eventId].event_type,
    creator_id: creatorId,
    code: code,
    start_time: new Date().toISOString(),
    participants: {
      [creatorId]: {
        join_time: new Date().toISOString()
      }
    }
  };

  saveActiveEvents(activeEvents);

  // Create embed response
  const embed = new EmbedBuilder()
    .setTitle(`🎮 Event Started: ${eventConfigs[eventId].event_type}`)
    .setDescription(`Your event has been started successfully!`)
    .addFields(
      { name: 'Join Code', value: `**${code}**`, inline: true },
      { name: 'Event Type', value: eventConfigs[eventId].event_type, inline: true },
      { name: 'Points Rate', value: `${eventConfigs[eventId].points_per_minute} per minute`, inline: true },
      { name: 'How to Join', value: `Other members can join using \`/event join ${code}\`` }
    )
    .setColor(0x00FF00)
    .setFooter({ text: `Started by ${getDisplayName(interaction)}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}