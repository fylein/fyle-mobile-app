import deepFreeze from 'deep-freeze-strict';

import { FeatureConfig } from '../models/feature-config.model';

export const featureConfigOptInData: FeatureConfig<{ count: number }> = deepFreeze({
  org_id: 'orwruogwnngg',
  user_id: 'uswjwgnwwgo',
  created_at: '2020-06-01T13:14:54.804+00:00',
  updated_at: '2020-06-11T13:14:55.201598+00:00',
  target_client: 'WEBAPP',
  feature: 'ADMIN_EXPENSES',
  sub_feature: 'ALL_EXPENSES',
  key: 'MANAGE_COLUMNS',
  value: {
    count: 0,
  },
  is_shared: true,
});
