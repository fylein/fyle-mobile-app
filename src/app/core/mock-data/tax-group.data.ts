import { TaxGroup } from '../models/tax-group.model';

export const taxGroupData: TaxGroup[] = [
  {
    id: 'tgXEJA6YUoZ1',
    name: 'GST',
    percentage: 18,
    created_at: new Date('2020-06-01T13:14:54.804+00:00'),
    updated_at: new Date('2020-06-11T13:14:55.201598+00:00'),
    org_id: 'orwruogwnngg',
    is_enabled: true,
  },
  {
    id: 'tg3iWuqWhfzB',
    name: 'GST',
    percentage: 18,
    created_at: new Date('2020-06-01T13:14:54.804+00:00'),
    updated_at: new Date('2020-06-11T13:14:55.201598+00:00'),
    org_id: 'orwruogwnngg',
    is_enabled: true,
  },
];

export const expectedTaxGroupData: { label: string; value: TaxGroup }[] = [
  {
    label: 'GST',
    value: {
      id: 'tgXEJA6YUoZ1',
      name: 'GST',
      percentage: 18,
      created_at: new Date('2020-06-01T13:14:54.804Z'),
      updated_at: new Date('2020-06-11T13:14:55.201Z'),
      org_id: 'orwruogwnngg',
      is_enabled: true,
    },
  },
  {
    label: 'GST',
    value: {
      id: 'tg3iWuqWhfzB',
      name: 'GST',
      percentage: 18,
      created_at: new Date('2020-06-01T13:14:54.804Z'),
      updated_at: new Date('2020-06-11T13:14:55.201Z'),
      org_id: 'orwruogwnngg',
      is_enabled: true,
    },
  },
];
