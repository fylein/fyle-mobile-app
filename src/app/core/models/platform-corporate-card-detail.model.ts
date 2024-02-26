import { CardDetailsCombinedResponse } from './card-details-combined-response.model';
import { PlatformCorporateCard } from './platform/platform-corporate-card.model';

export interface PlatformCorporateCardDetail {
  card: PlatformCorporateCard;
  stats: {
    totalTxnsCount: number;
    totalAmountValue: number;
    totalCompleteTxns: number;
    totalCompleteExpensesValue: number;
    totalDraftTxns: number;
    totalDraftValue: number;
  };
  virtualCardDetail?: CardDetailsCombinedResponse;
}
