import deepFreeze from 'deep-freeze-strict';
import { PlatformFileGenerateUrlsResponse } from '../models/platform/platform-file-generate-urls-response.model';

export const urlsBulkData: PlatformFileGenerateUrlsResponse[] = deepFreeze([
  {
    content_type: 'application/pdf',
    download_url: 'https://exampledownloadurl.com',
    id: 'fij7umnwoZUU',
    name: 'invoice.pdf',
    upload_url: 'https://exampleuploadurl.com',
  },
]);
