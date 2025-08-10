import { safeReply } from "../../utils/interactionUtils";
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { getActiveEvents, getEventByCreator, saveActiveEvents, addEventRecord } from '../../utils/dataUtils';
import { calculateAndFinalizePoints } from '../../utils/eventUtils';
import { getDisplayNameById } from '../../utils/userUtils';
import { EventConfig, EventRecord } from '../../types';

export async function execute(
  interaction: ChatInputCommandInteraction, 
  eventConfigs: Record<string, EventConfig>
): Promise<void> {
  const creatorId = interaction.user.id;
  const member = interaction.options.getUser('member');
  
  if (!member) {
    await safeReply(interaction, { 
      content: "❌ Invalid member specified.", 
      flags: MessageFlags.Ephemeral 
    });
    return;
  }

  const memberId = member.id;
  
  // Get display name for the member
  const displayName = await getDisplayNameById(interaction, memberId);
  
  // Check if user is hosting an event
  const event = getEventByCreator(creatorId);
  if (!event) {
    await safeReply(interaction, { 
      content: `❌ You are not currently hosting any events.`, 
      flags: MessageFlags.Ephemeral 
    });
    return;
  }

  // Check if member is in the event
  if (!event.participants[memberId]) {
    await safeReply(interaction, { 
      content: `❌ This member is not participating in your event.`, 
      flags: MessageFlags.Ephemeral 
    });
    return;
  }

  // Check if member is the host
  if (memberId === creatorId) {
    await safeReply(interaction, { 
      content: `❌ You cannot kick yourself from your own event. Use \`/event stop\` to end the event.`, 
      flags: MessageFlags.Ephemeral 
    });
    return;
  }

  // Calculate points for the kicked member
  const activeEvents = getActiveEvents();
  // Get the event directly from activeEvents using the event code
  const eventFromStorage = activeEvents[event.code];
  if (!eventFromStorage) {
    await safeReply(interaction, { 
      content: `❌ Event not found in active events.`, 
      flags: MessageFlags.Ephemeral 
    });
    return;
  }
  
  // Find the event config by matching the event_type
  const eventConfig = Object.values(eventConfigs).find(config => 
    config.event_type === event.event_type
  );
  
  if (!eventConfig) {
    await safeReply(interaction, { 
      content: `❌ Event type configuration not found for "${event.event_type}".`, 
      flags: MessageFlags.Ephemeral 
    });
    return;
  }
  
  const joinTime = new Date(event.participants[memberId].join_time);
  const kickTime = new Date();
  const durationMinutes = (kickTime.getTime() - joinTime.getTime()) / (1000 * 60);
  const pointsEarned = durationMinutes * eventConfig.points_per_minute;

  // Remove member from event in activeEvents
  delete eventFromStorage.participants[memberId];
  saveActiveEvents(activeEvents);
  
  // Create and save event record in standard format
  const record: EventRecord = {
    event_id: event.event_id,
    event_type: event.event_type,
    creator_id: event.creator_id,
    start_time: joinTime.toISOString(),
    end_time: kickTime.toISOString(),
    duration_minutes: durationMinutes,
    participants: {
      [memberId]: {
        duration_minutes: durationMinutes,
        points_earned: pointsEarned
      }
    }
  };
  addEventRecord(record);

  await safeReply(interaction, { 
    content: `✅ **${displayName}** has been removed from your event. They participated for ${durationMinutes.toFixed(2)} minutes and earned ${pointsEarned.toFixed(2)} points.`, 
    flags: MessageFlags.Ephemeral 
  });

  // Notify the kicked member
  try {
    await member.send(`You have been removed from the **${event.event_type}** event by the host. You participated for ${durationMinutes.toFixed(2)} minutes and earned ${pointsEarned.toFixed(2)} points.`);
  } catch (error) {
    console.error('Failed to notify kicked member:', error);
  }
}