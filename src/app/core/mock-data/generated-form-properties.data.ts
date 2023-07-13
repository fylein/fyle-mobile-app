import { GeneratedFormProperties } from '../models/generated-form-properties.model';

export const generatedFormPropertiesData1: GeneratedFormProperties = {
  source_account_id: '1234',
  billable: true,
  currency: 'INR',
  amount: 100,
  project_id: 3943,
  cost_center_id: 91842,
  tax_amount: 100,
  tax_group_id: '793812',
  org_category_id: 85913,
  fyle_category: 'Food',
  vendor: 'Nilesh As Vendor',
  purpose: 'Others',
  txn_dt: new Date('2023-02-03'),
  receipt_ids: ['tx3nHShG60zq'],
  custom_properties: [
    {
      name: 'Custom Property 1',
      value: 'Custom Property 1 Value',
    },
    {
      name: 'Custom Property 2',
      value: 'Custom Property 2 Value',
    },
  ],
  ccce_group_id: '63291',
  from_dt: new Date('2023-01-01'),
  to_dt: new Date('2023-02-02'),
  flight_journey_travel_class: 'Economy',
  flight_return_travel_class: 'Economy',
  train_travel_class: 'Economy',
  bus_travel_class: 'Economy',
  distance: 100,
  distance_unit: 'KM',
  locations: ['Mumbai', 'Pune'],
};
