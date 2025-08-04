import { SlashCommandBuilder } from 'discord.js';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getEventRecords } from '../utils/dataUtils';

export const data = new SlashCommandBuilder()
  .setName('summary')
  .setDescription('Displays the point leaderboard for the server.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const eventRecords = getEventRecords();

  if (eventRecords.length === 0) {
    await interaction.reply({ 
      content: "No points have been recorded yet.", 
      ephemeral: true 
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  // Calculate points per user
  const pointsData: Record<string, { total_points: number }> = {};
  
  for (const record of eventRecords) {
    try {
      const user = await interaction.guild?.members.fetch(record.user_id);
      const userDisplayName = user ? user.displayName : `Unknown User (ID: ${record.user_id})`;
      
      if (!pointsData[userDisplayName]) {
        pointsData[userDisplayName] = { total_points: 0 };
      }
      
      pointsData[userDisplayName].total_points += record.points_earned;
    } catch {
      const userDisplayName = `Unknown User (ID: ${record.user_id})`;
      
      if (!pointsData[userDisplayName]) {
        pointsData[userDisplayName] = { total_points: 0 };
      }
      
      pointsData[userDisplayName].total_points += record.points_earned;
    }
  }

  // Sort users by points
  const sortedUsers = Object.entries(pointsData).sort(
    (a, b) => b[1].total_points - a[1].total_points
  );

  const embed = new EmbedBuilder()
    .setTitle('🏆 Activity Point Leaderboard')
    .setColor(0xFFD700);

  if (sortedUsers.length === 0) {
    embed.setDescription('The leaderboard is empty.');
    await interaction.followUp({ embeds: [embed] });
    return;
  }

  // Create leaderboard text
  let leaderboardText = '';
  const topUsers = sortedUsers.slice(0, 50); // Limit to top 50
  
  for (let i = 0; i < topUsers.length; i++) {
    const [memberName, data] = topUsers[i];
    const totalPoints = data.total_points;
    leaderboardText += `**${i + 1}.** ${memberName} - **${totalPoints.toFixed(2)}** points\n`;
  }

  embed.setDescription(leaderboardText);
  await interaction.followUp({ embeds: [embed] });
}