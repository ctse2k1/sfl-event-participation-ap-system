import { ChatInputCommandInteraction, MessageFlags, EmbedBuilder } from 'discord.js';
import { EventConfig } from '../../types';

export async function execute(
  interaction: ChatInputCommandInteraction, 
  eventConfigs: Record<string, EventConfig>
): Promise<void> {
  // Create embed
  const embed = new EmbedBuilder()
    .setTitle('📋 Available Event Codes')
    .setDescription('Use these codes when starting an event with `/event start`')
    .setColor(0x00FF00)
    .setTimestamp();
  
  // Sort events by ID for easier lookup
  const sortedEvents: { id: string, type: string }[] = [];
  
  for (const [id, config] of Object.entries(eventConfigs)) {
    sortedEvents.push({
      id,
      type: config.event_type
    });
  }
  
  // Sort alphabetically by ID
  sortedEvents.sort((a, b) => a.id.localeCompare(b.id));
  
  // Format the event list with code blocks for easy copying
  let eventText = "";
  
  for (const event of sortedEvents) {
    // Use code block for the ID to make it stand out and easy to copy
    eventText += `\`${event.id}\` - ${event.type}\n`;
  }
  
  // Add all events in a single field for easier scanning
  embed.addFields({ 
    name: "Event Codes", 
    value: eventText || "No event codes available" 
  });
  
  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}