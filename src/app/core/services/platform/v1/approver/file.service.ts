import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PlatformFileGenerateUrlsResponse } from 'src/app/core/models/platform/platform-file-generate-urls-response.model';
import { PlatformFilePostRequestPayload } from 'src/app/core/models/platform/platform-file-post-request-payload.model';
import { PlatformFile } from 'src/app/core/models/platform/platform-file.model';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { ApproverPlatformApiService } from '../../../approver-platform-api.service';

@Injectable({
  providedIn: 'root',
})
export class ApproverFileService {
  private approverPlatformApiService = inject(ApproverPlatformApiService);

  createFile(payload: PlatformFilePostRequestPayload): Observable<PlatformFile> {
    return this.approverPlatformApiService
      .post<PlatformApiResponse<PlatformFile>>('/files', payload)
      .pipe(map((response) => response.data));
  }

  createFilesBulk(payload: PlatformFilePostRequestPayload[]): Observable<PlatformFile[]> {
    const data = { data: payload };
    return this.approverPlatformApiService
      .post<PlatformApiResponse<PlatformFile[]>>('/files/bulk', data)
      .pipe(map((response) => response.data));
  }

  generateUrls(id: string): Observable<PlatformFileGenerateUrlsResponse> {
    const payload = {
      data: { id },
    };
    return this.approverPlatformApiService
      .post<PlatformApiResponse<PlatformFileGenerateUrlsResponse>>('/files/generate_urls', payload)
      .pipe(map((response) => response.data));
  }

  generateUrlsBulk(fileIds: string[]): Observable<PlatformFileGenerateUrlsResponse[]> {
    const payload = {
      data: fileIds.map((id) => ({ id })),
    };
    return this.approverPlatformApiService
      .post<PlatformApiResponse<PlatformFileGenerateUrlsResponse[]>>('/files/generate_urls/bulk', payload)
      .pipe(map((response) => response.data));
  }

  downloadFile(id: string): Observable<{}> {
    return this.approverPlatformApiService.get('/files/download?id=' + id);
  }

  deleteFilesBulk(fileIds: string[]): Observable<{}> {
    const data = fileIds.map((id) => ({ id }));
    const payload = { data };
    return this.approverPlatformApiService.post('/files/delete/bulk', payload);
  }

  attachToAdvance(advanceRequestId: string, fileIds: string[], userId: string): Observable<void> {
    const payload = {
      data: [
        {
          id: advanceRequestId,
          file_ids: fileIds,
          user_id: userId,
        },
      ],
    };

    return this.approverPlatformApiService.post<void>('/advance_requests/attach_files/bulk', payload);
  }
}
