import { ChatInputCommandInteraction, MessageFlags, EmbedBuilder } from 'discord.js';
import { EventConfig } from '../../types';

export async function execute(
  interaction: ChatInputCommandInteraction, 
  eventConfigs: Record<string, EventConfig>
): Promise<void> {
  // Create embed
  const embed = new EmbedBuilder()
    .setTitle('📋 Available Event IDs')
    .setDescription('Use these IDs when starting an event with `/event start`')
    .setColor(0x00FF00)
    .setTimestamp();
  
  // Group events by type
  const eventsByType: Record<string, { id: string, points: number }[]> = {};
  
  for (const [id, config] of Object.entries(eventConfigs)) {
    if (!eventsByType[config.event_type]) {
      eventsByType[config.event_type] = [];
    }
    
    eventsByType[config.event_type].push({
      id,
      points: config.points_per_minute
    });
  }
  
  // Add each event type as a field
  for (const [type, events] of Object.entries(eventsByType)) {
    let eventText = "";
    
    for (const event of events) {
      eventText += `**${event.id}** - ${event.points} points/min\n`;
    }
    
    embed.addFields({ name: type, value: eventText });
  }
  
  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}