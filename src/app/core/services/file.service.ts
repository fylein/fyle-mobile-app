import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { File } from '../models/file.model';
import { ApiService } from './api.service';
import { FileObject } from '../models/file_obj.model';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(
    private apiService: ApiService
  ) { }

  downloadUrl(fileId: string): Observable<string> {
    return this.apiService.post('/files/' + fileId + '/download_url').pipe(
      map(res => res.url)
    );
  }

  base64Download(fileId) {
    return this.apiService.get('/files/' + fileId + '/download_b64');
  }

  findByAdvanceRequestId(advanceRequestId: string): Observable<File[]> {
    return from(this.apiService.get('/files', {
      params: {
        advance_request_id: advanceRequestId,
        skip_html: 'true'
      }
    })).pipe(
      map((files) => {
        files.map(file => {
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

    if (extension && (['png', 'jpg', 'jpeg', 'gif'].indexOf(extension) > -1)) {
      fileType = 'image';
    } else if (extension && (['pdf'].indexOf(extension) > -1)) {
      fileType = 'pdf';
    }
    // Todo PDF check
    file.file_type = fileType;
    return file;
  }

  post(fileObj) {
    return this.apiService.post('/files', fileObj);
  }

  uploadUrl(fileId) {
    return this.apiService.post('/files/' + fileId + '/upload_url').pipe(
      map(data => data.url)
    );
  }

  uploadComplete(fileId) {
    return this.apiService.post('/files/' + fileId + '/upload_completed');
  }

  base64Upload(name, content, transactionId?, advanceRequestId?, invoiceId?, password?) {
    return this.apiService.post('/files/upload_b64',
      {
        name,
        content,
        transaction_id: transactionId,
        advance_request_id: advanceRequestId,
        invoice_id: invoiceId,
        password
      }
    );
  }

  findByTransactionId(txnId: string): Observable<FileObject[]> {
    return this.apiService.get('/files', {
      params: {
        transaction_id: txnId,
        skip_html: 'true'
      }
    });
  }

  readFile(file) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.readAsDataURL(file);
    });
  }

  delete(fileId: string) {
    return this.apiService.delete('/files/' + fileId);
  };
}
