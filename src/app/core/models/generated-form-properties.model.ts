import { CustomInput } from './custom-input.model';
import { Location } from './location.model';

export interface GeneratedFormProperties {
  source_account_id: string;
  is_billable: boolean;
  currency: string;
  amount: number;
  project_id: number;
  cost_center_id: number;
  tax_amount: number;
  tax_group_id: string;
  category_id: number;
  merchant: string;
  purpose: string;
  spent_at: Date;
  file_ids: string[];
  custom_fields: Partial<CustomInput>[];
  started_at: Date;
  ended_at: Date;
  travel_classes: string[];
  distance: number;
  distance_unit: string;
  locations: Location[];
}
