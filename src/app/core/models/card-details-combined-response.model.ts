export interface CardDetailsCombinedResponse {
  full_card_number: string;
  cvv: string;
  expiry_date: Date | string;
  nick_name?: string;
  current_amount?: number;
}
