import { ActiveEvent, EventConfig, EventRecord, PointsResult, ParticipantPointsResult, ParticipantResult } from '../types';
import { getEventRecords, saveEventRecords, getActiveEvents } from './dataUtils';

// Calculate and finalize points for an event
export async function calculateAndFinalizePoints(
  event: ActiveEvent,
  eventConfig: EventConfig
): Promise<PointsResult> {
  const endTime = new Date();
  const startTime = new Date(event.start_time);
  const totalDurationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  
  // Calculate points for each participant
  const participantResults: Record<string, ParticipantPointsResult> = {};
  const eventParticipants: Record<string, ParticipantResult> = {};
  
  for (const [userId, participantInfo] of Object.entries(event.participants)) {
    const joinTime = new Date(participantInfo.join_time);
    const participantDurationMinutes = (endTime.getTime() - joinTime.getTime()) / (1000 * 60);
    const pointsEarned = Math.max(0, Math.round(participantDurationMinutes * eventConfig.points_per_minute * 100) / 100);
    
    participantResults[userId] = {
      durationMinutes: Math.round(participantDurationMinutes * 100) / 100,
      pointsEarned
    };
    
    eventParticipants[userId] = {
      duration_minutes: Math.round(participantDurationMinutes * 100) / 100,
      points_earned: pointsEarned
    };
  }
  
  // Create event record
  const eventRecord: EventRecord = {
    event_id: event.event_id,
    event_type: event.event_type,
    creator_id: event.creator_id,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    duration_minutes: Math.round(totalDurationMinutes * 100) / 100,
    participants: eventParticipants
  };
  
  // Save event record
  const eventRecords = getEventRecords();
  eventRecords.push(eventRecord);
  saveEventRecords(eventRecords);
  
  return {
    durationMinutes: Math.round(totalDurationMinutes * 100) / 100,
    participantResults
  };
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