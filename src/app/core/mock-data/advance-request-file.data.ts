import deepFreeze from 'deep-freeze-strict';

import { AdvanceRequestFile } from '../models/advance-request-file.model';
import { advanceRequestPlatform } from './platform/v1/advance-request-platform.data';

export const advRequestFile: AdvanceRequestFile = deepFreeze({
  files: [
    {
      id: 'fi1w2IE6JeqS',
      org_user_id: 'ouX8dwsbLCLv',
      created_at: new Date('2023-02-23T13:59:29.526Z'),
      name: '000.jpeg',
      s3url: '2023-02-23/orNVthTo2Zyo/receipts/fi1w2IE6JeqS.000.jpeg',
      transaction_id: null,
      invoice_id: null,
      advance_request_id: 'areqMP09oaYXBf',
      purpose: 'ORIGINAL',
      password: null,
      receipt_coordinates: null,
      email_meta_data: null,
      fyle_sub_url: '/api/files/fi1w2IE6JeqS/download',
    },
  ],
  advanceReq: advanceRequestPlatform.data[0],
});

export const advRequestFile2: AdvanceRequestFile = deepFreeze({
  files: [
    {
      id: 'fiK7c69UDJNb',
      org_user_id: 'ouX8dwsbLCLv',
      created_at: new Date('2023-02-24T12:03:57.680Z'),
      name: '000.jpeg',
      s3url: '2023-02-24/orNVthTo2Zyo/receipts/fiK7c69UDJNb.000.jpeg',
      transaction_id: null,
      invoice_id: null,
      advance_request_id: 'areq99bN9mZgu1',
      purpose: 'ORIGINAL',
      password: null,
      receipt_coordinates: null,
      email_meta_data: null,
      fyle_sub_url: '/api/files/fiK7c69UDJNb/download',
    },
  ],
  advanceReq: advanceRequestPlatform.data[0],
});
