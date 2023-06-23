import { PredictedLocation } from './predicted-location.model';

export interface Location {
  city: string;
  country: string;
  display: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  state: string;
}

export interface PredictedLocations {
  predictions: PredictedLocation[];
}
