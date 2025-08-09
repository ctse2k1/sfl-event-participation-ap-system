import { 
  CommandInteraction, 
  MessageComponentInteraction,
  InteractionReplyOptions, 
  InteractionEditReplyOptions, 
  MessageFlags 
} from 'discord.js';

type ReplyableInteraction = CommandInteraction | MessageComponentInteraction;

export async function safeReply(
  interaction: ReplyableInteraction, 
  options: InteractionReplyOptions & { flags?: MessageFlags }
): Promise<void> {
  // Convert InteractionReplyOptions to InteractionEditReplyOptions
  const editOptions: InteractionEditReplyOptions = {
    content: options.content,
    embeds: options.embeds,
    components: options.components,
    // Remove flags for editReply
  };

  try {
    if (interaction.deferred) {
      await interaction.editReply(editOptions);
    } else {
      await interaction.reply(options);
    }
  } catch (error) {
    console.error('Error responding to interaction:', error);
    
    // Attempt to edit reply if interaction is deferred
    if (interaction.deferred) {
      try {
        await interaction.editReply(editOptions);
      } catch {
        console.error('Could not edit reply');
      }
    }
  }
}