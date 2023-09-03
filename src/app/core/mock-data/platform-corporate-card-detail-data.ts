import { PlatformCorporateCardDetail } from '../models/platform-corporate-card-detail.model';
import { mastercardRTFCard, statementUploadedCard, visaRTFCard } from './platform-corporate-card.data';

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
];
