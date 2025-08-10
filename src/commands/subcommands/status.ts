import { safeReply } from "../../utils/interactionUtils";
import { ChatInputCommandInteraction, Interaction, EmbedBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getActiveEvents } from '../../utils/dataUtils';
import { getDisplayName } from '../../utils/userUtils';
import { getUserEvents, saveUserEvents } from '../../utils/userEventUtils';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const userId = interaction.user.id;
  const activeEvents = getActiveEvents();

  // Find the event the user is currently in
  const currentEvent = Object.values(activeEvents).find(event => 
    event.participants && Object.keys(event.participants).includes(userId)
  );

  if (!currentEvent) {
    await safeReply(interaction, {
      content: "You are not currently participating in any active events.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  // Determine if the user is the host
  const isHost = currentEvent.creator_id === userId;

  // Create an embed with event details
  const embed = new EmbedBuilder()
    .setTitle(`🎉 Current Event Status`)
    .setDescription(isHost 
      ? `You are hosting this event.` 
      : `You are currently participating in an event.`
    )
    .addFields(
      { name: "Event Type", value: currentEvent.event_type, inline: true },
      { name: "Event ID", value: currentEvent.event_id, inline: true },
      { 
        name: "Duration", 
        value: (() => {
          const joinTime = currentEvent.participants[userId].join_time;
          
          // Robust parsing of join time
          const parsedTime = joinTime ? 
            (typeof joinTime === 'string' ? 
              (isNaN(Number(joinTime)) ? Date.parse(joinTime) : Number(joinTime)) 
              : joinTime) 
            : null;
          
          const duration = parsedTime ? 
            (Date.now() - parsedTime) / 60000 : 
            null;

          return duration !== null && !isNaN(duration) 
            ? `${duration.toFixed(1)} minutes` 
            : 'Unable to calculate duration';
        })(), 
        inline: true 
      },
      { name: "Role", value: isHost ? "Host 👑" : "Participant", inline: true }
    )
    .setColor(isHost ? 0xFFD700 : 0x00FFFF)
    .setTimestamp();

  // Only add leave button for non-hosts
  const components = isHost ? [] : [
    new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`leave_event_${currentEvent.event_id}`)
          .setLabel('Leave Event')
          .setStyle(ButtonStyle.Danger)
      )
  ];

  await safeReply(interaction, {
    embeds: [embed],
    components,
    flags: MessageFlags.Ephemeral
  });
}

export async function handleLeaveEvent(interaction: Interaction, eventConfigs: Record<string, any>): Promise<void> {
  console.log('[DEBUG] Leave button clicked - interaction received');
  
  if (!interaction.isButton()) {
    console.log('[DEBUG] Interaction is not a button - exiting');
    return;
  }

  try {
    console.log('[DEBUG] Deferring interaction reply');
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    console.log('[DEBUG] Interaction deferred successfully');
  } catch (error) {
    console.error('[ERROR] Failed to defer interaction:', error);
    return;
  }

  const userId = interaction.user.id;
  console.log(`[DEBUG] Processing leave request for user: ${userId}`);
  
  const activeEvents = getActiveEvents();
  console.log(`[DEBUG] Found ${Object.keys(activeEvents).length} active events`);

  // Find the event the user is currently in
  const currentEvent = Object.values(activeEvents).find(event => 
    event.participants && Object.keys(event.participants).includes(userId)
  );

  if (!currentEvent) {
    console.log('[DEBUG] User is not participating in any event');
    await interaction.editReply({
      content: "You are not currently participating in any active events."
    });
    return;
  }

  console.log(`[DEBUG] Found event: ${currentEvent.event_type} (ID: ${currentEvent.event_id})`);

  // Prevent host from leaving
  if (currentEvent.creator_id === userId) {
    await safeReply(interaction, {
      content: "As the event host, you cannot leave the event. Use `/event stop` to end the event.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  // Calculate points and remove participant (same as kick command)
  const joinTime = new Date(currentEvent.participants[userId].join_time);
  const leaveTime = new Date();
  const durationMinutes = (leaveTime.getTime() - joinTime.getTime()) / (1000 * 60);
  const pointsEarned = durationMinutes * eventConfigs[currentEvent.event_id].points_per_minute;
  
  // Remove user from event
  delete currentEvent.participants[userId];
  
  // Create and save event record in standard format
  const { addEventRecord } = require('../../utils/dataUtils');
  const record = {
    event_id: currentEvent.event_id,
    event_type: currentEvent.event_type,
    creator_id: currentEvent.creator_id,
    start_time: joinTime.toISOString(),
    end_time: leaveTime.toISOString(),
    duration_minutes: durationMinutes,
    participants: {
      [userId]: {
        duration_minutes: durationMinutes,
        points_earned: pointsEarned
      }
    }
  };
  addEventRecord(record);

  // Save the updated active events using the proper utility
  try {
    // Update event by code instead of ID
    activeEvents[currentEvent.code] = currentEvent;
    const { saveActiveEvents } = require('../../utils/dataUtils');
    saveActiveEvents(activeEvents);
    
    await interaction.editReply({
      content: `You have left the event: ${currentEvent.event_type}`
    });
  } catch (error) {
    console.error('Error saving event data:', error);
    await interaction.editReply({
      content: "Failed to leave the event. Please try again."
    });
  }
}