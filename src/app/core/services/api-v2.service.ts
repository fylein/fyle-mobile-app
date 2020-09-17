import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiV2Service {

  constructor(
    private httpClient: HttpClient
  ) { }

  get(url, config = {}) {
    return this.httpClient.get<any>(environment.ROOT_URL + '/v2' + url, config);
  }
}
