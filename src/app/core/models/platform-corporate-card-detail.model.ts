import { CardDetailsCombinedResponse } from './card-details-combined-response.model';
import { PlatformCorporateCard } from './platform/platform-corporate-card.model';

export interface PlatformCorporateCardDetail {
  card: PlatformCorporateCard;
  stats: {
    totalTxnsCount: number;
    totalCompleteTxns: number;
    totalCompleteExpensesAmount: number;
    totalDraftTxns: number;
    totalDraftAmount: number;
  };
  virtualCardDetail?: CardDetailsCombinedResponse;
}
