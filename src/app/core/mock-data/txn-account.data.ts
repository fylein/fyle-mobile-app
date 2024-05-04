import deepFreeze from 'deep-freeze-strict';

import { TransactionAccount } from '../models/transaction-account.model';

export const txnAccountData: TransactionAccount = deepFreeze({
  source_account_id: 'acc5APeygFjRd',
  skip_reimbursement: false,
});
