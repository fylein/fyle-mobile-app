import { DuplicateSet } from '../models/v2/duplicate-sets.model';

export const handleDuplicatesData: DuplicateSet[] = [
  {
    transaction_ids: ['tx1ZvrMjIj4W', 'tx8v1PZSUxy5', 'txKW3vYo8W2v', 'txrqSbTqSqTL', 'txrYwpiVxqN2'],
    fields: ['orig_currency', 'orig_amount', 'txn_dt'],
  },
  {
    transaction_ids: ['tx2uLjJ0myYh', 'txG1X6BHLOGL', 'txu84fUBIMrd'],
    fields: ['orig_currency', 'orig_amount', 'txn_dt'],
  },
  {
    transaction_ids: ['tx2uLjJ0myYh', 'txnjPIZMcwxc'],
    fields: ['amount', 'currency', 'txn_dt'],
  },
  {
    transaction_ids: ['tx5CixxvxeAF', 'txCyV7WCXXqD'],
    fields: ['amount', 'currency', 'txn_dt'],
  },
];

export const handleDuplicatesDataResponse = [
  {
    transaction_ids: ['tx1ZvrMjIj4W', 'tx8v1PZSUxy5', 'txKW3vYo8W2v', 'txrqSbTqSqTL', 'txrYwpiVxqN2'],
    fields: ['orig_currency', 'orig_amount', 'txn_dt'],
  },
  {
    transaction_ids: ['tx2uLjJ0myYh', 'txG1X6BHLOGL', 'txu84fUBIMrd'],
    fields: ['orig_currency', 'orig_amount', 'txn_dt'],
  },
  {
    transaction_ids: ['tx2uLjJ0myYh', 'txnjPIZMcwxc'],
    fields: ['amount', 'currency', 'txn_dt'],
  },
  {
    transaction_ids: ['tx5CixxvxeAF', 'txCyV7WCXXqD'],
    fields: ['amount', 'currency', 'txn_dt'],
  },
];
