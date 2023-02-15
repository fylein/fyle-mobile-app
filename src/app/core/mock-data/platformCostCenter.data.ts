//api single and multiple response
import { PlatformCostCenter } from '../models/platform/platform-cost-center.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';

export const apiCostCenterSingleResponse: PlatformApiResponse<PlatformCostCenter> = {
  count: 4,
  data: [
    {
      code: 'code',
      created_at: new Date('2018-02-01T07:23:14.321866+00:00'),
      description: null,
      id: 37,
      is_enabled: true,
      name: 'Marketing',
      org_id: 'orNVthTo2Zyo',
      updated_at: new Date('2019-01-08T10:51:37.721398+00:00'),
    },
  ],
  offset: 0,
};

export const apiCostCenterMultipleResponse: PlatformApiResponse<PlatformCostCenter> = {
  count: 4,
  data: [
    {
      code: null,
      created_at: new Date('2019-06-24T15:12:04.002242+00:00'),
      description: null,
      id: 2411,
      is_enabled: true,
      name: 'SMS1',
      org_id: 'orNVthTo2Zyo',
      updated_at: new Date('2019-06-24T15:12:05.002242+00:00'),
    },
    {
      code: 'cost center code 2',
      created_at: new Date('2019-08-13T14:18:54.500829+00:00'),
      description: 'cost centers data',
      id: 2428,
      is_enabled: true,
      name: 'test cost',
      org_id: 'orNVthTo2Zyo',
      updated_at: new Date('2019-08-13T14:18:55.500829+00:00'),
    },
    {
      code: null,
      created_at: new Date('2019-10-30T07:16:37.975193+00:00'),
      description: null,
      id: 3247,
      is_enabled: true,
      name: 'cost centers mock data 1',
      org_id: 'orNVthTo2Zyo',
      updated_at: new Date('2019-10-30T07:16:38.975193+00:00'),
    },
    {
      code: 'cost center code 2',
      created_at: new Date('2019-10-30T08:25:54.040980+00:00'),
      description: 'this is the test description',
      id: 3260,
      is_enabled: true,
      name: 'cost center service 2',
      org_id: 'orNVthTo2Zyo',
      updated_at: new Date('2022-05-19T11:58:29.364759+00:00'),
    },
  ],
  offset: 0,
};
