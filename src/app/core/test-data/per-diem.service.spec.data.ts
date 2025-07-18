import deepFreeze from 'deep-freeze-strict';

export const apiPerDiemByID = deepFreeze({
  count: 1,
  data: [
    {
      code: null,
      created_at: '2018-10-25T09:40:40.729140+00:00',
      currency: 'INR',
      description: null,
      id: 538,
      is_enabled: false,
      name: 'Food 3',
      org_id: 'orrjqbDbeP9p',
      rate: 140,
      updated_at: '2022-08-11T09:50:26.804683+00:00',
    },
  ],
  offset: 0,
});

export const expectPerDiemByID = deepFreeze({
  active: false,
  created_at: new Date('2018-10-25T09:40:40.729Z'),
  currency: 'INR',
  id: 538,
  name: 'Food 3',
  org_id: 'orrjqbDbeP9p',
  rate: 140,
  updated_at: new Date('2022-08-11T09:50:26.804Z'),
});

export const apiPerDiemSingleResponse = deepFreeze({
  count: 4,
  data: [
    {
      code: null,
      created_at: '2018-10-08T06:37:01.337001+00:00',
      currency: 'INR',
      description: null,
      id: 502,
      is_enabled: true,
      name: 'Fyle-Test2',
      org_id: 'orNVthTo2Zyo',
      rate: 65,
      updated_at: '2023-01-09T12:11:49.705191+00:00',
    },
  ],
  offset: 0,
});

export const expectedPerDiems = deepFreeze([
  {
    active: true,
    created_at: new Date('2018-10-08T06:37:01.337Z'),
    currency: 'INR',
    id: 502,
    name: 'Fyle-Test2',
    org_id: 'orNVthTo2Zyo',
    rate: 65,
    updated_at: new Date('2023-01-09T12:11:49.705Z'),
  },
  {
    active: true,
    created_at: new Date('2018-10-08T15:45:06.392Z'),
    currency: 'INR',
    id: 508,
    name: 'Abcd',
    org_id: 'orNVthTo2Zyo',
    rate: 50,
    updated_at: new Date('2023-01-10T09:11:42.343Z'),
  },
  {
    active: true,
    created_at: new Date('2019-06-25T06:10:17.910Z'),
    currency: 'INR',
    id: 616,
    name: 'ntewwww',
    org_id: 'orNVthTo2Zyo',
    rate: 113,
    updated_at: new Date('2023-01-10T07:19:21.950Z'),
  },
  {
    active: true,
    created_at: new Date('2021-08-24T06:33:51.165Z'),
    currency: 'INR',
    id: 5404,
    name: '3Per',
    org_id: 'orNVthTo2Zyo',
    rate: 3,
    updated_at: new Date('2023-01-10T07:18:10.082Z'),
  },
]);

export const apiPerDiem = deepFreeze({
  count: 4,
  data: [
    {
      code: null,
      created_at: '2018-10-08T06:37:01.337001+00:00',
      currency: 'INR',
      description: null,
      id: 502,
      is_enabled: true,
      name: 'Fyle-Test2',
      org_id: 'orNVthTo2Zyo',
      rate: 65,
      updated_at: '2023-01-09T12:11:49.705191+00:00',
    },
    {
      code: null,
      created_at: '2018-10-08T15:45:06.392658+00:00',
      currency: 'INR',
      description: null,
      id: 508,
      is_enabled: true,
      name: 'Abcd',
      org_id: 'orNVthTo2Zyo',
      rate: 50,
      updated_at: '2023-01-10T09:11:42.343021+00:00',
    },
    {
      code: null,
      created_at: '2019-06-25T06:10:17.910851+00:00',
      currency: 'INR',
      description: null,
      id: 616,
      is_enabled: true,
      name: 'ntewwww',
      org_id: 'orNVthTo2Zyo',
      rate: 113,
      updated_at: '2023-01-10T07:19:21.950152+00:00',
    },
    {
      code: null,
      created_at: '2021-08-24T06:33:51.165681+00:00',
      currency: 'INR',
      description: null,
      id: 5404,
      is_enabled: true,
      name: '3Per',
      org_id: 'orNVthTo2Zyo',
      rate: 3,
      updated_at: '2023-01-10T07:18:10.082671+00:00',
    },
  ],
  offset: 0,
});

