import { CardStateData } from './card-state-data.model';

export interface CCCDetails {
  bank_name: string;
  card_number: string;
  corporate_card_id: string;
  DRAFT: CardStateData;
  COMPLETE: CardStateData;
}
