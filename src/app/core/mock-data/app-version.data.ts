import deepFreeze from 'deep-freeze-strict';

import { AppVersion } from '../models/app_version.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';

export const appVersionData1: AppVersion = deepFreeze({
  id: 'mockuuid123',
  user_id: 'usvKA4X8Ugcr',
  created_at: new Date('2023-02-23T13:59:29.526Z'),
  updated_at: new Date('2023-02-23T13:59:29.526Z'),
  version: '5.50.0',
  os: {
    name: 'IOS',
    version: '16.0.1',
  },
});

export const appVersionResponse: PlatformApiResponse<AppVersion[]> = deepFreeze({
  count: 1,
  offset: 0,
  data: [appVersionData1],
});
