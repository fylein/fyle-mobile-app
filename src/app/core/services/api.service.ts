import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  ROOT_ENDPOINT: string;

  constructor(private httpClient: HttpClient) {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
  }

  setRoot(rootUrl: string) {
    this.ROOT_ENDPOINT = rootUrl;
  }

  post<T>(url: string, data = {}, config = {}) {
    return this.httpClient.post<T>(this.ROOT_ENDPOINT + '/api' + url, data, config);
  }

  delete<T>(url: string, data = {}) {
    return this.httpClient.delete<T>(this.ROOT_ENDPOINT + '/api' + url, data);
  }

  get<T>(url: string, config: { params?: any } = {}) {
    return this.httpClient.get<T>(this.ROOT_ENDPOINT + '/api' + url, config);
  }
}
