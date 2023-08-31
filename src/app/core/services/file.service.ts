import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { File } from '../models/file.model';
import { ApiService } from './api.service';
import { FileObject } from '../models/file-obj.model';
import { ReceiptInfo } from '../models/receipt-info.model';
import heic2any from 'heic2any';
import { DateService } from './date.service';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(
    private apiService: ApiService,
    private dateService: DateService,
  ) {}

  downloadUrl(fileId: string): Observable<string> {
    return this.apiService.post<File>('/files/' + fileId + '/download_url').pipe(map((res) => res.url));
  }

  downloadThumbnailUrl(fileId: string): Observable<FileObject[]> {
    return this.apiService.post('/files/download_urls', [
      {
        id: fileId,
        purpose: 'THUMBNAILx200x200',
      },
    ]);
  }

  getFilesWithThumbnail(txnId: string): Observable<FileObject[]> {
    return this.apiService.get('/files', {
      params: {
        transaction_id: txnId,
        skip_html: 'true',
        purpose: 'THUMBNAILx200x200',
      },
    });
  }

  base64Download(fileId: string): Observable<{ content: string }> {
    return this.apiService.get('/files/' + fileId + '/download_b64');
  }

  findByAdvanceRequestId(advanceRequestId: string): Observable<FileObject[]> {
    return from(
      this.apiService.get<File[] | FileObject[]>('/files', {
        params: {
          advance_request_id: advanceRequestId,
          skip_html: 'true',
        },
      }),
    ).pipe(
      map((files) => {
        files.map((file) => {
          this.dateService.fixDates(file);
          this.setFileType(file as FileObject);
        });
        return files as unknown as FileObject[];
      }),
    );
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
    return this.apiService.post('/files', fileObj);
  }

  uploadUrl(fileId: string): Observable<string> {
    return this.apiService.post<File>('/files/' + fileId + '/upload_url').pipe(map((data) => data.url));
  }

  uploadComplete(fileId: string): Observable<File> {
    return this.apiService.post<File>('/files/' + fileId + '/upload_completed');
  }

  findByTransactionId(txnId: string): Observable<FileObject[]> {
    return this.apiService.get('/files', {
      params: {
        transaction_id: txnId,
        skip_html: 'true',
      },
    });
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
      const fileReader = new FileReader();
      fileReader.onload = async (): Promise<void> => {
        if (file.type === 'image/heic') {
          const result = await heic2any({
            blob: this.getBlobFromDataUrl(fileReader.result as string),
            toType: 'image/jpeg',
            quality: 50,
          });
          const dataUrl = await this.getDataUrlFromBlob(result as Blob);
          return resolve(dataUrl);
        }
        return resolve(fileReader.result.toString());
      };
      fileReader.readAsDataURL(file);
      fileReader.onerror = (error): void => reject(error);
    });
  }

  delete(fileId: string): Observable<unknown> {
    return this.apiService.delete('/files/' + fileId);
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

  getReceiptsDetails(file: FileObject): ReceiptInfo {
    const receiptExtn = this.getReceiptExtension(file.name);
    const receiptInfo = {
      type: 'unknown',
      thumbnail: 'img/fy-receipt.svg',
    };

    if (receiptExtn === 'pdf') {
      receiptInfo.type = 'pdf';
      receiptInfo.thumbnail = 'img/fy-pdf.svg';
    } else if (receiptExtn && ['png', 'jpg', 'jpeg', 'gif'].indexOf(receiptExtn) > -1) {
      receiptInfo.type = 'image';
      receiptInfo.thumbnail = file.url;
    }
    return receiptInfo;
  }
}
