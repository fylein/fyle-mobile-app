import { AccountOption } from '../models/account-option.model';
import { multiplePaymentModesData } from '../test-data/accounts.service.spec.data';

export const accountOptionData1: AccountOption[] = [
  {
    label: 'account1',
    value: multiplePaymentModesData[0],
  },
  {
    label: 'account2',
    value: multiplePaymentModesData[1],
  },
];
