import { EventTrackProperties } from './event-track-properties.model';

export interface TrackingMethods {
  identify<T, K>(data: T, property?: K): void;
  track(action: string, properties: Partial<EventTrackProperties>): void;
}
