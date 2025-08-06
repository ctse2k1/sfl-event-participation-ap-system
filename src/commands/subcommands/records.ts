import { ChatInputCommandInteraction, MessageFlags, EmbedBuilder } from 'discord.js';
import { getEventRecords } from '../../utils/dataUtils';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const eventRecords = getEventRecords();

  if (eventRecords.length === 0) {
    await interaction.reply({ 
      content: "No event records found.", 
      flags: MessageFlags.Ephemeral 
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
    
    try {
      // Handle both old and new record formats
      const userId = record.user_id || record.creator_id || '';
      let participantName = `Unknown (${userId})`;
      
      if (userId) {
        try {
          const participant = await interaction.guild?.members.fetch(userId);
          if (participant) {
            participantName = participant.displayName;
          }
        } catch (fetchError) {
          console.error(`Failed to fetch user ${userId}:`, fetchError);
        }
      }
      
      // Get points for the first participant (assuming single participant for now)
      const firstParticipantId = Object.keys(record.participants)[0];
      const pointsEarned = record.participants[firstParticipantId]?.points_earned || 0;
      const pointsText = ` | Points: ${pointsEarned.toFixed(2)}`;
      
      recordsText += `**${record.event_type}** - ${date}\n`;
      recordsText += `Participant: ${participantName}\n`;
      recordsText += `Duration: ${record.duration_minutes.toFixed(2)} minutes${pointsText}\n\n`;
    } catch (error) {
      console.error(`Failed to process record:`, error);
      
      const userId = record.user_id || record.creator_id || 'unknown';
      const firstParticipantId = Object.keys(record.participants || {})[0];
      const pointsEarned = record.participants?.[firstParticipantId]?.points_earned || 0;
      const pointsText = ` | Points: ${pointsEarned.toFixed(2)}`;
      
      recordsText += `**${record.event_type}** - ${date}\n`;
      recordsText += `Participant: Unknown (${userId})\n`;
      recordsText += `Duration: ${record.duration_minutes.toFixed(2)} minutes${pointsText}\n\n`;
    }
  }

  embed.setDescription(recordsText);
  embed.setFooter({ text: `Showing ${recentEvents.length} of ${eventRecords.length} records` });

  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}