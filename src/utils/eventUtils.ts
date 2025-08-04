import { ActiveEvent, EventConfig, EventRecord, PointsResult } from '../types';
import { getEventRecords, saveEventRecords } from './dataUtils';

// Calculate and finalize points for a participant
export function calculateAndFinalizePoints(
  memberId: string,
  eventCode: string,
  activeEvents: Record<string, ActiveEvent>,
  eventConfigs: Record<string, EventConfig>
): PointsResult | null {
  const event = activeEvents[eventCode];
  if (!event) return null;

  const memberIdStr = memberId.toString();
  const participantInfo = event.participants[memberIdStr];
  if (!participantInfo) return null;

  const eventConfig = eventConfigs[event.event_id];
  if (!eventConfig) return null;

  const startTime = new Date(participantInfo.join_time);
  const endTime = new Date();
  const durationSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
  const durationMinutes = durationSeconds / 60;
  const points = Math.max(0, Math.round(durationMinutes * eventConfig.points_per_minute * 100) / 100);

  // Save raw event record
  const eventRecord: EventRecord = {
    user_id: memberIdStr,
    event_id: event.event_id,
    event_type: eventConfig.event_type,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    duration_minutes: Math.round(durationMinutes * 100) / 100,
    points_earned: points
  };

  const eventRecords = getEventRecords();
  eventRecords.push(eventRecord);
  saveEventRecords(eventRecords);

  return { points, duration: durationMinutes };
}

// Generate a random event code
export function generateEventCode(): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}