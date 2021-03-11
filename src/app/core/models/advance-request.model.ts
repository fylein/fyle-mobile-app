import { CustomField } from './custom_field.model';

export interface AdvanceRequest {
  id: string;
  created_at: Date;
  updated_at: Date;
  approved_at: Date;
  org_user_id: string;
  purpose: string;
  notes: string;
  state: string;
  currency: string;
  amount: number;
  advance_id: string;
  trip_request_id: string;
  project_id: string;
  source: string;
  advance_request_number: string;
  is_sent_back: boolean;
  is_pulled_back: boolean;
  policy_amount: number;
  policy_flag: boolean;
  policy_state: string;
  custom_field_values: CustomField[]
}