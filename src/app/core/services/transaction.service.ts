import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';
import { switchMap, tap } from 'rxjs/operators';
import { from } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(
    private networkService: NetworkService,
    private storageService: StorageService,
    private apiService: ApiService
  ) { }

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

}
