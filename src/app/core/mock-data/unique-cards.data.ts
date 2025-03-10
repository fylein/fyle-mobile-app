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

export const uniqueCardsData: UniqueCards[] = deepFreeze([
  {
    cardNumber: '8698',
    cardName: 'DAMNA',
    cardNickname: 'Business Card1',
  },
  {
    cardNumber: '8698',
    cardName: 'DAMNA',
    cardNickname: 'Business Card2',
  },
  {
    cardNumber: '869',
    cardName: 'PEX BANK',
  },
]);
