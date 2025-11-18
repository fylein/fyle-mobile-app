import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApproverPlatformApiService {
  private httpClient = inject(HttpClient);

  ROOT_ENDPOINT: string;

  constructor() {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
  }

  setRoot(rootUrl: string): void {
    this.ROOT_ENDPOINT = rootUrl;
  }

  get<T>(url: string, config = {}): Observable<T> {
    return this.httpClient.get<T>(this.ROOT_ENDPOINT + '/platform/v1/approver' + url, config);
  }

  post<T>(url: string, config = {}): Observable<T> {
    return this.httpClient.post<T>(this.ROOT_ENDPOINT + '/platform/v1/approver' + url, config);
  }
}
