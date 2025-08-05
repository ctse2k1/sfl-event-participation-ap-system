import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js';
import { getEventRecords } from '../../utils/dataUtils';
import { getDisplayName } from '../../utils/userUtils';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const userId = interaction.user.id;
  const eventRecords = getEventRecords();
  
  // Calculate total points
  let totalPoints = 0;
  const userEvents = [];
  
  for (const record of eventRecords) {
    // Skip records without participants
    if (!record.participants) {
      console.warn('Found event record without participants:', record);
      continue;
    }
    
    for (const [participantId, data] of Object.entries(record.participants)) {
      if (participantId === userId) {
        totalPoints += data.points_earned;
        userEvents.push({
          event_type: record.event_type,
          date: new Date(record.end_time),
          points: data.points_earned,
          duration: data.duration_minutes,
          wasHost: record.creator_id === userId
        });
      }
    }
  }
  
  // Sort events by date (newest first)
  userEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // Create embed
  const embed = new EmbedBuilder()
    .setTitle(`🏆 Activity Points: ${getDisplayName(interaction)}`)
    .setDescription(`You have earned a total of **${totalPoints.toFixed(2)}** activity points.`)
    .setColor(0x00FF00)
    .setTimestamp();
  
  // Add recent events (up to 10)
  if (userEvents.length > 0) {
    let recentEventsText = "";
    const recentEvents = userEvents.slice(0, 10);
    
    for (const event of recentEvents) {
      const dateString = event.date.toLocaleDateString();
      const hostTag = event.wasHost ? " 👑" : "";
      recentEventsText += `**${event.event_type}**${hostTag} - ${dateString} - ${event.points.toFixed(2)} points (Participated: ${event.duration.toFixed(2)} minutes)\n`;
    }
    
    embed.addFields({ 
      name: `Recent Events (${userEvents.length} total)`, 
      value: recentEventsText 
    });
  } else {
    embed.addFields({ 
      name: "Recent Events", 
      value: "You haven't participated in any events yet." 
    });
  }
  
  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}