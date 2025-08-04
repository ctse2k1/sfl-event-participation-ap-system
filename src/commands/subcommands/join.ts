import { ChatInputCommandInteraction } from 'discord.js';
import { getActiveEvents, saveActiveEvents } from '../../utils/dataUtils';
import { EventConfig } from '../../types';

export async function execute(
  interaction: ChatInputCommandInteraction, 
  eventConfigs: Record<string, EventConfig>
): Promise<void> {
  const code = interaction.options.getString('code', true).toLowerCase();
  const participantId = interaction.user.id;
  const activeEvents = getActiveEvents();

  // Check if event code is valid
  if (!activeEvents[code]) {
    await interaction.reply({ 
      content: `❌ Invalid event code: **${code}**. Please check the code and try again.`, 
      ephemeral: true 
    });
    return;
  }

  const event = activeEvents[code];

  // Check if user is already in the event
  if (event.participants[participantId]) {
    await interaction.reply({ 
      content: `❌ You are already participating in this event.`, 
      ephemeral: true 
    });
    return;
  }

  // Add user to event
  event.participants[participantId] = {
    join_time: new Date().toISOString()
  };

  saveActiveEvents(activeEvents);

  await interaction.reply({ 
    content: `✅ You have successfully joined the **${event.event_type}** event!`, 
    ephemeral: true 
  });

  // Notify the event creator
  try {
    const creator = await interaction.guild?.members.fetch(event.creator_id);
    if (creator) {
      const participant = interaction.user.username;
      await creator.send(`**${participant}** has joined your event with code **${code}**.`);
    }
  } catch (error) {
    console.error('Failed to notify event creator:', error);
  }
}