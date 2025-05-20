import { Image } from 'src/app/core/models/image-type.model';

export interface ReceiptPreviewData {
  base64ImagesWithSource: Image[];
  continueCaptureReceipt?: boolean;
}
