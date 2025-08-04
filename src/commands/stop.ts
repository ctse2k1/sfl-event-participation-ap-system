import { SlashCommandBuilder } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import { getActiveEvents, getEventByCreator, saveActiveEvents } from '../utils/dataUtils';
import { calculateAndFinalizePoints } from '../utils/eventUtils';
import { EventConfig } from '../types';

export const data = new SlashCommandBuilder()
  .setName('stop')
  .setDescription('Stops the event you are hosting and calculates points.');

export async function execute(
  interaction: CommandInteraction, 
  eventConfigs: Record<string, EventConfig>
): Promise<void> {
  const creatorId = interaction.user.id;
  const activeEvents = getActiveEvents();

  // Check if user is hosting an event
  const [eventCode, event] = getEventByCreator(creatorId, activeEvents);
  if (!eventCode || !event) {
    await interaction.reply({ 
      content: "❌ You are not currently hosting an event.", 
      ephemeral: true 
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  // Calculate points for all participants
  const participantIds = Object.keys(event.participants);
  for (const pid of participantIds) {
    calculateAndFinalizePoints(pid, eventCode, activeEvents, eventConfigs);
  }

  // Remove event
  delete activeEvents[eventCode];
  saveActiveEvents(activeEvents);

  const eventType = eventConfigs[event.event_id].event_type;
  await interaction.followUp({ 
    content: `✅ Event \`${eventType}\` has been stopped. Points have been calculated for all participants.`, 
    ephemeral: true 
  });
}