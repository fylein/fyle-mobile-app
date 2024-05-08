import deepFreeze from 'deep-freeze-strict';

import { CurrencyIp } from '../models/currency-ip.model';

export const currencyIpData: CurrencyIp = deepFreeze({
  ip: '49.37.243.217',
  currency: 'USD',
});

export const currencyIpData2: CurrencyIp = deepFreeze({
  ip: '49.37.243.217',
  currency: null,
});
