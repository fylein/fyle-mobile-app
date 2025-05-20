import { CardNetworkType } from '../enums/card-network-type';

export interface CardEnrollmentErrorsProperties {
  'Card Network': CardNetworkType;
  Source: string;
  'Error Message': string;
}
