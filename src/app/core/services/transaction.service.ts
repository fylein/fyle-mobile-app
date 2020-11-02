import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DateService } from './date.service';
import { map, switchMap, tap, concatMap, reduce } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { NetworkService } from './network.service';
import { from, Observable, range } from 'rxjs';
import { ApiV2Service } from './api-v2.service';
import { DataTransformService } from './data-transform.service';
import { AuthService } from './auth.service';
import { Expense } from '../models/expense.model';



@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(
    private networkService: NetworkService,
    private storageService: StorageService,
    private apiService: ApiService,
    private apiV2Service: ApiV2Service,
    private dataTransformService: DataTransformService,
    private dateService: DateService,
    private authService: AuthService,
  ) { }

  get(txnId) {
    // TODO api v2
    return this.apiService.get('/transactions/' + txnId).pipe(
      map((transaction) => {
        return this.dateService.fixDates(transaction);
      })
    );
  }

  getEtxn(txnId) {
    // TODO api v2
    return this.apiService.get('/etxns/' + txnId).pipe(
      map((transaction) => {

        let categoryDisplayName = transaction.tx_org_category;
        if (transaction.tx_sub_category && transaction.tx_sub_category.toLowerCase() !== categoryDisplayName.toLowerCase()) {
          categoryDisplayName += ' / ' + transaction.tx_sub_category;
        }
        transaction.tx_categoryDisplayName = categoryDisplayName;

        return this.dateService.fixDates(transaction);
      })
    );
  }

  parseRaw(etxnsRaw) {
    const etxns = [];

    etxnsRaw.forEach(element => {
      const etxn = this.dataTransformService.unflatten(element);

      this.dateService.fixDates(etxn.tx);
      this.dateService.fixDates(etxn.rp);

      let categoryDisplayName = etxn.tx.org_category;
      if (etxn.tx.sub_category && etxn.tx.sub_category.toLowerCase() !== categoryDisplayName.toLowerCase()) {
        categoryDisplayName += ' / ' + etxn.tx.sub_category;
      }
      etxn.tx.categoryDisplayName = categoryDisplayName;
      etxns.push(etxn);
    });

    return etxns;
  }

  getCountBySource(etxns, source) {
    const lowerCaseSource = source.toLowerCase();
    let count = 0;

    etxns.forEach((etxn) => {
      if (etxn.tx_source && etxn.tx_source.toLowerCase().indexOf(lowerCaseSource) > -1) {
        count++;
      }
    });

    return count;
  }

  getUserTransactionParams(state: string) {
    const stateMap = {
      draft: {
        state: ['DRAFT']
      },
      all: {
        state: ['COMPLETE'],
        policy_amount: ['is:null', 'gt:0.0001']
      },
      flagged: {
        policy_flag: true,
        policy_amount: ['is:null', 'gt:0.0001']
      },
      critical: {
        policy_amount: ['lt:0.0001']
      },
      unreported: {
        state: ['COMPLETE', 'DRAFT']
      },
      recurrence: {
        source: ['RECURRENCE_WEBAPP']
      },
      needsReceipt: {
        tx_receipt_required: true
      }
    };

    return stateMap[state];
  }

  getPaginatedETxncStats(params) {
    return this.apiService.get('/etxns/stats', { params });
  }

  getPaginatedETxncCount(params) {
    return this.networkService.isOnline().pipe(
      switchMap(
        isOnline => {
          if (isOnline) {
            return this.apiService.get('/etxns/count', { params }).pipe(
              tap((res) => {
                this.storageService.set('etxncCount' + JSON.stringify(params), res);
              })
            );
          } else {
            return from(this.storageService.get('etxncCount' + JSON.stringify(params)));
          }
        }
      )
    );
  }

  getMyETxncCount(tx_org_user_id: string): Observable<{ count: number }> {
    return this.apiV2Service.get('/expenses', { params: { offset: 0, limit: 1, tx_org_user_id } }).pipe(
      map(
        res => res as { count: number }
      )
    );
  }

  getMyETxnc(params: { offset: number, limit: number, tx_org_user_id: string }) {
    return this.apiV2Service.get('/expenses', {
      params
    }).pipe(
      map(
        (etxns) => {
          return etxns.data;
        }
      )
    );
  }

  getETxnc(params: { offset: number, limit: number, params: any }) {
    return this.apiV2Service.get('/expenses', {
      ...params
    }).pipe(
      map(
        (etxns) => {
          return etxns.data;
        }
      )
    );
  }

  getETxnCount(params: any) {
    return this.apiV2Service.get('/expenses', { params }).pipe(
      map(
        res => res as { count: number }
      )
    );
  }

  getAllETxnc(params) {
    return this.getETxnCount(params).pipe(
      switchMap(res => {
        return range(0, res.count / 50);
      }),
      concatMap(page => {
        return this.getETxnc({ offset: 50 * page, limit: 50, params });
      }),
      reduce((acc, curr) => {
        return acc.concat(curr);
      })
    );
  }

  getAllMyETxnc() {
    return from(this.authService.getEou()).pipe(
      switchMap(eou => {
        return this.getMyETxncCount('eq.' + eou.ou.id).pipe(
          switchMap(res => {
            return range(0, res.count / 50);
          }),
          concatMap(page => {
            return this.getMyETxnc({ offset: 50 * page, limit: 50, tx_org_user_id: 'eq.' + eou.ou.id });
          }),
          reduce((acc, curr) => {
            return acc.concat(curr);
          })
        );
      })
    );
  }

  getMyExpensesCount(queryParams = {}) {
    return this.getMyExpenses({
      offset: 0,
      limit: 1,
      queryParams
    }).pipe(
      map(res => res.count)
    );
  }

  getMyExpenses(config: Partial<{ offset: number, limit: number, order: string, queryParams: any }> = {
    offset: 0,
    limit: 10,
    queryParams: {}
  }) {
    return from(this.authService.getEou()).pipe(
      switchMap(eou => {
        return this.apiV2Service.get('/expenses', {
          params: {
            offset: config.offset,
            limit: config.limit,
            order: `${config.order || 'tx_txn_dt.desc'},tx_id.desc`,
            tx_org_user_id: 'eq.' + eou.ou.id,
            ...config.queryParams
          }
        });
      }),
      map(res => res as {
        count: number,
        data: any[],
        limit: number,
        offset: number,
        url: string
      }),
      map(res => ({
        ...res,
        data: res.data.map(this.dateService.fixDates)
      }))
    );
  }

  getAllExpenses(config: Partial<{ order: string, queryParams: any }>) {
    return this.getMyExpensesCount(config.queryParams).pipe(
      switchMap(count => {
        return range(0, count / 50);
      }),
      concatMap(page => {
        return this.getMyExpenses({ offset: 50 * page, limit: 50, queryParams: config.queryParams, order: config.order });
      }),
      map(res => res.data),
      reduce((acc, curr) => {
        return acc.concat(curr);
      }, [] as any[])
    );
  }

  getTransactionStats(aggregates: string, queryParams = {}) {
    return from(this.authService.getEou()).pipe(
      switchMap(eou => {
        return this.apiV2Service.get('/expenses/stats', {
          params: {
            aggregates,
            tx_org_user_id: 'eq.' + eou.ou.id,
            ...queryParams
          }
        });
      }),
      map(res => res.data)
    );
  }

  getExpenseV2(id: string): Observable<any> {
    return this.apiV2Service.get('/expenses', {
      params: {
        tx_id: `eq.${id}`
      }
    }).pipe(
      map(
        res => this.fixDates(res.data[0]) as Expense
      )
    );
  }

  fixDates(data: Expense) {
    data.tx_created_at = new Date(data.tx_created_at);
    if(data.tx_txn_dt) {
      data.tx_txn_dt = new Date(data.tx_txn_dt);
    }

    if(data.tx_from_dt) {
      data.tx_from_dt = new Date(data.tx_from_dt);
    }

    if(data.tx_to_dt) {
      data.tx_to_dt = new Date(data.tx_to_dt);
    }

    data.tx_updated_at = new Date(data.tx_updated_at);
    return data;
  }

  delete(txnId: string) {
    return this.apiService.delete('/transactions/' + txnId);
  }

}
