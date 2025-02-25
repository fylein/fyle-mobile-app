import deepFreeze from 'deep-freeze-strict';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformPersonalCard } from '../models/platform/platform-personal-card.model';

export const deletePersonalCardPlatformRes: PlatformApiResponse<PlatformPersonalCard> = deepFreeze({
  data: {
    account_type: 'SAVINGS',
    bank_name: 'Dag Site',
    card_number: 'xxxx3235',
    created_at: new Date('2024-11-11T06:20:18.061281+00:00'),
    currency: 'USD',
    id: 'bacc0By33NqhnS',
    org_id: 'orrb8EW1zZsy',
    updated_at: new Date('2024-11-11T06:20:18.061281+00:00'),
    user_id: 'us2KhpQLpzX4',
    yodlee_account_id: 'yacQm13ONl3q1',
    yodlee_fastlink_params: null,
    yodlee_is_credential_update_required: false,
    yodlee_is_mfa_required: false,
    yodlee_last_synced_at: null,
    yodlee_login_id: 'ou6kAM3CXV7d',
    yodlee_provider_account_id: '10287107',
  },
});

export const platformApiLinkedAccRes: PlatformApiResponse<PlatformPersonalCard[]> = deepFreeze({
  count: 2,
  data: [
    {
      account_type: 'SAVINGS',
      bank_name: 'Dag Site',
      card_number: 'xxxx3201',
      created_at: new Date('2024-11-11T09:43:39.530942+00:00'),
      currency: 'USD',
      id: 'baccT14CjCJJ7H',
      org_id: 'orrb8EW1zZsy',
      updated_at: new Date('2024-11-11T09:43:39.530942+00:00'),
      user_id: 'us2KhpQLpzX4',
      yodlee_account_id: 'yacmuKWsN1arS',
      yodlee_fastlink_params: null,
      yodlee_is_credential_update_required: false,
      yodlee_is_mfa_required: false,
      yodlee_last_synced_at: null,
      yodlee_login_id: 'ou6kAM3CXV7d',
      yodlee_provider_account_id: '10287109',
    },
    {
      account_type: 'SAVINGS',
      bank_name: 'Dag Site',
      card_number: 'xxxx8791',
      created_at: new Date('2024-11-11T09:43:39.518572+00:00'),
      currency: 'USD',
      id: 'baccCqRv6YdSqZ',
      org_id: 'orrb8EW1zZsy',
      updated_at: new Date('2024-11-11T09:43:39.518572+00:00'),
      user_id: 'us2KhpQLpzX4',
      yodlee_account_id: 'yacOjVeY4Ex0s',
      yodlee_fastlink_params: null,
      yodlee_is_credential_update_required: false,
      yodlee_is_mfa_required: false,
      yodlee_last_synced_at: null,
      yodlee_login_id: 'ou6kAM3CXV7d',
      yodlee_provider_account_id: '10287109',
    },
  ],
  offset: 0,
});

export const linkedAccounts: PlatformPersonalCard[] = deepFreeze([
  {
    account_type: 'CREDIT',
    bank_name: 'Dag Site yodlee',
    card_number: 'xxxx3201',
    created_at: new Date('2024-11-11T09:43:39.530942+00:00'),
    currency: 'USD',
    id: 'baccY70V3Mz048',
    org_id: 'orrb8EW1zZsy',
    updated_at: new Date('2024-11-11T09:43:39.530942+00:00'),
    user_id: 'us2KhpQLpzX4',
    yodlee_account_id: 'yacmuKWsN1arS',
    yodlee_fastlink_params: null,
    yodlee_is_credential_update_required: false,
    yodlee_is_mfa_required: false,
    yodlee_last_synced_at: null,
    yodlee_login_id: 'ou6kAM3CXV7d',
    yodlee_provider_account_id: '10287109',
  },
  {
    account_type: 'CREDIT',
    bank_name: 'Dag Site yodlee',
    card_number: 'xxxx9806',
    created_at: new Date('2024-11-11T09:43:39.518572+00:00'),
    currency: 'USD',
    id: 'baccCqRv6YdSqZ',
    org_id: 'orrb8EW1zZsy',
    updated_at: new Date('2024-11-11T09:43:39.518572+00:00'),
    user_id: 'us2KhpQLpzX4',
    yodlee_account_id: 'yacOjVeY4Ex0s',
    yodlee_fastlink_params: null,
    yodlee_is_credential_update_required: false,
    yodlee_is_mfa_required: false,
    yodlee_last_synced_at: null,
    yodlee_login_id: 'ou6kAM3CXV7d',
    yodlee_provider_account_id: '10287109',
  },
]);
