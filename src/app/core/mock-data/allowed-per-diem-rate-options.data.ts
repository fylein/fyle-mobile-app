import deepFreeze from 'deep-freeze-strict';

import { AllowedPerDiemRateOptions } from '../models/allowed-per-diem-rate-options.model';

export const allowedPerDiemRateOptionsData1: AllowedPerDiemRateOptions[] = deepFreeze([
  {
    label: 'BulkTest2',
    value: {
      code: null,
      created_at: new Date('2020-08-12T16:09:14.551Z'),
      currency: 'USD',
      description: null,
      id: 4213,
      is_enabled: true,
      name: 'BulkTest2',
      org_id: 'orrjqbDbeP9p',
      rate: 50,
      updated_at: new Date('2022-09-20T11:48:38.901Z'),
    },
  },
  {
    label: 'aaaa',
    value: {
      code: null,
      created_at: new Date('2020-08-12T16:09:14.551Z'),
      currency: 'AED',
      description: null,
      id: 4224,
      is_enabled: true,
      name: 'aaaa',
      org_id: 'orrjqbDbeP9p',
      rate: 12,
      updated_at: new Date('2022-09-20T11:48:38.901Z'),
    },
  },
]);
