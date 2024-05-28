import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PlatformFileGenerateUrlsResponse } from 'src/app/core/models/platform/platform-file-generate-urls-response.model';
import { PlatformFilePostRequestPayload } from 'src/app/core/models/platform/platform-file-post-request-payload.model';
import { PlatformFile } from 'src/app/core/models/platform/platform-file.model';
import { SpenderPlatformV1ApiService } from '../../../spender-platform-v1-api.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';

@Injectable({
  providedIn: 'root',
})
export class SpenderFileService {
  constructor(private spenderPlatformV1ApiService: SpenderPlatformV1ApiService) {}

  createFile(data: PlatformFilePostRequestPayload): Observable<PlatformFile> {
    const payload = { data };
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<PlatformFile>>('/files', payload)
      .pipe(map((response) => response.data));
  }

  createFilesBulk(data: PlatformFilePostRequestPayload[]): Observable<PlatformFile[]> {
    const payload = { data };
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<PlatformFile[]>>('/files/bulk', payload)
      .pipe(map((response) => response.data));
  }

  generateUrls(id: string): Observable<PlatformFileGenerateUrlsResponse> {
    const payload = {
      data: { id },
    };
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<PlatformFileGenerateUrlsResponse>>('/files/generate_urls', payload)
      .pipe(map((response) => response.data));
  }

  generateUrlsBulk(fileIds: string[]): Observable<PlatformFileGenerateUrlsResponse[]> {
    const payload = {
      data: fileIds.map((id) => ({ id })),
    };
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<PlatformFileGenerateUrlsResponse[]>>('/files/generate_urls/bulk', payload)
      .pipe(map((response) => response.data));
  }

  downloadFile(id: string): Observable<{}> {
    return this.spenderPlatformV1ApiService.get('/files/download?id=' + id);
  }
}
