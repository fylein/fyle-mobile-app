import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformMileageRates } from '../models/platform/platform-mileage-rates.model';

export const platformMileageRates: PlatformApiResponse<PlatformMileageRates> = {
  count: 4,
  data: [
    {
      code: null,
      created_at: new Date('2017-04-06T04:52:07.825000+00:00'),
      id: 57035,
      is_enabled: true,
      org_id: 'orrjqbDbeP9p',
      rate: 10,
      slab_rates: [],
      unit: 'MILES',
      updated_at: new Date('2022-10-07T13:14:26.390549+00:00'),
      vehicle_type: 'bicycle',
      readableRate: '₹10.00/mile',
    },
    {
      code: null,
      created_at: new Date('2017-04-06T04:52:07.825000+00:00'),
      id: 57036,
      is_enabled: true,
      org_id: 'orrjqbDbeP9p',
      rate: 102.256,
      slab_rates: [
        {
          limit: 12,
          rate: 100.002,
        },
      ],
      unit: 'MILES',
      updated_at: new Date('2022-08-10T05:08:37.572680+00:00'),
      vehicle_type: 'IRS testing',
      readableRate: '₹102.26/mile',
    },
    {
      code: null,
      created_at: new Date('2017-04-06T04:52:07.825000+00:00'),
      id: 57037,
      is_enabled: true,
      org_id: 'orrjqbDbeP9p',
      rate: 122,
      slab_rates: [
        {
          limit: 6,
          rate: 4,
        },
      ],
      unit: 'MILES',
      updated_at: new Date('2022-09-22T05:26:02.014758+00:00'),
      vehicle_type: 'electric_car',
      readableRate: '₹122.00/mile',
    },
    {
      code: null,
      created_at: new Date('2017-04-06T04:52:07.825000+00:00'),
      id: 57038,
      is_enabled: false,
      org_id: 'orrjqbDbeP9p',
      rate: 18,
      slab_rates: [
        {
          limit: 4,
          rate: 6,
        },
      ],
      unit: 'MILES',
      updated_at: new Date('2022-08-18T10:39:45.474213+00:00'),
      vehicle_type: 'Type 1',
      readableRate: '₹18.00/mile',
    },
  ],
  offset: 0,
};

export const platformMileageRatesSingleData: PlatformApiResponse<PlatformMileageRates> = {
  count: 1,
  data: [
    {
      code: null,
      created_at: new Date('2017-04-06T04:52:07.825000+00:00'),
      id: 57035,
      is_enabled: true,
      org_id: 'orrjqbDbeP9p',
      rate: 10,
      slab_rates: [],
      unit: 'MILES',
      updated_at: new Date('2022-10-07T13:14:26.390549+00:00'),
      vehicle_type: 'bicycle',
    },
  ],
  offset: 0,
};

export const platformMileageRates2: PlatformMileageRates[] = [
  {
    code: null,
    created_at: new Date('2017-04-06T04:52:07.825Z'),
    id: 57037,
    is_enabled: true,
    org_id: 'orrjqbDbeP9p',
    rate: 122,
    slab_rates: [
      {
        limit: 6,
        rate: 4,
      },
    ],
    unit: 'MILES',
    updated_at: new Date('2022-09-22T05:26:02.014Z'),
    vehicle_type: 'electric_car',
    readableRate: '$10/mi',
  },
  {
    code: null,
    created_at: new Date('2017-04-06T04:52:07.825Z'),
    id: 57038,
    is_enabled: true,
    org_id: 'orrjqbDbeP9p',
    rate: 18,
    slab_rates: [
      {
        limit: 4,
        rate: 6,
      },
    ],
    unit: 'MILES',
    updated_at: new Date('2022-08-18T10:39:45.474Z'),
    vehicle_type: 'Type 1',
    readableRate: '$10/mi',
  },
];
