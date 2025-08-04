import { SlashCommandBuilder } from 'discord.js';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { getActiveEvents, getEventByCreator } from '../utils/dataUtils';
import { EventConfig } from '../types';

export const data = new SlashCommandBuilder()
  .setName('list')
  .setDescription('Lists all participants in your current event.');

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

  const participantIds = Object.keys(event.participants);
  if (participantIds.length === 0) {
    await interaction.reply({ 
      content: "텅 Your event has no participants yet.", 
      ephemeral: true 
    });
    return;
  }

  // Get participant names
  const participantList: string[] = [];
  for (const pid of participantIds) {
    try {
      const member = await interaction.guild?.members.fetch(pid);
      participantList.push(member ? member.displayName : `Unknown User (ID: ${pid})`);
    } catch {
      participantList.push(`Unknown User (ID: ${pid})`);
    }
  }

  const eventType = eventConfigs[event.event_id].event_type;
  const embed = new EmbedBuilder()
    .setTitle(`Participants in '${eventType}'`)
    .setDescription("> " + participantList.join("\n> "))
    .setColor(0x0099FF);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}