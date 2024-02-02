import { CardDetailsAmountResponse, CardDetailsResponse } from '../models/card-details-response.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';

export const virtualCardDetailsResponse: Record<string, CardDetailsResponse> = {
  data: {
    full_card_number: '123412341234123',
    cvv: '123',
    expiry_date: '2029-01-01T00:00:00+00:00',
  },
};

export const virtualCardCurrentAmountResponse: Record<string, CardDetailsAmountResponse> = {
  data: {
    current_amount: 1000,
  },
};
