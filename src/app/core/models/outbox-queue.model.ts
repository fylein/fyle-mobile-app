import { Transaction } from './v1/transaction.model';

export interface OutboxQueue {
  transaction: Partial<Transaction>;
  dataUrls: {
    url: string;
    type: string;
    receiptCoordinates?: string;
    callBackUrl?: string;
  }[];
  comments?: string[];
  reportId?: string;
  applyMagic?: boolean;
  fileUploadCompleted?: boolean;
}
