import { DefaultTxnFieldValues } from '../models/v1/default-txn-field-values.model';

export const defaultTxnFieldValuesData: Partial<DefaultTxnFieldValues> = {
  purpose: 'test_term',
  tax_group_id: 'GST',
};

export const defaultTxnFieldValuesData2_1: Partial<DefaultTxnFieldValues> = {
  purpose: 'test_term',
  tax_group_id: 'GST',
  flight_journey_travel_class: {
    options: ['BUSINESS'],
  },
};

export const defaultTxnFieldValuesData3: Partial<DefaultTxnFieldValues> = {
  purpose: 'test_term',
  tax_group_id: 'GST',
  vendor_id: 'vendor',
  billable: true,
};

export const defaultTxnFieldValuesData2: Partial<DefaultTxnFieldValues> = {
  purpose: 'test_term',
  cost_center_id: 15818,
  from_dt: '2023-01-01',
  to_dt: '2023-02-02',
  num_days: 32,
  billable: true,
};
