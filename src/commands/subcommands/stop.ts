import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { getActiveEvents, getEventByCreator, saveActiveEvents } from '../../utils/dataUtils';
import { calculateAndFinalizePoints } from '../../utils/eventUtils';
import { EventConfig } from '../../types';

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

  await interaction.deferReply();

  // Calculate points and finalize event
  const results = await calculateAndFinalizePoints(event, eventConfigs[event.event_id]);
  
  // Remove event from active events
  delete activeEvents[event.code];
  saveActiveEvents(activeEvents);

  // Format results
  let resultText = `# Event Ended: ${event.event_type}\n\n`;
  resultText += `**Duration:** ${results.durationMinutes.toFixed(2)} minutes\n\n`;
  resultText += "## Participant Results\n\n";

  for (const [userId, data] of Object.entries(results.participantResults)) {
    try {
      const user = await interaction.guild?.members.fetch(userId);
      const displayName = user ? user.displayName : `Unknown User (${userId})`;
      
      resultText += `**${displayName}**\n`;
      resultText += `• Duration: ${data.durationMinutes.toFixed(2)} minutes\n`;
      resultText += `• Points Earned: ${data.pointsEarned.toFixed(2)}\n\n`;
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error);
      resultText += `**Unknown User (${userId})**\n`;
      resultText += `• Duration: ${data.durationMinutes.toFixed(2)} minutes\n`;
      resultText += `• Points Earned: ${data.pointsEarned.toFixed(2)}\n\n`;
    }
  }

  await interaction.editReply(resultText);
}