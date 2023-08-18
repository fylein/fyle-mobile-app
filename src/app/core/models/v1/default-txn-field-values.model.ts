import { ExpenseField } from './expense-field.model';

export interface DefaultTxnFieldValues {
  bus_travel_class: string;
  distance_unit: string;
  flight_journey_travel_class: string | Partial<ExpenseField>;
  flight_return_travel_class: string | Partial<ExpenseField>;
  purpose: string;
  train_travel_class: string;
  vendor_id: string;
  billable: boolean;
  tax_group_id: string;
  num_days: number;
  from_dt: string;
  to_dt: string;
  cost_center_id: number;
  project_id: number;
}
