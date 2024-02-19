import { TxnCustomProperties } from '../../txn-custom-properties.model';

export interface Splits {
  claim_amount: number;
  spent_at: Date;
  category_id?: number;
  project_id?: number;
  cost_center_id?: number;
  foreign_amount?: number;
  foriegn_currency?: string;
  purpose?: string;
  custom_fields?: TxnCustomProperties[];
}
