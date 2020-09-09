import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RouterApiService {

  private ROUTER_API_ENDPOINT: string;

  constructor(
    private httpClient: HttpClient
  ) {
    this.ROUTER_API_ENDPOINT = environment.ROUTER_API_ENDPOINT;
  }

  post(url: string, data: any) {
    return this.httpClient.post<any>(this.ROUTER_API_ENDPOINT + '/routerapi' + url, data);
  }
}
