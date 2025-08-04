import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getEventRecords } from '../../utils/dataUtils';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const eventRecords = getEventRecords();

  if (eventRecords.length === 0) {
    await interaction.reply({ 
      content: "No event records found.", 
      ephemeral: true 
    });
    return;
  }

  // Sort records by end time (newest first)
  eventRecords.sort((a, b) => 
    new Date(b.end_time).getTime() - new Date(a.end_time).getTime()
  );

  // Create embed
  const embed = new EmbedBuilder()
    .setTitle('📜 Event Records')
    .setColor(0x00FF00)
    .setTimestamp();

  // Add recent events (up to 10)
  const recentEvents = eventRecords.slice(0, 10);
  let recordsText = "";

  for (const record of recentEvents) {
    const date = new Date(record.end_time).toLocaleDateString();
    const participantCount = Object.keys(record.participants).length;
    
    try {
      const creator = await interaction.guild?.members.fetch(record.creator_id);
      const creatorName = creator ? creator.displayName : `Unknown (${record.creator_id})`;
      
      recordsText += `**${record.event_type}** - ${date}\n`;
      recordsText += `Host: ${creatorName} | Participants: ${participantCount}\n`;
      recordsText += `Duration: ${record.duration_minutes.toFixed(2)} minutes\n\n`;
    } catch (error) {
      console.error(`Failed to fetch creator ${record.creator_id}:`, error);
      
      recordsText += `**${record.event_type}** - ${date}\n`;
      recordsText += `Host: Unknown (${record.creator_id}) | Participants: ${participantCount}\n`;
      recordsText += `Duration: ${record.duration_minutes.toFixed(2)} minutes\n\n`;
    }
  }

  embed.setDescription(recordsText);
  embed.setFooter({ text: `Showing ${recentEvents.length} of ${eventRecords.length} records` });

  await interaction.reply({ embeds: [embed] });
}