import deepFreeze from 'deep-freeze-strict';

import { YodleeAccessToken } from '../models/yoodle-token.model';

export const apiToken: YodleeAccessToken = deepFreeze({
  access_token: 'bMWGrqpBH4ZEamNIh1VKSOvJBzvG',
  fast_link_url: 'https://fl4.preprod.yodlee.com/authenticate/development-448/fastlink/?channelAppName=tieredpreprod',
});
