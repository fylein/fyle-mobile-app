import { ExportPayload } from '../models/platform/export-payload.model';
import deepFreeze from 'deep-freeze-strict';

export const exportPayload: ExportPayload = deepFreeze({
  query_params: 'id=in.[rpShFuVCUIXk]',
  notify_emails: ['aastha.b@fyle.in'],
  config: {
    type: 'pdf',
    include_receipts: true,
  },
});
