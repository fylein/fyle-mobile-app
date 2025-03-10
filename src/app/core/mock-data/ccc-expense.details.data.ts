import deepFreeze from 'deep-freeze-strict';

import { CCCDetails } from '../models/ccc-expense-details.model';

// Converted to the new CCCDetails format
export const expectedAssignedCCCStats: CCCDetails[] = deepFreeze([
  {
    bank_name: 'DAMNA',
    card_number: '8698',
    corporate_card_id: 'bacc12bbrBYWye',
    DRAFT: {
      count: 964,
      total_amount: 568437,
    },
    COMPLETE: {
      count: 4,
      total_amount: 3494,
    },
  },
]);

export const mastercardCCCStats: CCCDetails[] = deepFreeze([
  {
    bank_name: 'MASTERCARD_BANK',
    card_number: '5555',
    corporate_card_id: 'bacc15bbrRGWzf',
    DRAFT: {
      count: 6,
      total_amount: 937.2,
    },
    COMPLETE: {
      count: 6,
      total_amount: 937.2,
    },
  },
]);

export const emptyCCCStats: CCCDetails[] = deepFreeze([] as CCCDetails[]);
