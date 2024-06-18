import deepFreeze from 'deep-freeze-strict';

import { AdvanceWallet } from 'src/app/core/models/platform/v1/advance-wallet.model';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { APIQueryParams } from 'src/app/core/models/platform/v1/query-params.model';

export const advanceWalletCountQueryParam: APIQueryParams = deepFreeze({
  offset: 0,
  limit: 0,
});

export const advanceWalletQueryParam: APIQueryParams = deepFreeze({
  offset: 0,
  limit: 200,
  order: 'created_at.desc,id.desc',
});

export const advanceWalletPaginated1: AdvanceWallet[] = deepFreeze([
  {
    currency: 'USD',
    balance_amount: 500,
    id: 'areq1234',
    org_id: 'orNVthTo2Zyo',
    user_id: 'usvKA4X8Ugcr',
    created_at: new Date('2021-03-14T06:07:39.652664+00:00'),
    updated_at: new Date('2022-05-05T17:45:12.393241+00:00'),
  },
  {
    currency: 'USD',
    balance_amount: 100,
    id: 'areq5678',
    org_id: 'orNVthTo2Zyo',
    user_id: 'usvKA4X8Ugcr',
    created_at: new Date('2021-03-14T06:07:39.652664+00:00'),
    updated_at: new Date('2022-05-05T17:45:11.742874+00:00'),
  },
]);

export const advanceWalletPaginated2: AdvanceWallet[] = deepFreeze([
  {
    currency: 'USD',
    balance_amount: 500,
    id: 'areq1111',
    org_id: 'orNVthTo2Zyo',
    user_id: 'usvKA4X8Ugcr',
    created_at: new Date('2021-03-14T06:07:39.652664+00:00'),
    updated_at: new Date('2022-05-05T17:45:12.393241+00:00'),
  },
  {
    currency: 'USD',
    balance_amount: 100,
    id: 'areq0000',
    org_id: 'orNVthTo2Zyo',
    user_id: 'usvKA4X8Ugcr',
    created_at: new Date('2021-03-14T06:07:39.652664+00:00'),
    updated_at: new Date('2022-05-05T17:45:11.742874+00:00'),
  },
]);

export const expectedAdvanceWalletPaginated: AdvanceWallet[] = deepFreeze([
  {
    currency: 'USD',
    balance_amount: 500,
    id: 'areq1234',
    org_id: 'orNVthTo2Zyo',
    user_id: 'usvKA4X8Ugcr',
    created_at: new Date('2021-03-14T06:07:39.652664+00:00'),
    updated_at: new Date('2022-05-05T17:45:12.393241+00:00'),
  },
  {
    currency: 'USD',
    balance_amount: 100,
    id: 'areq5678',
    org_id: 'orNVthTo2Zyo',
    user_id: 'usvKA4X8Ugcr',
    created_at: new Date('2021-03-14T06:07:39.652664+00:00'),
    updated_at: new Date('2022-05-05T17:45:11.742874+00:00'),
  },
  {
    currency: 'USD',
    balance_amount: 500,
    id: 'areq1111',
    org_id: 'orNVthTo2Zyo',
    user_id: 'usvKA4X8Ugcr',
    created_at: new Date('2021-03-14T06:07:39.652664+00:00'),
    updated_at: new Date('2022-05-05T17:45:12.393241+00:00'),
  },
  {
    currency: 'USD',
    balance_amount: 100,
    id: 'areq0000',
    org_id: 'orNVthTo2Zyo',
    user_id: 'usvKA4X8Ugcr',
    created_at: new Date('2021-03-14T06:07:39.652664+00:00'),
    updated_at: new Date('2022-05-05T17:45:11.742874+00:00'),
  },
]);

export const advanceWalletsResponse: PlatformApiResponse<AdvanceWallet[]> = deepFreeze({
  count: 2,
  data: advanceWalletPaginated1,
  offset: 0,
});
