import { CardDetailsResponse } from '../models/card-details-response.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';

export const virtualCardDetailsResponse: PlatformApiResponse<CardDetailsResponse> = {
  count: 1,
  offset: 0,
  data: [
    {
      full_card_number: '123412341234123',
      cvv: '123',
      expiry_date: new Date('2024-03-03'),
    },
  ],
};

export const virtualCardCurrentAmountResponse: PlatformApiResponse<Record<string, number>> = {
  count: 1,
  offset: 0,
  data: [
    {
      current_amount: 1000,
    },
  ],
};
