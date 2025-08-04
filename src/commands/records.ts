import { SlashCommandBuilder } from 'discord.js';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { getEventRecords } from '../utils/dataUtils';

export const data = new SlashCommandBuilder()
  .setName('records')
  .setDescription('Shows all event participation records.');

export async function execute(interaction: CommandInteraction): Promise<void> {
  const eventRecords = getEventRecords();

  if (eventRecords.length === 0) {
    await interaction.reply({ 
      content: "There are no event records yet.", 
      ephemeral: true 
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  // Create embed
  const embed = new EmbedBuilder()
    .setTitle('Event Participation Records')
    .setDescription('A log of all recorded event participation.')
    .setColor(0x0099FF);

  // Sort records by start time, newest first
  const sortedRecords = [...eventRecords].sort(
    (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  );

  // Limit to 25 most recent records
  const recentRecords = sortedRecords.slice(0, 25);
  
  for (const record of recentRecords) {
    try {
      const user = await interaction.guild?.members.fetch(record.user_id);
      const userName = user ? user.displayName : `Unknown User (ID: ${record.user_id})`;
      const eventDate = new Date(record.start_time).toLocaleString();
      
      const fieldValue = [
        `**User:** ${userName}`,
        `**Event:** ${record.event_type}`,
        `**Duration:** ${record.duration_minutes.toFixed(2)} mins`,
        `**Points:** ${record.points_earned.toFixed(2)}`
      ].join('\n');
      
      embed.addFields({ name: `Record - ${eventDate}`, value: fieldValue, inline: false });
    } catch (error) {
      console.error(`Error fetching user ${record.user_id}:`, error);
    }
  }

  if (sortedRecords.length > 25) {
    embed.setFooter({ text: `Showing the 25 most recent of ${sortedRecords.length} records.` });
  }

  await interaction.followUp({ embeds: [embed], ephemeral: true });
}