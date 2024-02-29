import { Location } from '../../location.model';

export interface CommuteDetails {
  id?: number;
  distance: number;
  distance_unit: string;
  home_location: Location;
  work_location: Location;
}
