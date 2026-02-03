import { PlatformApiResponse } from '../../../models/platform/platform-api-response.model';
import { PlatformProject } from '../../../models/platform/platform-project.model';
import deepFreeze from 'deep-freeze-strict';

export const platformProjectSingleRes: PlatformApiResponse<PlatformProject[]> = deepFreeze({
  count: 1,
  data: [
    {
      is_enabled: true,
      code: '1184',
      created_at: new Date('2021-05-12T10:28:40.834844'),
      description: 'Sage Intacct Project - Customer Mapped Project, Id - 1184',
      id: 257528,
      name: 'Customer Mapped Project',
      category_ids: [122269, 122270, 122271, null],
      default_billable: true,
      org_id: 'orFdTTTNcyye',
      updated_at: new Date('2021-07-08T10:28:27.686886'),
      display_name: 'Customer Mapped Project',
      sub_project: null,
    },
  ],
  offset: 0,
});

export const platformAPIResponseMultiple: PlatformApiResponse<PlatformProject[]> = deepFreeze({
  count: 2,
  data: [
    {
      is_enabled: true,
      code: '1184',
      created_at: new Date('2021-05-12T10:28:40.834844'),
      description: 'Sage Intacct Project - Customer Mapped Project, Id - 1184',
      id: 257528,
      display_name: 'Customer Mapped Project',
      category_ids: [122269, 122270, 122271, null],
      default_billable: true,
      org_id: 'orFdTTTNcyye',
      updated_at: new Date('2021-07-08T10:28:27.686886'),
      name: 'Customer Mapped Project',
      sub_project: null,
    },
    {
      is_enabled: true,
      code: '1182',
      created_at: new Date('2021-05-12T10:28:40.834844'),
      description: 'Sage Intacct Project - Fyle Engineering, Id - 1182',
      id: 257529,
      display_name: 'Fyle Engineering',
      category_ids: [122269, 122270, 122271],
      default_billable: false,
      org_id: 'orFdTTTNcyye',
      updated_at: new Date('2021-07-08T10:28:27.686886'),
      name: 'Fyle Engineering',
      sub_project: null,
    },
  ],
  offset: 0,
});

export const platformAPIResponseActiveOnly: PlatformApiResponse<PlatformProject[]> = deepFreeze({
  count: 4,
  data: [
    {
      id: 257528,
      created_at: new Date('2021-05-12T10:28:40.834Z'),
      updated_at: new Date('2021-07-08T10:28:27.686Z'),
      name: 'Customer Mapped Project',
      sub_project: null,
      code: '1184',
      org_id: 'orFdTTTNcyye',
      description: 'Sage Intacct Project - Customer Mapped Project, Id - 1184',
      is_enabled: true,
      category_ids: [null, 145429, 122269, 122271],
      display_name: 'Customer Mapped Project',
    },
    {
      id: 257541,
      created_at: new Date('2021-05-12T10:28:40.834Z'),
      updated_at: new Date('2021-07-08T10:28:27.686Z'),
      name: 'Sage Project 8',
      sub_project: null,
      code: '1178',
      org_id: 'orFdTTTNcyye',
      description: 'Sage Intacct Project - Sage Project 8, Id - 1178',
      is_enabled: true,
      category_ids: [null, 145429, 122269, 122271],
      display_name: 'Customer Mapped Project',
    },
    {
      id: 257531,
      created_at: new Date('2021-05-12T10:28:40.834Z'),
      updated_at: new Date('2021-07-08T10:28:27.686Z'),
      name: 'Fyle Team Integrations',
      sub_project: null,
      code: '1183',
      org_id: 'orFdTTTNcyye',
      description: 'Sage Intacct Project - Fyle Team Integrations, Id - 1183',
      is_enabled: true,
      category_ids: null,
      display_name: 'Customer Mapped Project',
    },
  ],
  offset: 0,
});

export const platformAPIResponseNullCategories: PlatformApiResponse<PlatformProject[]> = deepFreeze({
  count: 4,
  data: [
    {
      id: 257528,
      created_at: new Date('2021-05-12T10:28:40.834Z'),
      updated_at: new Date('2021-07-08T10:28:27.686Z'),
      name: 'Customer Mapped Project',
      sub_project: null,
      code: '1184',
      org_id: 'orFdTTTNcyye',
      description: 'Sage Intacct Project - Customer Mapped Project, Id - 1184',
      is_enabled: true,
      category_ids: null,
      display_name: 'Customer Mapped Project',
      default_billable: true,
    },
  ],
  offset: 0,
});
