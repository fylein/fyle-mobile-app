import { AllowedPerDiemRateOptions } from '../models/allowed-per-diem-rate-options.model';

export const allowedPerDiemRateOptionsData1: AllowedPerDiemRateOptions[] = [
  {
    label: 'BulkTest2',
    value: {
      active: true,
      created_at: new Date('2020-08-12T16:09:14.551Z'),
      currency: 'USD',
      id: 4213,
      name: 'BulkTest2',
      org_id: 'orrjqbDbeP9p',
      rate: 50,
      updated_at: new Date('2022-09-20T11:48:38.901Z'),
      full_name: 'BulkTest2 (50 USD per day)',
      readableRate: '$50.00 per day',
    },
  },
  {
    label: 'aaaa',
    value: {
      active: true,
      created_at: new Date('2020-08-12T16:09:14.551Z'),
      currency: 'AED',
      id: 4224,
      name: 'aaaa',
      org_id: 'orrjqbDbeP9p',
      rate: 12,
      updated_at: new Date('2022-09-20T11:48:38.901Z'),
      full_name: 'aaaa (12 AED per day)',
      readableRate: 'AED 12.00 per day',
    },
  },
];
