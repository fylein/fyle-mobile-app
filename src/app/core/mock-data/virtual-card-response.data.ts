import { CardStatus } from '../enums/card-status.enum';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { VirtualCard } from '../models/virtual-card.model';

export const virtualCardResponse: PlatformApiResponse<VirtualCard> = {
  count: 1,
  data: [
    {
      amex_account_id: 'amacume6Bw1WQ2',
      created_at: '2024-02-06T20:16:33.981634+00:00',
      creator_user_id: 'us3csPBnWxv6',
      expiry_date: '2029-02-01T00:00:00+00:00',
      id: 'vcgNQmrZvGhL',
      last_five: '35799',
      nick_name: 'Demo Cad',
      org_id: 'or76bSzYIDxb',
      state: CardStatus.INACTIVE,
      updated_at: '2024-02-06T20:16:33.981634+00:00',
      user_id: 'usqigaQKd1sI',
      valid_from_at: '2024-02-06T00:00:00+00:00',
      valid_till_at: '2024-02-08T00:00:00+00:00',
    },
  ],
  offset: 0,
};
