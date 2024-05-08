import { PlatformProjectParams } from 'src/app/core/models/platform/v1/platform-project-params.model';
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
      org_id: 'orFdTTTNcyye',
      updated_at: new Date('2021-07-08T10:28:27.686886'),
      name: 'Fyle Engineering',
      sub_project: null,
    },
  ],
  offset: 0,
});

export const ProjectPlatformParams: PlatformProjectParams = deepFreeze({
  org_id: 'eq.orNVthTo2Zyo',
  order: 'name.asc',
  limit: 10,
  offset: 0,
  is_enabled: 'eq.true',
  category_ids: 'ov.{,122269,122270,122271,122272,122273}',
  id: 'in.(3943,305792,148971,247936)',
  name: 'ilike.%search%',
});
