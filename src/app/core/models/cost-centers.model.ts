import { PlatformCostCenter } from './platform/platform-cost-center.model';

export interface CostCenters {
  label: string;
  value: PlatformCostCenter;
  selected?: boolean;
}
