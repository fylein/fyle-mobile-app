import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdvanceRequestPolicyService {

  constructor(
    private httpClient: HttpClient
  ) { }

  servicePost(url, data, config) {
    if (url.indexOf('remotecopy') === -1 && url.indexOf('upload_html') === -1) {
      console.log('post ' + url + ' with data ' + JSON.stringify(data));
    }
    return this.httpClient.post(environment.ROOT_URL + '/policy/advance_requests' + url, data);
  }


}
