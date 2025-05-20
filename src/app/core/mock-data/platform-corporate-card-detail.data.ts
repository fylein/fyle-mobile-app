import deepFreeze from 'deep-freeze-strict';

import { PlatformCorporateCardDetail } from '../models/platform-corporate-card-detail.model';
import { mastercardRTFCard, statementUploadedCard, virtualCard, visaRTFCard } from './platform-corporate-card.data';
import { virtualCardCombinedResponse } from './virtual-card-combined-response.data';

export const virtualCardDetails: PlatformCorporateCardDetail[] = deepFreeze([
  {
    card: virtualCard,
    stats: {
      totalDraftTxns: 0,
      totalDraftAmount: 0,
      totalCompleteTxns: 0,
      totalCompleteExpensesAmount: 0,
      totalTxnsCount: 0,
    },
  },
]);

export const cardDetailsRes: PlatformCorporateCardDetail[] = deepFreeze([
  {
    card: visaRTFCard,
    stats: {
      totalDraftTxns: 960,
      totalDraftAmount: 565633,
      totalCompleteTxns: 0,
      totalCompleteExpensesAmount: 0,
      totalTxnsCount: 960,
    },
  },
  {
    card: mastercardRTFCard,
    stats: {
      totalDraftTxns: 6,
      totalDraftAmount: 937.2,
      totalCompleteTxns: 0,
      totalCompleteExpensesAmount: 0,
      totalTxnsCount: 6,
    },
  },
  {
    card: statementUploadedCard,
    stats: {
      totalDraftTxns: 9,
      totalDraftAmount: 2624.27,
      totalCompleteTxns: 0,
      totalCompleteExpensesAmount: 0,
      totalTxnsCount: 9,
    },
  },
  virtualCardDetails[0],
  {
    card: visaRTFCard,
    stats: {
      totalDraftTxns: 960,
      totalDraftAmount: 565633,
      totalCompleteTxns: 2,
      totalCompleteExpensesAmount: 100,
      totalTxnsCount: 960,
    },
  },
]);

export const statementUploadedCardDetail: PlatformCorporateCardDetail[] = deepFreeze([
  {
    card: statementUploadedCard,
    stats: {
      totalDraftTxns: 6,
      totalDraftAmount: 937.2,
      totalCompleteTxns: 6,
      totalCompleteExpensesAmount: 937.2,
      totalTxnsCount: 12,
    },
  },
]);

export const virtualCardDetailsCombined: PlatformCorporateCardDetail[] = deepFreeze([
  {
    ...virtualCardDetails[0],
    virtualCardDetail: virtualCardCombinedResponse.vc1234,
  },
]);
