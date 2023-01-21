import { ExtendedReport } from './report.model';

export interface ApiReports {
  count: number;
  data: ExtendedReport[];
  limit: number;
  offset: number;
  url: string;
}
