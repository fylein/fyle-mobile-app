import { PlatformCorporateCard } from './platform/platform-corporate-card.model';

export interface PlatformCorporateCardDetails {
  card: PlatformCorporateCard;
  stats: {
    totalTxnsCount: number;
    totalAmountValue: number;
    totalCompleteTxns: number;
    totalCompleteExpensesValue: number;
    totalDraftTxns: number;
    totalDraftValue: number;
  };
}
