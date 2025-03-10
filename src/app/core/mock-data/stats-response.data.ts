import deepFreeze from 'deep-freeze-strict';

import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { CardTransactionStat } from '../models/card-transaction-stat.model';

export const apiAssignedCardDetailsRes: PlatformApiResponse<CardTransactionStat[]> = deepFreeze({
  data: [
    {
      bank_name: 'DAMNA',
      card_number: '8698',
      corporate_card_id: 'bacc12bbrBYWye',
      count: 4,
      state: 'COMPLETE',
      total_amount: 3494,
    },
    {
      bank_name: 'DAMNA',
      card_number: '8698',
      corporate_card_id: 'bacc12bbrBYWye',
      count: 964,
      state: 'DRAFT',
      total_amount: 568437,
    },
  ],
});
