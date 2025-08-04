import { SlashCommandBuilder } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import { getActiveEvents, getEventRecords, saveActiveEvents, saveEventRecords, ACTIVE_EVENTS_FILE, EVENT_RECORDS_FILE } from '../utils/dataUtils';
import fs from 'fs';
import path from 'path';

export const data = new SlashCommandBuilder()
  .setName('reset')
  .setDescription('Resets all event data and points (Admin only).')
  .setDefaultMemberPermissions(0); // Requires administrator permission

export async function execute(interaction: CommandInteraction): Promise<void> {
  // Create backup of current data
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `event_records_backup_${timestamp}.json`;
  const backupFilePath = path.join(process.cwd(), 'data', backupFileName);

  try {
    if (fs.existsSync(EVENT_RECORDS_FILE)) {
      fs.copyFileSync(EVENT_RECORDS_FILE, backupFilePath);
      console.log(`Successfully backed up event records to ${backupFilePath}`);
    }
  } catch (error) {
    console.error(`Failed to back up event records:`, error);
    await interaction.reply({
      content: "❌ **Error:** Could not back up event records. Reset operation aborted.",
      ephemeral: true
    });
    return;
  }

  // Clear data in memory and files
  const activeEvents = getActiveEvents();
  const eventRecords = getEventRecords();
  
  Object.keys(activeEvents).forEach(key => delete activeEvents[key]);
  eventRecords.length = 0;
  
  saveActiveEvents(activeEvents);
  saveEventRecords(eventRecords);

  await interaction.reply({
    content: `**✅ All event data and points have been reset.**\nPrevious records have been backed up to \`${backupFileName}\`.`,
    ephemeral: true
  });
}