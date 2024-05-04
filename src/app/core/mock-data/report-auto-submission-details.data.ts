import deepFreeze from 'deep-freeze-strict';

import { ReportAutoSubmissionDetails } from '../models/report-auto-submission-details.model';

export const apiReportAutoSubmissionDetails: ReportAutoSubmissionDetails = deepFreeze({
  data: {
    next_at: new Date('2023-02-01T00:00:00.000000'),
  },
});
