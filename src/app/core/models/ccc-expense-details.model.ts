import { CardAggregateStats } from './card-aggregate-stats.model';

export interface CCCDetails {
  cardDetails: CardAggregateStats[];
  totalAmount: number;
  totalTxns: number;
}
