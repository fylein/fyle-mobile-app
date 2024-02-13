import { PlatformReport } from './platform/platform-report.model';

export interface Option {
  label: string;
  value: PlatformReport;
  selected?: boolean;
}
