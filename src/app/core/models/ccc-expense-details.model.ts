import { CardAggregateStats } from './card-aggregate-stat.model';

export interface CCCDetails {
  cardDetails: CardAggregateStats[];
  totalAmount: number;
  totalTxns: number;
}
