import { Location } from '../../location.model';

export interface CommuteDetails {
  id?: number;
  distance: number;
  distance_unit: string;
  home_location: Omit<Location, 'display'>;
  work_location: Omit<Location, 'display'>;
}
