import { cloneDeep } from 'lodash';
import { orgSettingsGetData, orgSettingsPostData } from '../test-data/org-settings.service.spec.data';
import { OrgSettingsResponse } from '../models/org-settings.model';

export const orgSettingsAmexFeedDataRequest: OrgSettingsResponse = {
  ...cloneDeep(orgSettingsPostData),
  amex_feed_enrollment_settings: undefined,
};

export const orgSettingsAmexFeedDataResponse: OrgSettingsResponse = {
  ...cloneDeep(orgSettingsGetData),
  amex_feed_enrollment_settings: {
    allowed: undefined,
    enabled: undefined,
    virtual_card_settings_enabled: undefined,
  },
};
