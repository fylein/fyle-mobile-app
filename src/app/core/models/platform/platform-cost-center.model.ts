import { PlatformCostCenterData } from '../../models/platform/platform-cost-center-data.model';

export interface PlatformCostCenter {
  count: number;
  offset: number;
  data: PlatformCostCenterData[];
}
