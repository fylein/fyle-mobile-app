export interface CardDetailsResponse {
  full_card_number: string;
  cvv: string;
  expiry_date: Date;
}
export interface CardDetailsResponseWithNickName {
  full_card_number: string;
  cvv: string;
  expiry_date: Date;
  nick_name?: string;
  current_amount?: number;
}
export interface CardDetailsAmountResponse {
  current_amount: number;
}
