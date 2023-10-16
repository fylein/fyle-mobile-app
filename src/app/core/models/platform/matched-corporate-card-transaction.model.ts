export interface MatchedCorporateCardTransaction {
  id: string;
  corporate_card_id: string;
  corporate_card_number: string;
  masked_corporate_card_number: string;
  bank_name: string;
  cardholder_name: string;
  amount: number;
  currency: string;
  spent_at: string;
  posted_at: string;
  description: string;
  foreign_currency: string;
  foreign_amount: number;
  merchant: string;
  category: string;
  matched_by: string;
}
