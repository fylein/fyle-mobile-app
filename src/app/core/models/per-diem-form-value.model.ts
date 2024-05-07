import { CustomInput } from './custom-input.model';
import { ExtendedAccount } from './extended-account.model';
import { Report } from './platform/v1/report.model';
import { TxnCustomProperties } from './txn-custom-properties.model';
import { CostCenter } from './v1/cost-center.model';
import { OrgCategory } from './v1/org-category.model';
import { PerDiemRates } from './v1/per-diem-rates.model';
import { ProjectV2 } from './v2/project-v2.model';

export interface PerDiemFormValue {
  currencyObj: {
    currency: string;
    amount: number;
    orig_currency: string;
    orig_amount: number;
  };
  paymentMode: ExtendedAccount;
  project: ProjectV2;
  sub_category: OrgCategory;
  purpose: string;
  num_days: number;
  report: Report;
  from_dt: string;
  to_dt: string;
  custom_inputs: CustomInput[];
  billable: boolean;
  costCenter: CostCenter;
  project_dependent_fields: TxnCustomProperties[];
  cost_center_dependent_fields: TxnCustomProperties[];
  per_diem_rate: PerDiemRates;
}
