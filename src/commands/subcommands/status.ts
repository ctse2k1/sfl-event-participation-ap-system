import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js';
import { readEventData, writeEventData } from '../../utils/dataUtils';
import { getUserActiveEvent } from '../../utils/eventUtils';

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

  const eventData = readEventData(guildId);
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
      { name: 'Event Type', value: activeEvent.eventType, inline: true },
      { name: 'Join Code', value: activeEvent.joinCode, inline: true },
      { name: 'Host', value: `<@${activeEvent.hostId}>`, inline: true },
      { name: 'Joined At', value: `<t:${Math.floor(activeEvent.joinTime / 1000)}:f>`, inline: true }
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

  const eventData = readEventData(guildId);
  const activeEvent = getUserActiveEvent(guildId, userId);

  if (!activeEvent) {
    await interaction.reply({
      content: 'You are not currently participating in any event.',
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  // Remove the user from the event participants
  const updatedEvent = {
    ...activeEvent,
    participants: activeEvent.participants.filter((p: any) => p.userId !== userId)
  };

  // Update the event data
  const updatedEventData = {
    ...eventData,
    activeEvents: eventData.activeEvents.map((event: any) => 
      event.joinCode === activeEvent.joinCode ? updatedEvent : event
    )
  };

  writeEventData(guildId, updatedEventData);

  await interaction.reply({
    content: 'You have successfully left the event.',
    flags: MessageFlags.Ephemeral
  });
}