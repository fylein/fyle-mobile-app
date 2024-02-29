import { CommuteDetails } from './v1/commute-details.model';

export interface CommuteDetailsResponse {
  user_id: string;
  full_name: string;
  email: string;
  commute_details: CommuteDetails;
}
