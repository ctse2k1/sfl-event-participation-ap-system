import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
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
  const eventConfig = eventConfigs[event.event_type];
  if (!eventConfig) {
    await interaction.reply({ 
      content: `❌ Event type configuration not found.`, 
      flags: MessageFlags.Ephemeral 
    });
    return;
  }

  const results = await calculateAndFinalizePoints(event, eventConfig);
  
  // Remove event from active events
  delete activeEvents[event.code];
  saveActiveEvents(activeEvents);

  // Format results
  let resultText = `# Event Ended: ${event.event_type}\n\n`;
  resultText += `**Duration:** ${results.durationMinutes.toFixed(2)} minutes\n\n`;
  resultText += "## Participant Results\n\n";

  for (const [userId, data] of Object.entries(results.participantResults)) {
    try {
      // Get display name using our helper function
      const displayName = await getDisplayNameById(interaction, userId);
      
      resultText += `**${displayName}**\n`;
      resultText += `• Duration: ${(data as ParticipantPointsResult).durationMinutes.toFixed(2)} minutes\n`;
      resultText += `• Points Earned: ${(data as ParticipantPointsResult).pointsEarned.toFixed(2)}\n\n`;
    } catch (error) {
      console.error(`Failed to process user ${userId}:`, error);
      resultText += `**Unknown User (${userId})**\n`;
      resultText += `• Duration: ${(data as ParticipantPointsResult).durationMinutes.toFixed(2)} minutes\n`;
      resultText += `• Points Earned: ${(data as ParticipantPointsResult).pointsEarned.toFixed(2)}\n\n`;
    }
  }

  await interaction.reply({ content: resultText });
}