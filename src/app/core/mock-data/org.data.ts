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

export const orgData3 = deepFreeze([
  {
    created_at: new Date('2017-04-06T04:52:07.820Z'),
    currency: 'INR',
    domain: 'fyledemo.com',
    id: 'orrjqbDbeP9p',
    is_current: true,
    is_primary: false,
    name: 'Fyle Staging',
    updated_at: new Date('2025-04-10T06:29:35.058521Z'),
  },
  {
    created_at: new Date('2018-01-31T23:50:27.216Z'),
    currency: 'INR',
    domain: 'fyle.in',
    id: 'orNVthTo2Zyo',
    is_current: false,
    is_primary: true,
    name: 'Staging Loaded',
    updated_at: new Date('2025-04-07T09:24:11.225401Z'),
  },
]);
