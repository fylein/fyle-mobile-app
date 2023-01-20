import { CardAggregateStat } from './card-aggregate-stat.model';

export interface CCCDetails {
  cardDetails: CardAggregateStat[];
  totalAmount: number;
  totalTxns: number;
}
