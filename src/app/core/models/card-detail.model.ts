import { PlatformCorporateCard } from './platform/platform-corporate-card.model';

export interface CardDetail {
  cardName: string;
  cardNumber: string;
  totalTxnsCount: number;
  totalAmountValue: number;
  totalCompleteTxns: number;
  totalCompleteExpensesValue: number;
  totalDraftTxns: number;
  totalDraftValue: number;
}

export interface NewCardDetail {
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
