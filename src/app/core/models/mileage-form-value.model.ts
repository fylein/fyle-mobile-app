import { CustomInput } from './custom-input.model';
import { ExtendedAccount } from './extended-account.model';
import { Location } from './location.model';
import { PlatformMileageRates } from './platform/platform-mileage-rates.model';
import { UnflattenedReport } from './report-unflattened.model';
import { TxnCustomProperties } from './txn-custom-properties.model';
import { CostCenter } from './v1/cost-center.model';
import { OrgCategory } from './v1/org-category.model';
import { ExtendedProject } from './v2/extended-project.model';

export interface MileageFormValue {
  route: {
    roundTrip: boolean;
    mileageLocations?: Location[];
    distance?: number;
  };
  category: OrgCategory;
  sub_category: OrgCategory;
  report: UnflattenedReport;
  paymentMode: ExtendedAccount;
  custom_inputs: CustomInput[];
  mileage_rate_name: PlatformMileageRates;
  vehicle_type: string;
  dateOfSpend: Date;
  project: ExtendedProject;
  costCenter: CostCenter;
  billable: boolean;
  purpose: string;
  project_dependent_fields: TxnCustomProperties[];
  cost_center_dependent_fields: TxnCustomProperties[];
  commuteDeduction: string;
}
