import { ExtendedReport } from './report.model';

export interface ApiV2Reports {
  count: number;
  data: ExtendedReport[];
  limit: number;
  offset: number;
  url: string;
}
