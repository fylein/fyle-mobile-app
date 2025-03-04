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

export const featureConfigWalkthroughFinishData: FeatureConfig<{ shownCount: number; finishCount: number }> =
  deepFreeze({
    feature: 'DASHBOARD_NAVBAR_WALKTHROUGH',
    key: 'SHOW_NAVBAR_WALKTHROUGH',
    is_shared: false,
    sub_feature: null,
    value: {
      shownCount: 1,
      finishCount: 1,
    },
    target_client: 'web',
    org_id: 'org123',
    user_id: 'user123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

export const featureConfigWalkthroughStartData: FeatureConfig<{ shownCount: number; finishCount: number }> = deepFreeze(
  {
    feature: 'DASHBOARD_NAVBAR_WALKTHROUGH',
    key: 'SHOW_NAVBAR_WALKTHROUGH',
    is_shared: false,
    sub_feature: null,
    value: {
      shownCount: 1,
      finishCount: 0,
    },
    target_client: 'web',
    org_id: 'org123',
    user_id: 'user123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
);
