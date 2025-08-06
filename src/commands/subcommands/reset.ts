import { safeReply } from "../../utils/interactionUtils";
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { getActiveEvents, getEventRecords, saveActiveEvents, saveEventRecords, ACTIVE_EVENTS_FILE, EVENT_RECORDS_FILE } from '../../utils/dataUtils';
import fs from 'fs';
import path from 'path';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  // Create backup of current data
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `event_records_backup_${timestamp}.json`;
  const backupFilePath = path.join(process.cwd(), 'data', backupFileName);
  
  try {
    // Get current data
    const eventRecords = getEventRecords();
    const activeEvents = getActiveEvents();
    
    // Create backup
    fs.writeFileSync(
      backupFilePath, 
      JSON.stringify({ eventRecords, activeEvents }, null, 2)
    );
    
    // Reset data
    saveEventRecords([]);
    saveActiveEvents({});
    
    await safeReply(interaction, { 
      content: `✅ All event data has been reset. A backup was created at \`${backupFileName}\`.`, 
      flags: MessageFlags.Ephemeral 
    });
  } catch (error) {
    console.error('Failed to reset data:', error);
    await safeReply(interaction, { 
      content: `❌ Failed to reset data: ${error}`, 
      flags: MessageFlags.Ephemeral 
    });
  }
}