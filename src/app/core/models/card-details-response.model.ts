export interface CardDetailsResponse {
  full_card_number: string;
  cvv: string;
  expiry_date: Date;
}

export interface CardDetailsAmountResponse {
  current_amount: number;
}
