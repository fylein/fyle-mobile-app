import deepFreeze from 'deep-freeze-strict';
import { PlatformFileGenerateUrlsResponse } from '../models/platform/platform-file-generate-urls-response.model';
import { PlatformFile } from '../models/platform/platform-file.model';
import { PlatformFilePostRequestPayload } from '../models/platform/platform-file-post-request-payload.model';

export const urlsBulkData: PlatformFileGenerateUrlsResponse[] = deepFreeze([
  {
    content_type: 'application/pdf',
    download_url: 'https://exampledownloadurl.com',
    id: 'fij7umnwoZUU',
    name: 'invoice.pdf',
    upload_url: 'https://exampleuploadurl.com',
  },
]);

export const platformFileData: PlatformFile = deepFreeze({
  id: 'fij7umnwoZUU',
  org_id: 'org123',
  user_id: 'user123',
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
  name: 'invoice.pdf',
  type: 'pdf',
  content_type: 'application/pdf',
  download_url: 'https://exampledownloadurl.com',
  upload_url: 'https://exampleuploadurl.com',
});

export const platformFileBulkData: PlatformFile[] = deepFreeze([
  platformFileData,
  {
    ...platformFileData,
    id: 'fij7umnwoZUU2',
    name: 'receipt.pdf',
  },
]);

export const platformFilePostRequestPayload: PlatformFilePostRequestPayload = deepFreeze({
  name: 'invoice.pdf',
  type: 'pdf',
  user_id: 'user123',
  org_id: 'org123',
});

export const platformFilePostRequestBulkPayload: PlatformFilePostRequestPayload[] = deepFreeze([
  platformFilePostRequestPayload,
  {
    name: 'receipt.pdf',
    type: 'pdf',
    user_id: 'user123',
    org_id: 'org123',
  },
]);
