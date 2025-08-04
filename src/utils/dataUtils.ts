import fs from 'fs';
import path from 'path';
import { ActiveEvent, EventRecord } from '../types';

// Constants
export const DATA_DIR = path.join(process.cwd(), 'data');
export const ACTIVE_EVENTS_FILE = path.join(DATA_DIR, 'active_events.json');
export const EVENT_RECORDS_FILE = path.join(DATA_DIR, 'event_records.json');

// Ensure data directory exists
export function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Save data to a JSON file
export function saveData<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
  } catch (error) {
    console.error(`Could not write to file ${filePath}:`, error);
  }
}

// Load data from a JSON file
export function loadData<T>(filePath: string, defaultData: T): T {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
    saveData(filePath, defaultData);
    return defaultData;
  }

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data) as T;
  } catch (error) {
    console.warn(`Could not load data from ${filePath}, returning default. Reason:`, error);
    return defaultData;
  }
}

// Get active events
export function getActiveEvents(): Record<string, ActiveEvent> {
  return loadData<Record<string, ActiveEvent>>(ACTIVE_EVENTS_FILE, {});
}

// Save active events
export function saveActiveEvents(activeEvents: Record<string, ActiveEvent>): void {
  saveData(ACTIVE_EVENTS_FILE, activeEvents);
}

// Get event records
export function getEventRecords(): EventRecord[] {
  return loadData<EventRecord[]>(EVENT_RECORDS_FILE, []);
}

// Save event records
export function saveEventRecords(eventRecords: EventRecord[]): void {
  saveData(EVENT_RECORDS_FILE, eventRecords);
}

// Get event by creator
export function getEventByCreator(creatorId: string, activeEvents?: Record<string, ActiveEvent>): ActiveEvent | null {
  const creatorIdStr = creatorId.toString();
  const events = activeEvents || getActiveEvents();
  
  for (const [eventCode, event] of Object.entries(events)) {
    if (event.creator_id === creatorIdStr) {
      return event;
    }
  }
  
  return null;
}