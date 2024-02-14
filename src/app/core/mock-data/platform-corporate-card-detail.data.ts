import { PlatformCorporateCardDetail } from '../models/platform-corporate-card-detail.model';
import { mastercardRTFCard, statementUploadedCard, virtualCard, visaRTFCard } from './platform-corporate-card.data';
import { virtualCardCombinedResponse } from './virtual-card-combined-response.data';

export const virtualCardDetails: PlatformCorporateCardDetail[] = [
  {
    card: virtualCard,
    stats: {
      totalDraftTxns: 6,
      totalDraftValue: 937.2,
      totalCompleteTxns: 6,
      totalCompleteExpensesValue: 937.2,
      totalTxnsCount: 12,
      totalAmountValue: 1874.4,
    },
  },
];

export const cardDetailsRes: PlatformCorporateCardDetail[] = [
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
];

export const statementUploadedCardDetail: PlatformCorporateCardDetail[] = [
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
];

export const virtualCardDetailsCombined: PlatformCorporateCardDetail[] = [
  {
    ...virtualCardDetails[0],
    virtualCardDetail: virtualCardCombinedResponse['vc1234'],
  },
];
