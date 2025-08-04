export interface EventConfig {
  event_id: string;
  event_type: string;
  points_per_minute: number;
}

export interface ParticipantInfo {
  join_time: string;
}

export interface ActiveEvent {
  creator_id: string;
  event_id: string;
  event_type: string;
  code: string;
  start_time: string;
  participants: Record<string, ParticipantInfo>;
}

export interface ParticipantResult {
  duration_minutes: number;
  points_earned: number;
}

export interface EventRecord {
  event_id: string;
  event_type: string;
  creator_id?: string;
  user_id?: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  points_earned?: number;
  participants?: Record<string, ParticipantResult>;
}

export interface ParticipantPointsResult {
  durationMinutes: number;
  pointsEarned: number;
}

export interface PointsResult {
  durationMinutes: number;
  participantResults: Record<string, ParticipantPointsResult>;
}

export interface Config {
  events: EventConfig[];
}