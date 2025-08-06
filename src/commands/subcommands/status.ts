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
    await interaction.reply({
      content: "You are not currently participating in any active events.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  // Create an embed with event details
  const embed = new EmbedBuilder()
    .setTitle(`🎉 Current Event Status`)
    .setDescription(`You are currently participating in an event.`)
    .addFields(
      { name: "Event Type", value: currentEvent.event_type, inline: true },
      { name: "Event ID", value: currentEvent.event_id, inline: true },
      { name: "Join Time", value: new Date(currentEvent.participants[userId].join_time).toLocaleString(), inline: true }
    )
    .setColor(0x00FFFF)
    .setTimestamp();

  // Create a button to leave the event
  const leaveButton = new ButtonBuilder()
    .setCustomId(`leave_event_${currentEvent.event_id}`)
    .setLabel('Leave Event')
    .setStyle(ButtonStyle.Danger);

  const actionRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(leaveButton);

  await interaction.reply({
    embeds: [embed],
    components: [actionRow],
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