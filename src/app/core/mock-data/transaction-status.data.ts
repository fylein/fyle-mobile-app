import { TransactionStatus } from '../models/transaction-status.model';

export const txnStatusData: TransactionStatus = {
  id: 'stjIdPp8BX8O',
  created_at: new Date('2022-11-17T06:07:38.590Z'),
  org_user_id: 'ouX8dwsbLCLv',
  comment: 'a comment',
  diff: null,
  state: null,
  transaction_id: null,
  report_id: 'rpkpSa8guCuR',
  advance_request_id: null,
};

export const expenseStatusData: TransactionStatus = {
  advance_request_id: null,
  comment: 'A comment',
  created_at: new Date('2024-02-11T16:43:25.675Z'),
  diff: null,
  id: 'stnn4fH4i8MU',
  org_user_id: 'ou6cE4dCLH8d',
  report_id: null,
  state: null,
  transaction_id: 'txNWAit6pFgw',
};

export const txnStatusData1: TransactionStatus = {
  id: 'stjIdPp7BX81',
  created_at: new Date('2022-11-17T06:07:38.590Z'),
  org_user_id: 'ouX8dwsbLCLv',
  comment: 'Policy violation explanation: another comment',
  diff: null,
  state: null,
  transaction_id: 'txxkBruL0EO9',
  report_id: null,
  advance_request_id: null,
};

export const txnStatusData2: TransactionStatus = {
  id: 'stjIdPp7BX81',
  created_at: new Date('2022-11-17T06:07:38.590Z'),
  org_user_id: 'ouX8dwsbLCLv',
  comment: 'No policy violation explanation provided',
  diff: null,
  state: null,
  transaction_id: 'txNVtsqF8Siq',
  report_id: null,
  advance_request_id: null,
};
