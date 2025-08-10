
import { EventConfig } from '../types';
import { getUserEvents, saveUserEvents } from './userEventUtils';

export function calculatePoints(
  userId: string,
  eventId: string,
  eventType: string,
  joinTime: string,
  pointsPerMinute: number
): void {
  const leaveTime = new Date();
  const joinTimeDate = new Date(joinTime);
  const durationMinutes = (leaveTime.getTime() - joinTimeDate.getTime()) / (1000 * 60);
  const pointsEarned = Math.floor(durationMinutes * pointsPerMinute);
  
  // Update user's event records
  const userEvents = getUserEvents(userId) || [];
  userEvents.push({
    event_id: eventId,
    event_type: eventType,
    join_time: joinTime,
    leave_time: leaveTime.toISOString(),
    points_earned: pointsEarned
  });
  saveUserEvents(userId, userEvents);
}
