import { PerDiemReports } from '../models/per-diem-reports.model';
import { expectedAddedApproverERpts } from './report-unflattened.data';

export const perDiemReportsData1: PerDiemReports[] = [
  {
    label: 'eggwhite',
    value: expectedAddedApproverERpts[0],
  },
  {
    label: '#2:  Dec 2020',
    value: expectedAddedApproverERpts[1],
  },
];
