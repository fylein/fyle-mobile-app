import { CustomInput } from './custom-input.model';
import { Location } from './location.model';
import { PlatformMileageRates } from './platform/platform-mileage-rates.model';
import { TxnCustomProperties } from './txn-custom-properties.model';
import { PlatformCostCenter } from './platform/platform-cost-center.model';
import { OrgCategory } from './v1/org-category.model';
import { ProjectV2 } from './v2/project-v2.model';
import { Report } from '../models/platform/v1/report.model';
import { AdvanceWallet } from '../models/platform/v1/advance-wallet.model';
import { PlatformAccount } from './platform-account.model';

export interface MileageFormValue {
  route: {
    roundTrip: boolean;
    mileageLocations?: Location[];
    distance?: number;
  };
  category: PlatformCategory;
  sub_category: PlatformCategory;
  report: Report;
  paymentMode: PlatformAccount | AdvanceWallet;
  custom_inputs: CustomInput[];
  mileage_rate_name: PlatformMileageRates;
  vehicle_type: string;
  dateOfSpend: Date;
  project: ProjectV2;
  costCenter: PlatformCostCenter;
  billable: boolean;
  purpose: string;
  project_dependent_fields: TxnCustomProperties[];
  cost_center_dependent_fields: TxnCustomProperties[];
  commuteDeduction: string;
}
