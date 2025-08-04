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
  start_time: string;
  participants: Record<string, ParticipantInfo>;
}

export interface EventRecord {
  user_id: string;
  event_id: string;
  event_type: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  points_earned: number;
}

export interface PointsResult {
  points: number;
  duration: number;
}

export interface Config {
  events: EventConfig[];
}