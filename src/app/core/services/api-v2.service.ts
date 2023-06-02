import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { TextSearchQueryParams } from '../models/text-search-params.model';
import { TextSearchQuery } from '../models/text-search-query.model';
import { ApiV2Response } from '../models/v2/api-v2-response.model';
import { StatsResponse } from '../models/v2/stats-response.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiV2Service {
  ROOT_ENDPOINT: string;

  constructor(private httpClient: HttpClient) {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
  }

  setRoot(rootUrl: string) {
    this.ROOT_ENDPOINT = rootUrl;
  }

  get<T, K>(url: string, config: Partial<K> = {}) {
    return this.httpClient.get<Partial<ApiV2Response<T>>>(this.ROOT_ENDPOINT + '/v2' + url, config);
  }

  getStats<T>(url: string, config = {}) {
    return this.httpClient.get<T>(this.ROOT_ENDPOINT + '/v2' + url, config);
  }

  extendQueryParamsForTextSearch(queryParams = {}, simpleSearchText: string) {
    if (simpleSearchText === undefined || simpleSearchText.length < 1) {
      return queryParams;
    }

    const textArray = simpleSearchText.split(/(\s+)/).filter((word) => word.trim().length > 0);
    const lastElement = textArray[textArray.length - 1];
    const arrayWithoutLastElement = textArray.slice(0, -1);

    const searchQuery = arrayWithoutLastElement
      .reduce((curr, agg) => agg + ' & ' + curr, '')
      .concat(lastElement)
      .concat(':*');

    return Object.assign({}, queryParams, { _search_document: 'fts.' + searchQuery });
  }
}
