import deepFreeze from 'deep-freeze-strict';

import { AccountOption } from '../models/account-option.model';
import { multiplePaymentModes } from '../test-data/accounts.service.spec.data';

export const accountOptionData1: AccountOption[] = deepFreeze([
  {
    label: 'account1',
    value: multiplePaymentModes[0],
  },
  {
    label: 'account2',
    value: multiplePaymentModes[1],
  },
]);
