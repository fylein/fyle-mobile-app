import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PolicyApiService {
  ROOT_ENDPOINT: string;

  constructor(private httpClient: HttpClient) {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
  }

  setRoot(rootUrl: string) {
    this.ROOT_ENDPOINT = rootUrl;
  }

  get(url, config) {
    return this.httpClient.get(this.ROOT_ENDPOINT + '/policy/expenses' + url, config);
  }

  post(url, data) {
    return this.httpClient.post(this.ROOT_ENDPOINT + '/policy/expenses' + url, data);
  }
}
