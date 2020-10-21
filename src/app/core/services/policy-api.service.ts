import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PolicyApiService {
  ROOT_ENDPOINT: string;

  constructor(
    private httpClient: HttpClient
  ) {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
   }

  get(url, config) {
    // console.log('policy get ' + this.ROOT_ENDPOINT + '/policy/expenses' + url);
    return this.httpClient.get<any>(this.ROOT_ENDPOINT + '/policy/expenses' + url, config);
  }

  post(url, data, config) {
    console.log('post ' + this.ROOT_ENDPOINT + '/policy/expenses'  + url);
    // return this.httpClient.post(this.ROOT_ENDPOINT + '/policy/expenses' + url, data, config).then(function (resp) {
    //   console.log('returning ' + JSON.stringify(resp.data));
    //   return resp.data;
    // });
  }
}
