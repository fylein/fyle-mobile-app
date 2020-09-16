import { Injectable } from '@angular/core';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(
    private apiService: ApiService
  ) { }

  getUserTransactionParams = function (state) {
    var stateMap = {
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
  };

  getPaginatedETxncStats = function (params) {
    var data = {
      params: params
    };

    return this.apiService.get('/etxns/stats', data);
  };
}
