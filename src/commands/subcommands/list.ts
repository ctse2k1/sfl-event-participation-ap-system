import { ChatInputCommandInteraction, MessageFlags, EmbedBuilder } from 'discord.js';
import { getEventByCreator } from '../../utils/dataUtils';
import { EventConfig } from '../../types';

export async function execute(
  interaction: ChatInputCommandInteraction, 
  eventConfigs: Record<string, EventConfig>
): Promise<void> {
  const creatorId = interaction.user.id;
  
  // Check if user is hosting an event
  const event = getEventByCreator(creatorId);
  if (!event) {
    await interaction.reply({ 
      content: `❌ You are not currently hosting any events.`, 
      flags: MessageFlags.Ephemeral 
    });
    return;
  }

  await interaction.deferReply();

  // Get participant information
  const participantList = [];
  for (const [userId, data] of Object.entries(event.participants)) {
    try {
      const user = await interaction.guild?.members.fetch(userId);
      const displayName = user ? user.displayName : `Unknown User (${userId})`;
      const joinTime = new Date(data.join_time);
      const currentTime = new Date();
      const durationMinutes = (currentTime.getTime() - joinTime.getTime()) / (1000 * 60);
      
      participantList.push({
        name: displayName,
        duration: durationMinutes.toFixed(2),
        isHost: userId === creatorId
      });
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error);
      participantList.push({
        name: `Unknown User (${userId})`,
        duration: "N/A",
        isHost: userId === creatorId
      });
    }
  }

  // Sort participants (host first, then by duration)
  participantList.sort((a, b) => {
    if (a.isHost && !b.isHost) return -1;
    if (!a.isHost && b.isHost) return 1;
    return parseFloat(b.duration) - parseFloat(a.duration);
  });

  // Create embed
  const embed = new EmbedBuilder()
    .setTitle(`🎮 Event Participants: ${event.event_type}`)
    .setDescription(`Event Code: **${event.code}**`)
    .setColor(0x00FF00)
    .setFooter({ text: `Hosted by ${interaction.user.username}` })
    .setTimestamp();

  // Add participants to embed
  let participantsText = "";
  for (const participant of participantList) {
    const hostTag = participant.isHost ? " 👑" : "";
    participantsText += `**${participant.name}**${hostTag} - ${participant.duration} minutes\n`;
  }

  embed.addFields({ name: `Participants (${participantList.length})`, value: participantsText || "No participants" });

  await interaction.editReply({ embeds: [embed] });
}