export interface CardTransactionStat {
  bank_name: string;
  card_number: string;
  corporate_card_id: string;
  count: number;
  state: 'DRAFT' | 'COMPLETE';
  total_amount: number;
}
