import { CustomField } from '../models/custom_field.model';

export interface AdvanceRequests {
  id: string;
  created_at: Date;
  approved_at: Date;
  purpose: string;
  notes: string;
  state: string;
  currency: string;
  amount: number;
  org_user_id: string;
  advance_id: string;
  policy_amount: number;
  policy_flag: boolean;
  policy_state: string;
  project_id: string | number;
  custom_field_values: CustomField[];
  updated_at: Date;
  source: string;
  advance_request_number: string;
  updated_by?: string;
  is_sent_back: boolean;
  is_pulled_back: boolean;
}
