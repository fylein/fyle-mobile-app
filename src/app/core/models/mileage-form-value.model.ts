import { CustomInput } from './custom-input.model';
import { ExtendedAccount } from './extended-account.model';
import { Location } from './location.model';
import { PlatformMileageRates } from './platform/platform-mileage-rates.model';
import { TxnCustomProperties } from './txn-custom-properties.model';
import { CostCenter } from './v1/cost-center.model';
import { OrgCategory } from './v1/org-category.model';
import { ProjectV2 } from './v2/project-v2.model';
import { Report } from '../models/platform/v1/report.model';
import { AdvanceWallet } from '../models/platform/v1/advance-wallet.model';

export interface MileageFormValue {
  route: {
    roundTrip: boolean;
    mileageLocations?: Location[];
    distance?: number;
  };
  category: OrgCategory;
  sub_category: OrgCategory;
  report: Report;
  paymentMode: ExtendedAccount | AdvanceWallet;
  custom_inputs: CustomInput[];
  mileage_rate_name: PlatformMileageRates;
  vehicle_type: string;
  dateOfSpend: Date;
  project: ProjectV2;
  costCenter: CostCenter;
  billable: boolean;
  purpose: string;
  project_dependent_fields: TxnCustomProperties[];
  cost_center_dependent_fields: TxnCustomProperties[];
  commuteDeduction: string;
}
