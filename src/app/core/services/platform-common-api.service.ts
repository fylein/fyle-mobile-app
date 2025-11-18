import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PlatformCommonApiService {
  private httpClient = inject(HttpClient);

  ROOT_ENDPOINT: string;

  constructor() {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
  }

  setRoot(rootUrl: string): void {
    this.ROOT_ENDPOINT = rootUrl;
  }

  get<T>(url: string, config = {}): Observable<T> {
    return this.httpClient.get<T>(this.ROOT_ENDPOINT + '/platform/v1/common' + url, config);
  }

  post<T>(url: string, config = {}): Observable<T> {
    return this.httpClient.post<T>(this.ROOT_ENDPOINT + '/platform/v1/common' + url, config);
  }
}
