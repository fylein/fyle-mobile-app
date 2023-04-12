import { UnflattenedReport } from './report-unflattened.model';

export interface Option {
  label: string;
  value: UnflattenedReport;
  selected?: boolean;
}
