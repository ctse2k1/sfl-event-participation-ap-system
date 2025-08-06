import { safeReply } from "../../utils/interactionUtils";
import { ChatInputCommandInteraction, Interaction, EmbedBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getActiveEvents } from '../../utils/dataUtils';
import { getDisplayName } from '../../utils/userUtils';

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
      { name: "Join Time", value: new Date(currentEvent.participants[userId].join_time).toLocaleString(), inline: true },
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
  if (!interaction.isButton()) return;

  const userId = interaction.user.id;
  const activeEvents = getActiveEvents();

  // Find the event the user is currently in
  const currentEvent = Object.values(activeEvents).find(event => 
    event.participants && Object.keys(event.participants).includes(userId)
  );

  if (!currentEvent) {
    if ('reply' in interaction) {
      await (interaction as any).reply({
        content: "You are not currently participating in any active events.",
        flags: MessageFlags.Ephemeral
      });
    }
    return;
  }

  // Prevent host from leaving
  if (currentEvent.creator_id === userId) {
    if ('reply' in interaction) {
      await (interaction as any).reply({
        content: "As the event host, you cannot leave the event. Use `/event stop` to end the event.",
        flags: MessageFlags.Ephemeral
      });
    }
    return;
  }

  // Remove the user from the event
  delete currentEvent.participants[userId];

  // Save the updated active events
  const updatedActiveEvents = {
    ...activeEvents,
    [currentEvent.event_id]: currentEvent
  };

  // Update the active events in the data store
  const fs = require('fs');
  fs.writeFileSync('./data/active_events.json', JSON.stringify(updatedActiveEvents, null, 2));

  if ('update' in interaction) {
    await (interaction as any).update({
      content: `You have left the event: ${currentEvent.event_type}`,
      embeds: [],
      components: []
    });
  } else if ('reply' in interaction) {
    await (interaction as any).reply({
      content: `You have left the event: ${currentEvent.event_type}`,
      flags: MessageFlags.Ephemeral
    });
  }
}