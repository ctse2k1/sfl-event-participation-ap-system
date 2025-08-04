import { ChatInputCommandInteraction, GuildMember, User } from 'discord.js';

/**
 * Gets the display name (per-server profile name) for a user
 * Falls back to username if display name is not available
 */
export function getDisplayName(interaction: ChatInputCommandInteraction): string {
  // Check if we can get the GuildMember
  if (interaction.member && interaction.member instanceof GuildMember) {
    return interaction.member.displayName;
  }
  
  // Fall back to username
  return interaction.user.username;
}

/**
 * Gets the display name for a user by ID
 * Falls back to username or ID if display name is not available
 */
export async function getDisplayNameById(
  interaction: ChatInputCommandInteraction, 
  userId: string
): Promise<string> {
  try {
    // Try to get guild member
    const guildMember = await interaction.guild?.members.fetch(userId);
    if (guildMember) {
      return guildMember.displayName;
    }
    
    // If we can't get guild member, try to get user
    const user = await interaction.client.users.fetch(userId);
    if (user) {
      return user.username;
    }
  } catch (error) {
    console.error(`Failed to fetch display name for user ${userId}:`, error);
  }
  
  // Fall back to user ID
  return `Unknown (${userId})`;
}