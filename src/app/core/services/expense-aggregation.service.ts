import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ExpenseAggregationService {
  ROOT_ENDPOINT: string;

  constructor(private httpClient: HttpClient) {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
  }

  setRoot(rootUrl: string) {
    this.ROOT_ENDPOINT = rootUrl;
  }

  post(url: string, data = {}) {
    return this.httpClient.post<any>(this.ROOT_ENDPOINT + '/expense_aggregation' + url, data);
  }

  delete(url: string, data = {}) {
    return this.httpClient.delete<any>(this.ROOT_ENDPOINT + '/expense_aggregation' + url, data);
  }

  get(url: string, config: { params?: any } = {}) {
    return this.httpClient.get<any>(this.ROOT_ENDPOINT + '/expense_aggregation' + url, config);
  }
}
