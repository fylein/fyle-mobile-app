import { PlatformTaxGroupData } from '../../models/platform/platform-tax-group-data.model';

export interface PlatformTaxGroup {
  count: number;
  offset: number;
  data: PlatformTaxGroupData[];
}
