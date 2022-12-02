import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { File } from '../models/file.model';
import { ApiService } from './api.service';
import { FileObject } from '../models/file_obj.model';
import { ReceiptInfo } from '../models/receipt-info.model';
import heic2any from 'heic2any';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(private apiService: ApiService) {}

  downloadUrl(fileId: string): Observable<string> {
    return this.apiService.post('/files/' + fileId + '/download_url').pipe(map((res) => res.url));
  }

  downloadThumbnailUrl(fileId: string): Observable<any[]> {
    return this.apiService.post('/files/download_urls', [
      {
        id: fileId,
        purpose: 'THUMBNAILx200x200',
      },
    ]);
  }

  getFilesWithThumbnail(txnId: string): Observable<any[]> {
    return this.apiService.get('/files', {
      params: {
        transaction_id: txnId,
        skip_html: 'true',
        purpose: 'THUMBNAILx200x200',
      },
    });
  }

  base64Download(fileId) {
    return this.apiService.get('/files/' + fileId + '/download_b64');
  }

  findByAdvanceRequestId(advanceRequestId: string): Observable<File[]> {
    return from(
      this.apiService.get('/files', {
        params: {
          advance_request_id: advanceRequestId,
          skip_html: 'true',
        },
      })
    ).pipe(
      map((files) => {
        files.map((file) => {
          this.fixDates(file);
          this.setFileType(file);
        });
        return files as File[];
      })
    );
  }

  fixDates(data: File) {
    data.created_at = new Date(data.created_at);
    return data;
  }

  getFileExtension(fileName) {
    let res = null;

    if (fileName) {
      fileName = fileName.toLowerCase();
      const index = fileName.lastIndexOf('.');

      if (index > -1) {
        res = fileName.substring(index + 1, fileName.length);
      }
    }
    return res;
  }

  setFileType(file: File) {
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

  post(fileObj) {
    return this.apiService.post('/files', fileObj);
  }

  uploadUrl(fileId) {
    return this.apiService.post('/files/' + fileId + '/upload_url').pipe(map((data) => data.url));
  }

  uploadComplete(fileId) {
    return this.apiService.post('/files/' + fileId + '/upload_completed');
  }

  // TODO: High impact. To be separately fixed
  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  base64Upload(name, content, transactionId?, invoiceId?, password?) {
    return this.apiService.post('/files/upload_b64', {
      name,
      content,
      transaction_id: transactionId,
      invoice_id: invoiceId,
      password,
    });
  }

  findByTransactionId(txnId: string): Observable<FileObject[]> {
    return this.apiService.get('/files', {
      params: {
        transaction_id: txnId,
        skip_html: 'true',
      },
    });
  }

  getBlobFromDataUrl(dataURI: string): Blob {
    // convert base64/URLEncoded data component to raw binary data held in a string
    const byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    const uintArray = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([uintArray], { type: mimeString });
  }

  getDataUrlFromBlob(blob: Blob): Promise<string | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result);
    });
  }

  readFile(file: Blob): Promise<string | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = async () => {
        if (file.type === 'image/heic') {
          const result = await heic2any({
            blob: this.getBlobFromDataUrl(fileReader.result as string),
            toType: 'image/jpeg',
            quality: 50,
          });
          const dataUrl = await this.getDataUrlFromBlob(result as Blob);
          return resolve(dataUrl);
        }
        return resolve(fileReader.result);
      };
      fileReader.readAsDataURL(file);
      fileReader.onerror = (error) => console.log(error);
    });
  }

  delete(fileId: string) {
    return this.apiService.delete('/files/' + fileId);
  }

  getAttachmentType(type: string) {
    let attachmentType = 'image';
    if (type === 'application/pdf' || type === 'pdf') {
      attachmentType = 'pdf';
    }
    return attachmentType;
  }

  getReceiptDetails(url: string) {
    const ext = this.getReceiptExtension(url);
    let type = '';

    if (ext && ['pdf'].indexOf(ext) > -1) {
      type = 'pdf';
    } else if (ext && ['png', 'jpg', 'jpeg', 'gif'].indexOf(ext) > -1) {
      type = 'image';
    }

    return type;
  }

  getReceiptExtension(url: string) {
    let receiptExtension = null;
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

  getImageTypeFromDataUrl(dataUrl: string) {
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
