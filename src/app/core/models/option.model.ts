import { PlatformReport } from './platform/v1/platform-report.model';

export interface Option {
  label: string;
  value: PlatformReport;
  selected?: boolean;
}
