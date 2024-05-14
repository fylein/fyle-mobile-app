import deepFreeze from 'deep-freeze-strict';
import { PlatformFileGenerateUrlsResponse } from '../models/platform/platform-file-generate-urls-response.model';

export const generateUrlsBulkData1: PlatformFileGenerateUrlsResponse[] = deepFreeze([
  {
    name: 'invoice.pdf',
    id: '1',
    content_type: 'application/pdf',
    download_url: 'https://sampledownloadurl.com',
    upload_url: 'https://sampleuploadurl.com',
  },
]);
