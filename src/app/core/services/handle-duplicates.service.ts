import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DuplicateSets } from '../models/v2/duplicate-sets.model';
import { ApiService } from './api.service';
@Injectable({
  providedIn: 'root',
})
export class HandleDuplicatesService {
  constructor(private apiService: ApiService) {}

  getDuplicateSets(): Observable<DuplicateSets[]> {
    return this.apiService.get('/transactions/duplicates/sets');
  }

  getDuplicatesByExpense(txnId: string): Observable<DuplicateSets[]> {
    return this.apiService.get('/transactions/duplicates/sets', {
      params: {
        txn_id: txnId,
      },
    });
  }

  dismissAll(duplicateSetTransactionIds: string[], transactionIds: string[]) {
    return this.apiService.post('/transactions/duplicates/dismiss', {
      duplicate_set_transaction_ids: duplicateSetTransactionIds,
      transaction_ids: transactionIds,
    });
  }
}
