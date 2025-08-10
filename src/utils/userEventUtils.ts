
import fs from 'fs';
import path from 'path';

const USER_EVENTS_DIR = path.join(process.cwd(), 'data', 'user_events');

// Ensure the user_events directory exists
function ensureUserEventsDir() {
  if (!fs.existsSync(USER_EVENTS_DIR)) {
    fs.mkdirSync(USER_EVENTS_DIR, { recursive: true });
  }
}

interface UserEvent {
  event_id: string;
  event_type: string;
  join_time: string;
  leave_time: string;
  points_earned: number;
}

export function getUserEvents(userId: string): UserEvent[] | null {
  ensureUserEventsDir();
  const filePath = path.join(USER_EVENTS_DIR, `${userId}.json`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading user events for ${userId}:`, error);
    return null;
  }
}

export function saveUserEvents(userId: string, events: UserEvent[]): void {
  ensureUserEventsDir();
  const filePath = path.join(USER_EVENTS_DIR, `${userId}.json`);
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2));
  } catch (error) {
    console.error(`Error saving user events for ${userId}:`, error);
  }
}
