import deepFreeze from 'deep-freeze-strict';

import { CurrencyObj } from '../models/currency-obj.model';

export const currencyObjData1: CurrencyObj = deepFreeze({
  amount: 23,
  currency: 'USD',
  orig_amount: 23,
  orig_currency: 'USD',
});

export const currencyObjData2: CurrencyObj = deepFreeze({
  amount: 2000,
  currency: 'INR',
  orig_amount: 2000,
  orig_currency: 'INR',
});

export const currencyObjData3: CurrencyObj = deepFreeze({
  amount: 0.00001,
  currency: 'INR',
  orig_amount: 0.00001,
  orig_currency: 'INR',
});

export const currencyObjData4: CurrencyObj = deepFreeze({
  orig_currency: 'USD',
  orig_amount: 800000,
  currency: 'USD',
  amount: 800000,
});

export const currencyObjData5: CurrencyObj = deepFreeze({
  currency: 'USD',
  amount: 90,
  orig_currency: null,
  orig_amount: null,
});

export const currencyObjData6: CurrencyObj = deepFreeze({
  currency: 'USD',
  amount: 10800,
  orig_currency: 'INR',
  orig_amount: 900,
});
