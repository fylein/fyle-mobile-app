import { CustomProperty } from './custom-properties.model';

export interface GeneratedFormProperties {
  source_account_id: string;
  billable: boolean;
  currency: string;
  amount: number;
  project_id: number;
  cost_center_id: number;
  tax_amount: number;
  tax_group_id: string;
  org_category_id: number;
  fyle_category: string;
  vendor: string;
  purpose: string;
  txn_dt: Date;
  receipt_ids: string[];
  custom_properties: CustomProperty<string>[];
  ccce_group_id: string;
  from_dt: Date;
  to_dt: Date;
  flight_journey_travel_class: string;
  flight_return_travel_class: string;
  train_travel_class: string;
  bus_travel_class: string;
  distance: number;
  distance_unit: string;
  locations: string[];
}
