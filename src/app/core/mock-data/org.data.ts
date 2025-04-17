import deepFreeze from 'deep-freeze-strict';

import { Org } from '../models/org.model';

export const orgData1: Org[] = deepFreeze([
  {
    id: 'orNVthTo2Zyo',
    created_at: new Date('2018-01-31T23:50:27.216Z'),
    updated_at: new Date('2023-02-16T13:05:08.547Z'),
    name: 'Staging Loaded',
    domain: 'fyle.in',
    currency: 'USD',
    is_primary: true,
    is_current: true,
  },
]);

export const orgData2 = deepFreeze([
  {
    id: 'orNVthTo2Zyo',
    created_at: new Date('2018-01-31T23:50:27.216Z'),
    updated_at: new Date('2023-02-16T13:05:08.547Z'),
    name: 'Staging Loaded',
    domain: 'fyle.in',
    currency: 'USD',
    is_primary: true,
    is_current: true,
  },
  {
    id: 'orNVthTo2Zyo',
    created_at: new Date('2018-01-31T23:50:27.216Z'),
    updated_at: new Date('2023-02-16T13:05:08.547Z'),
    name: 'Fyle Loaded',
    domain: 'fyle.in',
    currency: 'USD',
    is_primary: false,
    is_current: false,
  },
]);
