import deepFreeze from 'deep-freeze-strict';

import { UniqueCards } from '../models/unique-cards.model';

export const uniqueCardsParam: UniqueCards[] = deepFreeze([
  {
    cardNumber: '8698',
    cardName: 'DAMNA',
  },
  {
    cardNumber: '8698',
    cardName: 'DAMNA',
  },
  {
    cardNumber: '869',
    cardName: 'PEX BANK',
  },
]);
