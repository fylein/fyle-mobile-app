import { CardDetailsResponse } from './card-details-response.model';

export interface CardDetailsWithAmountResponse extends CardDetailsResponse {
  current_amount: number;
}
