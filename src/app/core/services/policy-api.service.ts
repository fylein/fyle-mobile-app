import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PolicyApiService {

  constructor(
    private httpClient: HttpClient
  ) { }

  get(url, config) {
    return this.httpClient.get(environment.ROOT_URL + '/policy/expenses' + url, config).pipe(
      map((resp: any) => {
        return resp.data;
      })
    );
  }

  post(url, data) {
    return this.httpClient.post(environment.ROOT_URL + '/policy/expenses' + url, data).pipe(
      tap(console.log),
      map((resp: any) => {
        console.log()
        return resp.data;
      })
    );
  }
}
