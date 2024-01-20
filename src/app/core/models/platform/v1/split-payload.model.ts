import { Destination } from '../../destination.model';
import { TxnCustomProperties } from '../../txn-custom-properties.model';
import { Splits } from './splits.model';

export interface SplitPayload {
  id: string;
  claim_amount: number;
  spent_at: Date;
  category_id: number;
  report_id?: string;
  project_id?: number;
  cost_center_id?: number;
  purpose?: string;
  foreign_amount?: number;
  custom_fields: TxnCustomProperties[];
  travel_classes?: string[];
  is_billable?: boolean;
  merchant?: string;
  started_at?: Date;
  ended_at?: Date;
  foreign_currency?: string;
  file_ids: string[];
  is_reimbursable: boolean;
  locations?: string[] | Destination[] | { display: string }[];
  source: string;
  source_account_id?: string;
  tax_amount?: number;
  tax_group_id?: number;
  splits: Splits[];
}
