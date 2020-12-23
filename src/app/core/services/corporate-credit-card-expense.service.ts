import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';
import {concatMap, map, reduce, switchMap, tap} from 'rxjs/operators';
import {from, range} from 'rxjs';
import {ApiV2Service} from './api-v2.service';
import {LoaderService} from './loader.service';
import {AuthService} from './auth.service';
import {DataTransformService} from './data-transform.service';

@Injectable({
  providedIn: 'root'
})
export class CorporateCreditCardExpenseService {

  constructor(
    private networkService: NetworkService,
    private storageService: StorageService,
    private apiService: ApiService,
    private apiV2Service: ApiV2Service,
    private authService: AuthService,
    private dataTransformService: DataTransformService
  ) { }

  getPaginatedECorporateCreditCardExpenseStats(params) {
    return this.apiService.get('/extended_corporate_credit_card_expenses/stats', {params});
  }

  getv2CardTransactions(config: { offset: number; queryParams: any; limit: number; order?: string }) {
      return this.apiV2Service.get('/corporate_card_transactions', {
        params: {
          offset: config.offset,
          limit: config.limit,
          order: `${config.order || 'txn_dt.desc'},id.desc`,
          ...config.queryParams
        }
      }).pipe(
        map(res => res as {
          count: number,
          data: any[],
          limit: number,
          offset: number,
          url: string
        })
      );
  }

  getv2CardTransaction(id: string) {
    return this.apiV2Service.get('/corporate_card_transactions', {
      params: {
        id: `eq.${id}`
      }
    }).pipe(
      map(res => res && res.data && res.data[0])
    );
  }

  getv2CardTransactionsCount(queryParams = {}) {
    return this.getv2CardTransactions({
      offset: 0,
      limit: 1,
      queryParams
    }).pipe(
      map(res => res.count)
    );
  }

  getAllv2CardTransactions(config: Partial<{ order: string, queryParams: any }>) {
    return this.getv2CardTransactionsCount(config.queryParams).pipe(
      switchMap(count => {
        return range(0, count / 50);
      }),
      concatMap(page => {
        return this.getv2CardTransactions({ offset: 50 * page, limit: 50, queryParams: config.queryParams, order: config.order });
      }),
      map(res => res.data),
      reduce((acc, curr) => {
        return acc.concat(curr);
      }, [] as any[])
    );
  }

  markPersonal(corporateCreditCardExpenseGroupId: string) {
    return this.apiService.post('/corporate_credit_card_expenses/' + corporateCreditCardExpenseGroupId + '/personal');
  }

  dismissCreditTransaction(corporateCreditCardExpenseId: string) {
    return this.apiService.post('/corporate_credit_card_expenses/' + corporateCreditCardExpenseId + '/ignore');
  }

  unmarkPersonal(corporateCreditCardExpenseGroupId: string) {
    return this.apiService.post('/corporate_credit_card_expenses/' + corporateCreditCardExpenseGroupId + '/unmark_personal');
  }

  undoDismissedCreditTransaction(corporateCreditCardExpenseId: string) {
    return this.apiService.post('/corporate_credit_card_expenses/' + corporateCreditCardExpenseId + '/undo_ignore');
  }

  getEccceByGroupId(groupId: string) {
    const data = {
      params: {
        group_id: groupId
      }
    };

    return this.apiService.get('/extended_corporate_credit_card_expenses', data).pipe(
      map(res => (res && res.length && res.map(elem => this.dataTransformService.unflatten(elem))) || [])
    );
  }
}
