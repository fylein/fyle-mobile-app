import deepFreeze from 'deep-freeze-strict';

import { CardDetailsAmountResponse } from '../models/card-details-amount-response';
import { CardDetailsResponse } from '../models/card-details-response.model';

export const virtualCardDetailsResponse: { data: CardDetailsResponse } = deepFreeze({
  data: {
    full_card_number: '123412341234123',
    cvv: '123',
    expiry_date: '2029-01-01T00:00:00+00:00',
  },
});

export const virtualCardCurrentAmountResponse: { data: CardDetailsAmountResponse } = deepFreeze({
  data: {
    current_amount: 1000,
  },
});
