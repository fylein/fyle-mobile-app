import { CardNetworkType } from '../enums/card-network-type';

export interface CardEnrolledProperties {
  Source: string;
  'Card Network': CardNetworkType;
  'Card ID': string;
}
