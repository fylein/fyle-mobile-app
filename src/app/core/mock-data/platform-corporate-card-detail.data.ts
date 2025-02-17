import deepFreeze from 'deep-freeze-strict';

import { PlatformCorporateCardDetail } from '../models/platform-corporate-card-detail.model';
import { mastercardRTFCard, statementUploadedCard, virtualCard, visaRTFCard } from './platform-corporate-card.data';
import { virtualCardCombinedResponse } from './virtual-card-combined-response.data';

export const virtualCardDetails: PlatformCorporateCardDetail[] = deepFreeze([
  {
    card: virtualCard,
    stats: {
      totalDraftTxns: 0,
      totalDraftValue: 0,
      totalCompleteTxns: 0,
      totalCompleteExpensesValue: 0,
      totalTxnsCount: 0,
      totalAmountValue: 0,
    },
  },
]);

export const cardDetailsRes: PlatformCorporateCardDetail[] = deepFreeze([
  {
    card: visaRTFCard,
    stats: {
      totalDraftTxns: 960,
      totalDraftValue: 565633,
      totalCompleteTxns: 0,
      totalCompleteExpensesValue: 0,
      totalTxnsCount: 960,
      totalAmountValue: 565633,
    },
  },
  {
    card: mastercardRTFCard,
    stats: {
      totalDraftTxns: 6,
      totalDraftValue: 937.2,
      totalCompleteTxns: 0,
      totalCompleteExpensesValue: 0,
      totalTxnsCount: 6,
      totalAmountValue: 937.2,
    },
  },
  {
    card: statementUploadedCard,
    stats: {
      totalDraftTxns: 9,
      totalDraftValue: 2624.27,
      totalCompleteTxns: 0,
      totalCompleteExpensesValue: 0,
      totalTxnsCount: 9,
      totalAmountValue: 2624.27,
    },
  },
  virtualCardDetails[0],
  {
    card: visaRTFCard,
    stats: {
      totalDraftTxns: 960,
      totalDraftValue: 565633,
      totalCompleteTxns: 2,
      totalCompleteExpensesValue: 100,
      totalTxnsCount: 960,
      totalAmountValue: 565633,
    },
  },
]);

export const statementUploadedCardDetail: PlatformCorporateCardDetail[] = deepFreeze([
  {
    card: statementUploadedCard,
    stats: {
      totalDraftTxns: 6,
      totalDraftValue: 937.2,
      totalCompleteTxns: 6,
      totalCompleteExpensesValue: 937.2,
      totalTxnsCount: 12,
      totalAmountValue: 1874.4,
    },
  },
]);

export const virtualCardDetailsCombined: PlatformCorporateCardDetail[] = deepFreeze([
  {
    ...virtualCardDetails[0],
    virtualCardDetail: virtualCardCombinedResponse.vc1234,
  },
]);
