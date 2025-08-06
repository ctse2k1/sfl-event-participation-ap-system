import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js';
import { getActiveEvents, saveActiveEvents } from '../../utils/dataUtils';
import { getUserActiveEvent } from '../../utils/eventUtils';
import { ActiveEvent } from '../../types';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const guildId = interaction.guildId;
  const userId = interaction.user.id;

  if (!guildId) {
    await interaction.reply({
      content: 'Error: Unable to determine server context.',
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const activeEvents = getActiveEvents();
  const activeEvent = getUserActiveEvent(guildId, userId);

  if (!activeEvent) {
    await interaction.reply({
      content: 'You are not currently participating in any event.',
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle('Current Event Status')
    .setDescription('Details of the event you are currently participating in.')
    .addFields(
      { name: 'Event Type', value: activeEvent.event_type, inline: true },
      { name: 'Join Code', value: activeEvent.join_code, inline: true },
      { name: 'Host', value: `<@${activeEvent.creator_id}>`, inline: true },
      { name: 'Joined At', value: `<t:${Math.floor(new Date(activeEvent.participants[userId].join_time).getTime() / 1000)}:f>`, inline: true }
    )
    .setColor('#00FF00');

  const leaveButton = {
    type: 2, // Button type
    style: 4, // Destructive (red) style
    label: 'Leave Event',
    custom_id: 'leave_event'
  };

  await interaction.reply({
    embeds: [embed],
    components: [{ type: 1, components: [leaveButton] }],
    flags: MessageFlags.Ephemeral
  });
}

export async function handleLeaveEvent(interaction: any): Promise<void> {
  const guildId = interaction.guildId;
  const userId = interaction.user.id;

  if (!guildId) {
    await interaction.reply({
      content: 'Error: Unable to determine server context.',
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const activeEvents = getActiveEvents();
  const activeEvent = getUserActiveEvent(guildId, userId);

  if (!activeEvent) {
    await interaction.reply({
      content: 'You are not currently participating in any event.',
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  // Remove the user from the event participants
  const updatedEvent: ActiveEvent = {
    ...activeEvent,
    participants: Object.fromEntries(
      Object.entries(activeEvent.participants).filter(([key]) => key !== userId)
    )
  };

  // Update the active events
  const updatedActiveEvents = { ...activeEvents };
  updatedActiveEvents[activeEvent.join_code] = updatedEvent;

  saveActiveEvents(updatedActiveEvents);

  await interaction.reply({
    content: 'You have successfully left the event.',
    flags: MessageFlags.Ephemeral
  });
}