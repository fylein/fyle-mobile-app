import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RouterApiService {
  private ROUTER_API_ENDPOINT: string;

  constructor(private httpClient: HttpClient) {
    this.ROUTER_API_ENDPOINT = environment.ROUTER_API_ENDPOINT;
  }

  post<T>(url: string, data = {}): Observable<T> {
    return this.httpClient.post<T>(this.ROUTER_API_ENDPOINT + '/routerapi' + url, data);
  }

  get<T>(url: string, config = {}): Observable<T> {
    return this.httpClient.get<T>(this.ROUTER_API_ENDPOINT + '/routerapi' + url, config);
  }
}
