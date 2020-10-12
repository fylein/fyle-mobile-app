import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DateService } from './date.service';
import { map, switchMap, tap, concatMap, reduce } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { NetworkService } from './network.service';
import { from, Observable, range, Subject } from 'rxjs';
import { ApiV2Service } from './api-v2.service';
import { DataTransformService } from './data-transform.service';
import { AuthService } from './auth.service';
import { Cacheable, CacheBuster } from 'ngx-cacheable';


const transactionCacheBuster$ = new Subject<void>();

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
    private authService: AuthService
  ) { }

  get(txnId) {
    return this.apiService.get('/transactions/' + txnId).pipe(
      map((transaction) => {
        return this.dateService.fixDates(transaction);
      })
    );
  }

  parseRaw(etxnsRaw) {
    let etxns = [];

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

  @Cacheable({
    maxCacheCount: 100,
    cacheBusterObserver: transactionCacheBuster$
  })
  getPaginatedETxncStats(params) {
    return this.apiService.get('/etxns/stats', { params });
  }

  @Cacheable({
    maxCacheCount: 100,
    cacheBusterObserver: transactionCacheBuster$
  })
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

  // @CacheBuster({
  //   cacheBusterNotifier: transactionCacheBuster$
  // })
  bustTransactionCache() {
    console.log('busting cache now... chik chik boom');
    transactionCacheBuster$.next();
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
}
