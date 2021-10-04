import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, take } from 'rxjs/operators';
import { PersonalCard } from '../models/personal_card.model';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { ExpenseAggregationService } from './expense-aggregation.service';
import { Cacheable, CacheBuster } from 'ts-cacheable';

const tripRequestsCacheBuster$ = new Subject<void>();
@Injectable({
  providedIn: 'root',
})
export class PersonalCardsService {
  constructor(
    private apiv2Service: ApiV2Service,
    private expenseAggregationService: ExpenseAggregationService,
    private apiService: ApiService
  ) {}

  getLinkedAccounts(): Observable<PersonalCard[]> {
    return this.apiv2Service
      .get('/personal_bank_accounts', {
        params: {
          order: 'last_synced_at.desc',
        },
      })
      .pipe(map((res) => res.data));
  }

  getToken(): Observable<any> {
    return this.expenseAggregationService.get('/yodlee/access_token');
  }

  postBankAccounts(requestIds): Observable<any> {
    return this.expenseAggregationService.post('/yodlee/bank_accounts', {
      aggregator: 'yodlee',
      request_ids: requestIds,
    });
  }

  getLinkedAccountsCount(): Observable<number> {
    return this.apiv2Service
      .get('/personal_bank_accounts', {
        params: {
          order: 'last_synced_at.desc',
        },
      })
      .pipe(map((res) => res.count));
  }

  getMatchedExpenses(amount: number, txnDate: string): Observable<any[]> {
    return this.apiService
      .get('/expense_suggestions/personal_cards', {
        params: {
          amount,
          txn_dt: txnDate,
        },
      })
      .pipe(shareReplay(1));
  }

  getMatchedExpensesCount(amount: number, txnDate: string): Observable<number> {
    return this.getMatchedExpenses(amount, txnDate).pipe(map((res) => res.length));
  }
}
