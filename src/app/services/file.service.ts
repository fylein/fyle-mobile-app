import { Injectable } from '@angular/core';
import { ApiService } from '../core/services/api.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(
    private apiService: ApiService
  ) { }

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

  base64Upload(name, content, transaction_id, invoice_id, password) {
    return this.apiService.post('/files/upload_b64',
      {
        name,
        content,
        transaction_id,
        invoice_id,
        password
      }
    );
  }
}
