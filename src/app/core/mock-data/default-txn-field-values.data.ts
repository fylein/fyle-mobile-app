import { DefaultTxnFieldValues } from '../models/v1/default-txn-field-values.model';

export const defaultTxnFieldValuesData: Partial<DefaultTxnFieldValues> = {
  purpose: 'test_term',
  tax_group_id: 'GST',
};

export const defaultTxnFieldValuesData2 = {
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
