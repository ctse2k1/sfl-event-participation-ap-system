import { ChatInputCommandInteraction, MessageFlags, EmbedBuilder } from 'discord.js';
import { getEventRecords } from '../../utils/dataUtils';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const eventRecords = getEventRecords();
  
  // Calculate points for each user
  const userPoints: Record<string, number> = {};
  
  for (const record of eventRecords) {
    // Skip records without participants
    if (!record.participants) {
      console.warn('Found event record without participants:', record);
      continue;
    }
    
    for (const [userId, data] of Object.entries(record.participants)) {
      if (!userPoints[userId]) {
        userPoints[userId] = 0;
      }
      
      userPoints[userId] += data.points_earned;
    }
  }
  
  await interaction.deferReply();
  
  // Check if we have any user points
  if (Object.keys(userPoints).length === 0) {
    await interaction.editReply({
      content: "No activity points recorded yet."
    });
    return;
  }
  
  // Sort users by points (highest first)
  const sortedUsers = Object.entries(userPoints)
    .sort(([, pointsA], [, pointsB]) => pointsB - pointsA);
  
  // Create leaderboard text
  let leaderboardText = "";
  let rank = 1;
  
  for (const [userId, points] of sortedUsers) {
    try {
      const user = await interaction.guild?.members.fetch(userId);
      const displayName = user ? user.displayName : `Unknown User (${userId})`;
      
      // Add medal emoji for top 3
      let medal = "";
      if (rank === 1) medal = "🥇 ";
      else if (rank === 2) medal = "🥈 ";
      else if (rank === 3) medal = "🥉 ";
      
      leaderboardText += `${medal}**${rank}. ${displayName}** - ${points.toFixed(2)} points\n`;
      rank++;
      
      // Limit to top 20 users
      if (rank > 20) break;
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error);
      leaderboardText += `**${rank}. Unknown User (${userId})** - ${points.toFixed(2)} points\n`;
      rank++;
      
      if (rank > 20) break;
    }
  }
  
  if (leaderboardText === "") {
    leaderboardText = "No activity points recorded yet.";
  }
  
  // Create embed
  const embed = new EmbedBuilder()
    .setTitle('🏆 Activity Points Leaderboard')
    .setDescription(leaderboardText)
    .setColor(0x00FF00)
    .setFooter({ text: `Total participants: ${sortedUsers.length}` })
    .setTimestamp();
  
  await interaction.editReply({ embeds: [embed] });
}