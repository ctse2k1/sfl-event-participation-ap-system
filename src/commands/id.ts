import { SlashCommandBuilder } from 'discord.js';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { EventConfig } from '../types';

export const data = new SlashCommandBuilder()
  .setName('id')
  .setDescription('Lists all available event IDs and their types.');

export async function execute(
  interaction: CommandInteraction, 
  eventConfigs: Record<string, EventConfig>
): Promise<void> {
  if (Object.keys(eventConfigs).length === 0) {
    await interaction.reply({ 
      content: "No event types are configured.", 
      ephemeral: true 
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle('Available Event IDs & Types')
    .setColor(0x0099FF);

  const idList = Object.entries(eventConfigs).map(
    ([eid, details]) => `\`${eid}\` - ${details.event_type}`
  );

  embed.setDescription(idList.join('\n'));
  await interaction.reply({ embeds: [embed], ephemeral: true });
}