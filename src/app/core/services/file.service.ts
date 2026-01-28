import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap, map, from } from 'rxjs';
import { FileObject } from '../models/file-obj.model';
import { ReceiptInfo } from '../models/receipt-info.model';
import heic2any from 'heic2any';
import { SpenderFileService } from './platform/v1/spender/file.service';
import { SpenderService } from './platform/v1/spender/spender.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { ApproverService } from './platform/v1/approver/approver.service';
import { ApproverFileService } from './platform/v1/approver/file.service';
import { PlatformFileGenerateUrlsResponse } from '../models/platform/platform-file-generate-urls-response.model';
import { AdvanceRequestFiles } from '../models/platform/advance-request-files.model';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private spenderFileService = inject(SpenderFileService);

  private spenderService = inject(SpenderService);

  private approverFileService = inject(ApproverFileService);

  private approverService = inject(ApproverService);

  private findByAdvanceRequestIdWithService(
    advanceRequestId: string,
    service: SpenderService | ApproverService,
    fileService: SpenderFileService | ApproverFileService,
  ): Observable<FileObject[]> {
    return (service as SpenderService)
      .get<PlatformApiResponse<AdvanceRequestFiles[]>>('/advance_requests', {
        params: {
          id: `eq.${advanceRequestId}`,
        },
      })
      .pipe(
        switchMap((response: PlatformApiResponse<AdvanceRequestFiles[]>) => {
          const advanceRequest = response.data[0];
          if (!advanceRequest || !advanceRequest.file_ids || advanceRequest.file_ids.length === 0) {
            return of<FileObject[]>([]);
          }

          return fileService
            .generateUrlsBulk(advanceRequest.file_ids)
            .pipe(
              map((urlResponses: PlatformFileGenerateUrlsResponse[]) =>
                urlResponses.map((urlResponse) => this.createFileObjectFromUrlResponse(urlResponse)),
              ),
            );
        }),
      );
  }

  downloadUrl(fileId: string): Observable<string> {
    return this.spenderFileService
      .generateUrlsBulk([fileId])
      .pipe(map((response: PlatformFileGenerateUrlsResponse[]) => response[0].download_url));
  }

  downloadUrlForTeamAdvance(fileId: string): Observable<string> {
    return this.approverFileService
      .generateUrlsBulk([fileId])
      .pipe(map((response: PlatformFileGenerateUrlsResponse[]) => response[0].download_url));
  }

  base64Download(fileId: string): Observable<{ content: string }> {
    return this.downloadUrl(fileId).pipe(
      switchMap((downloadUrl) => {
        return from(fetch(downloadUrl).then((response) => response.blob()));
      }),
      switchMap((blob) => {
        return from(this.getDataUrlFromBlob(blob));
      }),
      map((dataUrl) => {
        // Extract base64 content from data URL (remove "data:image/jpeg;base64," prefix)
        const base64Content = dataUrl.split(',')[1];
        return { content: base64Content };
      }),
    );
  }

  findByAdvanceRequestId(advanceRequestId: string): Observable<FileObject[]> {
    return this.findByAdvanceRequestIdWithService(advanceRequestId, this.spenderService, this.spenderFileService);
  }

  findByAdvanceRequestIdForTeamAdvance(advanceRequestId: string): Observable<FileObject[]> {
    return this.findByAdvanceRequestIdWithService(advanceRequestId, this.approverService, this.approverFileService);
  }

  createFileObjectFromUrlResponse(urlResponse: PlatformFileGenerateUrlsResponse): FileObject {
    const fileObj: FileObject = {
      id: urlResponse.id,
      name: urlResponse.name,
      url: urlResponse.download_url,
      type: this.getAttachmentType(urlResponse.content_type),
      thumbnail: urlResponse.download_url,
      created_at: new Date(),
      org_user_id: '',
      s3url: '',
      purpose: '',
      password: '',
      email_meta_data: '',
      fyle_sub_url: '',
      file_download_url: urlResponse.download_url,
      file_type: this.getAttachmentType(urlResponse.content_type),
    };
    return fileObj;
  }

  getFileExtension(fileName: string): string {
    let res: string | null = null;

    if (fileName) {
      fileName = fileName.toLowerCase();
      const index = fileName.lastIndexOf('.');

      if (index > -1) {
        res = fileName.substring(index + 1, fileName.length);
      }
    }
    return res;
  }

  setFileType(file: FileObject): FileObject {
    let fileType = 'unknown';
    const extension = this.getFileExtension(file.name);

    if (extension && ['png', 'jpg', 'jpeg', 'gif'].indexOf(extension) > -1) {
      fileType = 'image';
    } else if (extension && ['pdf'].indexOf(extension) > -1) {
      fileType = 'pdf';
    }

    file.file_type = fileType;
    return file;
  }

  post(fileObj: File | Record<string, string> | FileObject): Observable<unknown> {
    return this.spenderService.post('/files', { data: fileObj });
  }

  uploadUrl(fileId: string): Observable<string> {
    return this.spenderFileService
      .generateUrlsBulk([fileId])
      .pipe(map((response: PlatformFileGenerateUrlsResponse[]) => response[0].upload_url));
  }

  uploadUrlForTeamAdvance(fileId: string): Observable<string> {
    return this.approverFileService
      .generateUrlsBulk([fileId])
      .pipe(map((response: PlatformFileGenerateUrlsResponse[]) => response[0].upload_url));
  }

  getBlobFromDataUrl(dataUrl: string): Blob {
    //Convert dataUrl to raw binary data held in a string
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0];

    //Write the bytes of the string to a typed array
    const uintArray = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([uintArray], { type: mimeType });
  }

  getDataUrlFromBlob(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = (): void => resolve(reader.result.toString());
      reader.onerror = (error): void => reject(error);
    });
  }

  readFile(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      if (file.type === 'image/heic') {
        heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 50,
        })
          .then((result: Blob) => {
            this.getDataUrlFromBlob(result).then((dataUrl) => {
              resolve(dataUrl);
            });
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        this.getDataUrlFromBlob(file).then(resolve).catch(reject);
      }
    });
  }

  delete(fileId: string): Observable<unknown> {
    return this.spenderService.post('/files/delete/bulk', { data: [{ id: fileId }] });
  }

  deleteForTeamAdvance(fileId: string): Observable<unknown> {
    return this.approverService.post('/files/delete/bulk', { data: [{ id: fileId }] });
  }

  getAttachmentType(type: string): string {
    let attachmentType = 'image';
    if (type === 'application/pdf' || type === 'pdf') {
      attachmentType = 'pdf';
    }
    return attachmentType;
  }

  getReceiptDetails(url: string): string {
    const ext = this.getReceiptExtension(url);
    let type = '';

    if (ext && ['pdf'].indexOf(ext) > -1) {
      type = 'pdf';
    } else if (ext && ['png', 'jpg', 'jpeg', 'gif'].indexOf(ext) > -1) {
      type = 'image';
    }

    return type;
  }

  getReceiptExtension(url: string): string {
    let receiptExtension: string | null = null;
    const name = url.split('?')[0];
    if (name) {
      const filename = name.toLowerCase();
      const index = filename.lastIndexOf('.');

      if (index > -1) {
        receiptExtension = filename.substring(index + 1, filename.length);
      }
    }

    return receiptExtension;
  }

  getImageTypeFromDataUrl(dataUrl: string): string {
    return dataUrl.split(';')[0].split(':')[1];
  }

  getReceiptsDetails(fileName: string, downloadUrl: string): ReceiptInfo {
    const receiptExtn = this.getReceiptExtension(fileName);
    const receiptInfo = {
      type: 'unknown',
      thumbnail: 'img/fy-receipt.svg',
    };

    if (receiptExtn === 'pdf') {
      receiptInfo.type = 'pdf';
      receiptInfo.thumbnail = 'img/fy-pdf.svg';
    } else if (receiptExtn && ['png', 'jpg', 'jpeg', 'gif'].indexOf(receiptExtn) > -1) {
      receiptInfo.type = 'image';
      receiptInfo.thumbnail = downloadUrl;
    }
    return receiptInfo;
  }
}
