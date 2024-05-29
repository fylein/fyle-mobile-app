import deepFreeze from 'deep-freeze-strict';
import { ReceiptInfo } from '../models/receipt-info.model';

export const receiptInfoData1: ReceiptInfo = deepFreeze({
  id: '1',
  name: 'invoice.pdf',
  type: 'pdf',
  url: 'https://sampledownloadurl.com',
  thumbnail: 'img/fy-pdf.svg',
});

export const receiptInfoData2: ReceiptInfo[] = deepFreeze([
  {
    id: '1',
    name: 'invoice.pdf',
    type: 'pdf',
    url: 'https://sampledownloadurl.com',
    thumbnail: 'img/fy-pdf.svg',
  },
]);
