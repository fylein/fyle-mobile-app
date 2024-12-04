import deepFreeze from 'deep-freeze-strict';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';

export const personalCardAccessTokenResponse: PlatformApiResponse<{ access_token: string }> = deepFreeze({
  data: {
    access_token: 'bMWGrqpBH4ZEamNIh1VKSOvJBzvG',
  },
});
