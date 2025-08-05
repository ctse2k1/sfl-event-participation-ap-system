import { ChatInputCommandInteraction, MessageFlags, EmbedBuilder } from 'discord.js';
import { getActiveEvents, getEventByCreator, saveActiveEvents } from '../../utils/dataUtils';
import { calculateAndFinalizePoints } from '../../utils/eventUtils';
import { getDisplayNameById } from '../../utils/userUtils';
import { EventConfig, ParticipantPointsResult } from '../../types';

export async function execute(
  interaction: ChatInputCommandInteraction, 
  eventConfigs: Record<string, EventConfig>
): Promise<void> {
  const creatorId = interaction.user.id;
  const activeEvents = getActiveEvents();

  // Check if user is hosting an event
  const event = getEventByCreator(creatorId);
  if (!event) {
    await interaction.reply({ 
      content: `❌ You are not currently hosting any events.`, 
      flags: MessageFlags.Ephemeral 
    });
    return;
  }

  // Calculate points for all participants
  // Find the event config by matching the event_type
  const eventConfig = Object.values(eventConfigs).find(config => 
    config.event_type === event.event_type
  );
  
  if (!eventConfig) {
    await interaction.reply({ 
      content: `❌ Event type configuration not found for "${event.event_type}".`, 
      flags: MessageFlags.Ephemeral 
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  
  const results = await calculateAndFinalizePoints(event, eventConfig);
  
  // Remove event from active events
  delete activeEvents[event.code];
  saveActiveEvents(activeEvents);

  // Create embed for results
  const embed = new EmbedBuilder()
    .setTitle(`🏁 Event Ended: ${event.event_type}`)
    .setDescription(`Total Duration: **${results.durationMinutes.toFixed(2)} minutes**`)
    .setColor(0x3498DB) // Blue color
    .setTimestamp()
    .setFooter({ text: `Event ID: ${event.event_id}` });

  // Process participant results
  const participantEntries = [];
  
  for (const [userId, data] of Object.entries(results.participantResults)) {
    try {
      // Get display name using our helper function
      const displayName = await getDisplayNameById(interaction, userId);
      const isHost = userId === event.creator_id ? " 👑" : "";
      
      participantEntries.push({
        name: displayName,
        isHost: userId === event.creator_id,
        duration: (data as ParticipantPointsResult).durationMinutes.toFixed(2),
        points: (data as ParticipantPointsResult).pointsEarned.toFixed(2)
      });
    } catch (error) {
      console.error(`Failed to process user ${userId}:`, error);
      participantEntries.push({
        name: `Unknown User (${userId})`,
        isHost: userId === event.creator_id,
        duration: (data as ParticipantPointsResult).durationMinutes.toFixed(2),
        points: (data as ParticipantPointsResult).pointsEarned.toFixed(2)
      });
    }
  }
  
  // Sort participants (host first, then by points earned)
  participantEntries.sort((a, b) => {
    if (a.isHost && !b.isHost) return -1;
    if (!a.isHost && b.isHost) return 1;
    return parseFloat(b.points) - parseFloat(a.points);
  });
  
  // Add participants to embed
  let participantsText = "";
  
  for (const participant of participantEntries) {
    const hostTag = participant.isHost ? " 👑" : "";
    participantsText += `**${participant.name}**${hostTag}\n`;
    participantsText += `• Duration: ${participant.duration} minutes\n`;
    participantsText += `• Points: ${participant.points}\n\n`;
  }
  
  embed.addFields(
    { name: `Participants (${participantEntries.length})`, value: participantsText || "No participants" }
  );

  await interaction.editReply({ embeds: [embed] });
}