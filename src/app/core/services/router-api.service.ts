import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RouterApiService {

  constructor(
    private httpClient: HttpClient
  ) { }

  post(url: string, data: any) {
    return this.httpClient.post<any>(environment.ROUTER_API_ENDPOINT + '/routerapi' + url, data);
  }
}
