import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { DateService } from '../shared/date.service';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApproverService {
  ROOT_ENDPOINT: string;

  constructor(private httpClient: HttpClient, private dateService: DateService) {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
  }

  setRoot(rootUrl: string): void {
    this.ROOT_ENDPOINT = rootUrl;
  }

  get<T>(url: string, config = {}): Observable<T> {
    return this.httpClient
      .get<T>(this.ROOT_ENDPOINT + '/platform/v1/approver' + url, config)
      .pipe(map((res) => this.dateService.fixDates(res)));
  }

  post<T>(url: string, config = {}): Observable<T> {
    return this.httpClient
      .post<T>(this.ROOT_ENDPOINT + '/platform/v1/approver' + url, config)
      .pipe(map((res) => this.dateService.fixDates(res)));
  }
}
