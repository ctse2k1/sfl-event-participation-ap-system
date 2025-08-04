import { SlashCommandBuilder } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import { getActiveEvents, getEventByCreator, saveActiveEvents } from '../utils/dataUtils';
import { calculateAndFinalizePoints } from '../utils/eventUtils';
import { EventConfig } from '../types';

export const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Removes a participant from your event.')
  .addUserOption(option =>
    option.setName('member')
      .setDescription('The member to remove from the event.')
      .setRequired(true));

export async function execute(
  interaction: CommandInteraction, 
  eventConfigs: Record<string, EventConfig>
): Promise<void> {
  const creatorId = interaction.user.id;
  const member = interaction.options.getUser('member');
  
  if (!member) {
    await interaction.reply({ 
      content: "❌ Invalid member specified.", 
      ephemeral: true 
    });
    return;
  }
  
  const memberId = member.id;
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

  // Check if member is in the event
  if (!event.participants[memberId]) {
    await interaction.reply({ 
      content: `❌ ${member.username} is not in your event.`, 
      ephemeral: true 
    });
    return;
  }

  // Check if member is the creator
  if (memberId === creatorId) {
    await interaction.reply({ 
      content: "❌ You cannot kick yourself. Use `/event stop` to end the event.", 
      ephemeral: true 
    });
    return;
  }

  // Calculate points for the member
  const result = calculateAndFinalizePoints(memberId, eventCode, activeEvents, eventConfigs);
  
  // Remove member from event
  delete event.participants[memberId];
  saveActiveEvents(activeEvents);

  const pointsMsg = result ? `${result.points.toFixed(2)} points` : "0 points";
  await interaction.reply({ 
    content: `✅ ${member.username} has been kicked and awarded ${pointsMsg}.`, 
    ephemeral: true 
  });
}