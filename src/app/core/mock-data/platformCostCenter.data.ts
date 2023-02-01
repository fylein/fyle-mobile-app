//api single and multiple response
import { PlatformCostCenter } from '../models/platform/platform-cost-center.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';

export const apiCostCenterSingleResponse: PlatformApiResponse<PlatformCostCenter> = {
  count: 1,
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
  count: 3,
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
    {
      code: 'Administrion',
      created_at: new Date('2019-02-01T06:42:26.089771+00:00'),
      description: 'Administar4rtion',
      id: 85,
      is_enabled: true,
      name: 'Administration',
      org_id: 'orNVthTo2Zyo',
      updated_at: new Date('2019-02-01T06:58:37.247798+00:00'),
    },
    {
      code: 'Administration',
      created_at: new Date('2019-02-01T06:58:11.496848+00:00'),
      description: 'Administartion1',
      id: 86,
      is_enabled: true,
      name: 'Administeoerration',
      org_id: 'orNVthTo2Zyo',
      updated_at: new Date('2019-08-24T23:10:28.798154+00:00'),
    },
  ],
  offset: 0,
};
