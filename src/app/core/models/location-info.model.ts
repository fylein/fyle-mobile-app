import { Position } from '@capacitor/geolocation';
import { ExtendedOrgUser } from './extended-org-user.model';

export interface LocationInfo {
  recentStartLocation: string;
  eou: ExtendedOrgUser;
  currentLocation: Position;
}
