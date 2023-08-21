import { CustomInput } from './custom-input.model';
import { ExtendedAccount } from './extended-account.model';
import { UnflattenedReport } from './report-unflattened.model';
import { TxnCustomProperties } from './txn-custom-properties.model';
import { CostCenter } from './v1/cost-center.model';
import { OrgCategory } from './v1/org-category.model';
import { PerDiemRates } from './v1/per-diem-rates.model';
import { ExtendedProject } from './v2/extended-project.model';

export interface PerDiemFormValue {
  currencyObj: {
    currency: string;
    amount: number;
    orig_currency: string;
    orig_amount: number;
  };
  paymentMode: ExtendedAccount;
  project: ExtendedProject;
  sub_category: OrgCategory;
  purpose: string;
  num_days: number;
  report: UnflattenedReport;
  from_dt: Date;
  to_dt: Date;
  custom_inputs: CustomInput[];
  duplicate_detection_reason: string;
  billable: boolean;
  costCenter: CostCenter;
  project_dependent_fields: TxnCustomProperties[];
  cost_center_dependent_fields: TxnCustomProperties[];
  per_diem_rate: PerDiemRates;
}
