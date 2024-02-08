import { CardDetailsAmountResponse } from '../models/card-details-amount-response';
import { CardDetailsResponse } from '../models/card-details-response.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';

export const virtualCardDetailsResponse: { data: CardDetailsResponse } = {
  data: {
    full_card_number: '123412341234123',
    cvv: '123',
    // @ts-ignore
    expiry_date: '2029-01-01T00:00:00+00:00',
  },
};

export const virtualCardCurrentAmountResponse: { data: CardDetailsAmountResponse } = {
  data: {
    current_amount: 1000,
  },
};
