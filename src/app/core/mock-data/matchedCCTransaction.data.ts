import { MatchedCCCTransaction } from '../models/matchedCCCTransaction.model';
import { TransactionStatus } from '../models/platform/v1/expense.model';

export const matchedCCTransactionData: Partial<MatchedCCCTransaction> = {
  id: 'btxnSte7sVQCM8',
  group_id: 'btxnSte7sVQCM8',
  amount: 260.37,
  vendor: 'test description',
  txn_dt: '2018-07-03T18:30:00.000Z',
  currency: 'USD',
  description: null,
  card_or_account_number: '7620',
  corporate_credit_card_account_number: '7620',
  orig_amount: null,
  orig_currency: null,
  status: TransactionStatus.PENDING,
  displayObject: 'Jul 4, 2018 - test description260.37',
};

export const matchedCCTransactionData2: Partial<MatchedCCCTransaction> = {
  id: 'btxnBdS2Kpvzhy',
  group_id: 'btxnBdS2Kpvzhy',
  amount: 205.21,
  vendor: 'test description',
  txn_dt: '2018-06-05T18:30:00.000Z',
  currency: 'USD',
  description: null,
  card_or_account_number: '9891',
  corporate_credit_card_account_number: '9891',
  orig_amount: null,
  orig_currency: null,
  status: TransactionStatus.PENDING,
  displayObject: 'Jun 6, 2018 - test description205.21',
};
