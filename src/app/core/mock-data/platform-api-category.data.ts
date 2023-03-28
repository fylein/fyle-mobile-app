import { ApiV2Response } from '../models/api-v2.model';
import { PlatformCategory } from '../models/platform/platform-category.model';

export const platformApiCategoryRes: ApiV2Response<PlatformCategory> = {
  count: 318,
  data: [
    {
      created_at: new Date('2017-05-09T06:09:47.765967+00:00'),
      display_name: 'Food',
      id: 130,
      code: '42',
      is_enabled: true,
      name: 'Food',
      org_id: 'orrjqbDbeP9p',
      restricted_project_ids: [519, 589, 3837, 243580, 243581],
      sub_category: null,
      system_category: 'Food',
      updated_at: new Date('2022-05-05T17:45:33.737507+00:00'),
    },
  ],
  offset: 0,
};

export const platformApiAllCategories: ApiV2Response<PlatformCategory> = {
  count: 4,
  data: [
    {
      code: '93',
      created_at: new Date('2021-05-18T11:40:38.576068+00:00'),
      display_name: 'Business',
      id: 141295,
      is_enabled: true,
      name: 'Business',
      org_id: 'orrjqbDbeP9p',
      restricted_project_ids: [518, 519, 520, 589],
      sub_category: null,
      system_category: null,
      updated_at: new Date('2022-07-01T05:51:31.800155+00:00'),
    },
    {
      code: '98',
      created_at: new Date('2021-05-18T11:40:38.576068+00:00'),
      display_name: 'Pager',
      id: 141300,
      is_enabled: true,
      name: 'Pager',
      org_id: 'orrjqbDbeP9p',
      restricted_project_ids: [518, 519, 520, 589, 599],
      sub_category: null,
      system_category: null,
      updated_at: new Date('2022-05-05T17:47:06.951957+00:00'),
    },
    {
      code: '43',
      created_at: new Date('2023-01-09T16:54:09.929285+00:00'),
      display_name: 'samp category',
      id: 226646,
      is_enabled: true,
      name: 'samp category',
      org_id: 'orrjqbDbeP9p',
      restricted_project_ids: null,
      sub_category: null,
      system_category: null,
      updated_at: new Date('2023-01-09T16:54:09.929285+00:00'),
    },
    {
      code: '42',
      created_at: new Date('2023-01-09T16:54:09.929285+00:00'),
      display_name: 'Marketing outreach',
      id: 226659,
      is_enabled: true,
      name: 'Marketing outreach',
      org_id: 'orrjqbDbeP9p',
      restricted_project_ids: null,
      sub_category: null,
      system_category: null,
      updated_at: new Date('2023-01-09T16:54:09.929285+00:00'),
    },
  ],
  offset: 0,
};

export const platformApiCategoryById: ApiV2Response<PlatformCategory> = {
  count: 1,
  data: [
    {
      code: '93',
      created_at: new Date('2021-05-18T11:40:38.576068+00:00'),
      display_name: 'Business',
      id: 141295,
      is_enabled: true,
      name: 'Business',
      org_id: 'orrjqbDbeP9p',
      restricted_project_ids: [518, 519, 520, 589],
      sub_category: null,
      system_category: null,
      updated_at: new Date('2022-07-01T05:51:31.800155+00:00'),
    },
  ],
  offset: 0,
};
