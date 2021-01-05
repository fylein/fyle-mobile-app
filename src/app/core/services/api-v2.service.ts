import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiV2Service {

  ROOT_ENDPOINT: string;

  constructor(
    private httpClient: HttpClient
  ) {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
  }

  setRoot(rootUrl: string) {
    this.ROOT_ENDPOINT = rootUrl;
  }

  get(url: string, config = {}) {
    return this.httpClient.get<any>(this.ROOT_ENDPOINT + '/v2' + url, config);
  }
}
