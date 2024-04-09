import { OutboxQueue } from '../models/outbox-queue.model';
import { expectedUnflattendedTxnData3 } from './unflattened-txn.data';

export const outboxQueueData1: OutboxQueue[] = [
  {
    transaction: expectedUnflattendedTxnData3.tx,
    dataUrls: [
      {
        url: 'https://www.fylhq.com',
        type: 'image/jpeg',
        receiptCoordinates: '0,0,0,0',
        callBackUrl: 'https://www.fylehq.com',
      },
    ],
    comments: ['test'],
    reportId: 'test',
    applyMagic: true,
    fileUploadCompleted: true,
  },
];
