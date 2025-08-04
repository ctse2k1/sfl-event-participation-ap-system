import { SlashCommandBuilder } from 'discord.js';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { getEventRecords } from '../utils/dataUtils';

export const data = new SlashCommandBuilder()
  .setName('me')
  .setDescription('Shows your total activity points and event history.');

export async function execute(interaction: CommandInteraction): Promise<void> {
  const userId = interaction.user.id;
  const eventRecords = getEventRecords();

  if (eventRecords.length === 0) {
    await interaction.reply({ 
      content: "You don't have event records yet.", 
      ephemeral: true 
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  // Create embed
  const embed = new EmbedBuilder()
    .setTitle(`${interaction.user.username}'s Participation Records`)
    .setDescription(`A log of ${interaction.user.username}'s recorded event participation.`)
    .setColor(0x0099FF);

  if (interaction.user.avatarURL()) {
    embed.setThumbnail(interaction.user.avatarURL() || '');
  }

  // Filter user records
  const userRecords = eventRecords.filter(record => record.user_id === userId);
  
  // Sort records by start time, newest first
  const sortedRecords = userRecords.sort((a, b) => 
    new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  );

  // Add record fields
  let totalPoints = 0;
  const recordsToShow = sortedRecords.slice(0, 20); // Limit to 20 records
  
  for (const record of recordsToShow) {
    const eventDate = new Date(record.start_time).toLocaleString();
    const durationMins = record.duration_minutes;
    const points = record.points_earned;
    const eventType = record.event_type;

    const fieldValue = [
      `**Event:** ${eventType}`,
      `**Duration:** ${durationMins.toFixed(2)} mins`,
      `**Points:** ${points.toFixed(2)}`
    ].join('\n');

    embed.addFields({ name: `Record - ${eventDate}`, value: fieldValue, inline: false });
    totalPoints += points;
  }

  // Add total points
  embed.addFields({ 
    name: `${interaction.user.username}'s Total Points`, 
    value: `**Total Points:** ${totalPoints.toFixed(2)}`, 
    inline: false 
  });

  if (sortedRecords.length > 20) {
    embed.setFooter({ text: `Showing the last 20 of ${sortedRecords.length} records.` });
  }

  await interaction.followUp({ embeds: [embed], ephemeral: true });
}