import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformProject } from '../models/platform/platform-project.model';
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
