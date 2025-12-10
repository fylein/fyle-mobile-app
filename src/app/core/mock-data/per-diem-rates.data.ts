import deepFreeze from 'deep-freeze-strict';

import { PlatformPerDiemRates } from '../models/platform/platform-per-diem-rates.model';

export const perDiemRatesData1: PlatformPerDiemRates = deepFreeze({
  code: null,
  created_at: new Date('2023-08-21'),
  currency: 'USD',
  description: null,
  full_name: 'Rate 1 (30 USD per day)',
  id: 440,
  is_enabled: true,
  name: 'Rate 1',
  org_id: 'orrb8EW1zZsy',
  rate: 30,
  readableRate: '$30.00 per day',
  updated_at: new Date('2023-08-21'),
});

export const perDiemRatesData2: PlatformPerDiemRates = deepFreeze({
  ...perDiemRatesData1,
  currency: 'INR',
  full_name: 'Rate 1 (300 INR per day)',
  rate: 300,
  readableRate: '₹300.00 per day',
});