export const apiPerDiemFirst = deepFreeze({
  count: 4,
  data: [
    {
      code: null,
      created_at: '2018-10-08T06:37:01.337001+00:00',
      currency: 'INR',
      description: null,
      id: 502,
      is_enabled: true,
      name: 'Fyle-Test2',
      org_id: 'orNVthTo2Zyo',
      rate: 65,
      updated_at: '2023-01-09T12:11:49.705191+00:00',
    },
    {
      code: null,
      created_at: '2018-10-08T15:45:06.392658+00:00',
      currency: 'INR',
      description: null,
      id: 508,
      is_enabled: true,
      name: 'Abcd',
      org_id: 'orNVthTo2Zyo',
      rate: 50,
      updated_at: '2023-01-10T09:11:42.343021+00:00',
    },
  ],
  offset: 0,
});

export const apiPerDiemSecond = deepFreeze({
  count: 4,
  data: [
    {
      code: null,
      created_at: '2019-06-25T06:10:17.910851+00:00',
      currency: 'INR',
      description: null,
      id: 616,
      is_enabled: true,
      name: 'ntewwww',
      org_id: 'orNVthTo2Zyo',
      rate: 113,
      updated_at: '2023-01-10T07:19:21.950152+00:00',
    },
    {
      code: null,
      created_at: '2021-08-24T06:33:51.165681+00:00',
      currency: 'INR',
      description: null,
      id: 5404,
      is_enabled: true,
      name: '3Per',
      org_id: 'orNVthTo2Zyo',
      rate: 3,
      updated_at: '2023-01-10T07:18:10.082671+00:00',
    },
  ],
  offset: 2,
});

export const allPerDiemRatesParam = deepFreeze([
  {
    active: true,
    created_at: '2020-08-12T16:09:14.551376+00:00',
    currency: 'INR',
    id: 4212,
    name: 'BulkTest1',
    org_id: 'orrjqbDbeP9p',
    rate: 500,
    updated_at: '2022-09-20T11:48:37.454797+00:00',
    full_name: 'BulkTest1 (500 INR per day)',
    readableRate: '₹500.00 per day',
  },
  {
    active: true,
    created_at: '2020-08-12T16:09:14.551376+00:00',
    currency: 'USD',
    id: 4213,
    name: 'BulkTest2',
    org_id: 'orrjqbDbeP9p',
    rate: 50,
    updated_at: '2022-09-20T11:48:38.901050+00:00',
    full_name: 'BulkTest2 (50 USD per day)',
    readableRate: '$50.00 per day',
  },
  {
    active: true,
    created_at: '2020-08-19T11:39:05.428479+00:00',
    currency: 'AED',
    id: 4224,
    name: 'aaaa',
    org_id: 'orrjqbDbeP9p',
    rate: 12,
    updated_at: '2022-10-07T13:23:35.509419+00:00',
    full_name: 'aaaa (12 AED per day)',
    readableRate: 'AED 12.00 per day',
  },
]);

export const allowedPerDiem = deepFreeze([
  {
    active: true,
    created_at: '2020-08-12T16:09:14.551Z',
    currency: 'USD',
    id: 4213,
    name: 'BulkTest2',
    org_id: 'orrjqbDbeP9p',
    rate: 50,
    updated_at: '2022-09-20T11:48:38.901Z',
    full_name: 'BulkTest2 (50 USD per day)',
    readableRate: '$50.00 per day',
  },
  {
    active: true,
    created_at: '2020-08-19T11:39:05.428Z',
    currency: 'AED',
    id: 4224,
    name: 'aaaa',
    org_id: 'orrjqbDbeP9p',
    rate: 12,
    updated_at: '2022-10-07T13:23:35.509Z',
    full_name: 'aaaa (12 AED per day)',
    readableRate: 'AED 12.00 per day',
  },
]);
