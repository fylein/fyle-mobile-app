import { TrpTravellerDetail } from './trip_traveller_detail.model';
import { TrpTripCity } from './trp_trip_city';
import { CustomField } from './custom_field.model';


export interface TripRequest {
  id: string;
  created_at: Date;
  updated_at: Date;
  traveller_details: TrpTravellerDetail[];
  org_user_id: string;
  creator_id: string;
  purpose: string;
  notes: string;
  trip_type: string;
  trip_cities: TrpTripCity[];
  project_id: string;
  updated_by: string;
  state: string;
  request_number: string;
  custom_field_values: CustomField[];
  is_sent_back: boolean;
  is_pulled_back: boolean;
  is_booked: boolean;
  is_requested_cancellation: boolean;
  is_to_close: boolean;
  start_date: Date;
  end_date: Date;
  policy_flag: boolean;
  policy_state: string;
  source: string;
  approved_at: Date;
  start_dt: Date;
  end_dt: Date;
}
