import { Report } from './platform/v1/report.model';

export interface Option {
  label: string;
  value: Report;
  selected?: boolean;
}
