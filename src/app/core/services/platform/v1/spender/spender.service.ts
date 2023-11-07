import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { DateService } from '../shared/date.service';

@Injectable({
  providedIn: 'root',
})
export class SpenderService {
  ROOT_ENDPOINT: string;

  constructor(private httpClient: HttpClient, private dateService: DateService) {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
  }

  setRoot(rootUrl: string): void {
    this.ROOT_ENDPOINT = rootUrl;
  }

  get<T>(url: string, config = {}): Observable<T> {
    return this.httpClient
      .get<T>(this.ROOT_ENDPOINT + '/platform/v1/spender' + url, config)
      .pipe(map((response) => this.dateService.fixDates(response)));
  }

  post<T>(url: string, config = {}): Observable<T> {
    return this.httpClient
      .post<T>(this.ROOT_ENDPOINT + '/platform/v1/spender' + url, config)
      .pipe(map((response) => this.dateService.fixDates(response)));
  }
}
