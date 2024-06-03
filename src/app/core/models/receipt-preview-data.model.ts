export interface ReceiptPreviewData {
  base64ImagesWithSource: Partial<{
    source: string;
    base64Image: string;
  }>[];
  continueCaptureReceipt?: boolean;
}
