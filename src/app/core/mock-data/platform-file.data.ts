import deepFreeze from 'deep-freeze-strict';
import { PlatformFileGenerateUrlsResponse } from '../models/platform/platform-file-generate-urls-response.model';

export const urlsBulkData: PlatformFileGenerateUrlsResponse[] = deepFreeze([
  {
    content_type: 'application/pdf',
    download_url:
      'https://fyle-storage-mumbai-3.s3.amazonaws.com/2022-07-14/orrjqbDbeP9p/receipts/fij7umnwoZUU.invoice.pdf?response-content-type=application%2Fpdf&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA54Z3LIXTSLRVGBHQ%2F20240506%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20240506T183424Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=72c2ff6c2e034132e162e7239096147ad67e6bc399cfe2acf1e9e11bda094ffb',
    id: 'fij7umnwoZUU',
    name: 'invoice.pdf',
    upload_url:
      'https://fyle-storage-mumbai-3.s3.amazonaws.com/2022-07-14/orrjqbDbeP9p/receipts/fij7umnwoZUU.invoice.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA54Z3LIXTSLRVGBHQ%2F20240506%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20240506T183424Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=content-type%3Bhost&X-Amz-Signature=7df08a71cf96296d09804f6e4fb9d1e9d8c517e1bd9a39d1f2080febae1e8105',
  },
]);
