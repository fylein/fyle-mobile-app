import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';
import { concatMap, map, reduce, switchMap } from 'rxjs/operators';
import { from, Observable, range } from 'rxjs';
import { ApiV2Service } from './api-v2.service';
import { AuthService } from './auth.service';
import { DataTransformService } from './data-transform.service';
import { CorporateCardExpense } from '../models/v2/corporate-card-expense.model';
import { BankAccountsAssigned } from '../models/v2/bank-accounts-assigned.model';

@Injectable({
  providedIn: 'root',
})
export class CorporateCreditCardExpenseService {
  constructor(
    private apiService: ApiService,
    private apiV2Service: ApiV2Service,
    private dataTransformService: DataTransformService,
    private authService: AuthService
  ) {}

  getPaginatedECorporateCreditCardExpenseStats(params) {
    return this.apiService.get('/extended_corporate_credit_card_expenses/stats', { params });
  }

  getv2CardTransactions(config: { offset: number; queryParams: any; limit: number; order?: string }): Observable<{
    count: number;
    data: CorporateCardExpense[];
    limit: number;
    offset: number;
    url: string;
  }> {
    return this.apiV2Service
      .get('/corporate_card_transactions', {
        params: {
          offset: config.offset,
          limit: config.limit,
          order: `${config.order || 'txn_dt.desc'},id.desc`,
          ...config.queryParams,
        },
      })
      .pipe(
        map(
          (res) =>
            res as {
              count: number;
              data: any[];
              limit: number;
              offset: number;
              url: string;
            }
        )
      );
  }

  getv2CardTransaction(id: string): Observable<CorporateCardExpense> {
    return this.apiV2Service
      .get('/corporate_card_transactions', {
        params: {
          id: `eq.${id}`,
        },
      })
      .pipe(map((res) => res && res.data && res.data[0]));
  }

  getv2CardTransactionsCount(queryParams = {}): Observable<number> {
    return this.getv2CardTransactions({
      offset: 0,
      limit: 1,
      queryParams,
    }).pipe(map((res) => res.count));
  }

  getAllv2CardTransactions(config: Partial<{ order: string; queryParams: any }>): Observable<CorporateCardExpense[]> {
    return this.getv2CardTransactionsCount(config.queryParams).pipe(
      switchMap((count) => {
        count = count > 50 ? count / 50 : 1;
        return range(0, count);
      }),
      concatMap((page) =>
        this.getv2CardTransactions({
          offset: 50 * page,
          limit: 50,
          queryParams: config.queryParams,
          order: config.order,
        })
      ),
      map((res) => res.data),
      reduce((acc, curr) => acc.concat(curr))
    );
  }

  markPersonal(corporateCreditCardExpenseGroupId: string) {
    return this.apiService.post('/corporate_credit_card_expenses/' + corporateCreditCardExpenseGroupId + '/personal');
  }

  dismissCreditTransaction(corporateCreditCardExpenseId: string) {
    return this.apiService.post('/corporate_credit_card_expenses/' + corporateCreditCardExpenseId + '/ignore');
  }

  unmarkPersonal(corporateCreditCardExpenseGroupId: string) {
    return this.apiService.post(
      '/corporate_credit_card_expenses/' + corporateCreditCardExpenseGroupId + '/unmark_personal'
    );
  }

  undoDismissedCreditTransaction(corporateCreditCardExpenseId: string) {
    return this.apiService.post('/corporate_credit_card_expenses/' + corporateCreditCardExpenseId + '/undo_ignore');
  }

  getEccceByGroupId(groupId: string) {
    const data = {
      params: {
        group_id: groupId,
      },
    };

    return this.apiService
      .get('/extended_corporate_credit_card_expenses', data)
      .pipe(map((res) => (res && res.length && res.map((elem) => this.dataTransformService.unflatten(elem))) || []));
  }

  constructInQueryParamStringForV2(params) {
    // in.(IN_PROGRESS,SETTLED)
    var queryString = 'in.(';
    params.forEach(function (param) {
      queryString += param + ',';
    });
    queryString = queryString.slice(0, -1);
    queryString += ')';
    return queryString;
  }

  getAssignedCards() {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.apiV2Service.get(
          '/expenses_and_ccce/stats?aggregates=count(tx_id),sum(tx_amount)&scalar=true&dimension_1_1=corporate_credit_card_bank_name,corporate_credit_card_account_number,tx_state&tx_state=' +
            this.constructInQueryParamStringForV2(['COMPLETE', 'DRAFT']) +
            '&corporate_credit_card_account_number=not.is.null&debit=is.true&tx_org_user_id=eq.' +
            eou.ou.id,
          {}
        )
      ),
      map((statsResponse) => {
        var stats = {
          totalTxns: '',
          totalAmount: '',
          cardDetails: statsResponse.data && statsResponse.data[1].value,
        };
        statsResponse.data[0].aggregates.forEach(function (aggregate) {
          if (aggregate.function_name === 'count(tx_id)') {
            stats.totalTxns = aggregate.function_value;
          }
          if (aggregate.function_name === 'sum(tx_amount)') {
            stats.totalAmount = aggregate.function_value;
          }
        });
        return stats;
      })
    );

    // return from(this.authService.getEou()).pipe(
    //   switchMap((eou) =>
    //     this.apiV2Service.get('/bank_accounts_assigned', {
    //       params: {
    //         assigned_to_ou_id: 'eq.' + eou.ou.id,
    //       },
    //     })
    //   ),
    //   map((res) => res.data as BankAccountsAssigned[])
    // );
  }
}
