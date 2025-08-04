import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { getActiveEvents, getEventByCreator, saveActiveEvents } from '../../utils/dataUtils';
import { calculateAndFinalizePoints } from '../../utils/eventUtils';
import { EventConfig } from '../../types';

export async function execute(
  interaction: ChatInputCommandInteraction, 
  eventConfigs: Record<string, EventConfig>
): Promise<void> {
  const creatorId = interaction.user.id;
  const member = interaction.options.getUser('member');
  
  if (!member) {
    await interaction.reply({ 
      content: "❌ Invalid member specified.", 
      flags: MessageFlags.Ephemeral 
    });
    return;
  }

  const memberId = member.id;
  
  // Check if user is hosting an event
  const event = getEventByCreator(creatorId);
  if (!event) {
    await interaction.reply({ 
      content: `❌ You are not currently hosting any events.`, 
      flags: MessageFlags.Ephemeral 
    });
    return;
  }

  // Check if member is in the event
  if (!event.participants[memberId]) {
    await interaction.reply({ 
      content: `❌ This member is not participating in your event.`, 
      flags: MessageFlags.Ephemeral 
    });
    return;
  }

  // Check if member is the host
  if (memberId === creatorId) {
    await interaction.reply({ 
      content: `❌ You cannot kick yourself from your own event. Use \`/event stop\` to end the event.`, 
      flags: MessageFlags.Ephemeral 
    });
    return;
  }

  // Calculate points for the kicked member
  const activeEvents = getActiveEvents();
  const eventConfig = eventConfigs[event.event_id];
  const joinTime = new Date(event.participants[memberId].join_time);
  const kickTime = new Date();
  const durationMinutes = (kickTime.getTime() - joinTime.getTime()) / (1000 * 60);
  const pointsEarned = durationMinutes * eventConfig.points_per_minute;

  // Remove member from event
  delete event.participants[memberId];
  saveActiveEvents(activeEvents);

  await interaction.reply({ 
    content: `✅ **${member.username}** has been removed from your event. They participated for ${durationMinutes.toFixed(2)} minutes and earned ${pointsEarned.toFixed(2)} points.`, 
    flags: MessageFlags.Ephemeral 
  });

  // Notify the kicked member
  try {
    await member.send(`You have been removed from the **${event.event_type}** event by the host. You participated for ${durationMinutes.toFixed(2)} minutes and earned ${pointsEarned.toFixed(2)} points.`);
  } catch (error) {
    console.error('Failed to notify kicked member:', error);
  }
}