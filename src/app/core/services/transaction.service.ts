import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';
import { concatMap, map, reduce, switchMap, tap } from 'rxjs/operators';
import { from, Observable, range } from 'rxjs';
import { DataTransformService } from './data-transform.service';
import { DateService } from './date.service';


@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(
    private networkService: NetworkService,
    private storageService: StorageService,
    private apiService: ApiService,
    private dataTransformService: DataTransformService,
    private dateService: DateService
  ) { }

  parseRaw(etxnsRaw) {
    console.log(etxnsRaw);
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
      if (etxn.tx.source && etxn.tx.source.toLowerCase().indexOf(lowerCaseSource) > -1) {
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
    return this.apiService.get('/etxns/stats', {params});
  };

  getPaginatedETxncCount = function (params) {
    return this.networkService.isOnline().pipe(
      switchMap(
        isOnline => {
          if (isOnline) {
            return this.apiService.get('/etxns/count', {params}).pipe(
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
  };

  getMyETxncCount(): Observable<{count: number}> {
    return this.apiService.get('/etxns/count').pipe(
      map(
        res => res as { count: number}
      )
    )
  }

  getMyETxnc(params: { offset: number, limit: number }) {
    return this.apiService.get('/etxns', {
      params
    }).pipe(
      map(
        eous => eous.map(eou => this.dataTransformService.unflatten(eou))
      )
    );
  }

  getAllMyETxnc() {
    return this.getMyETxncCount().pipe(
      switchMap(res => {
        return range(0, res.count / 50);
      }),
      concatMap(page => {
        return this.getMyETxnc({ offset: 50 * page, limit: 50 });
      }),
      reduce((acc, curr) => {
        return acc.concat(curr);
      })
    )
  }


}
