import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DateService } from './date.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(
    private apiService: ApiService,
    private dateService: DateService
  ) { }

  get(txnId) {
    return this.apiService.get('/transactions/' + txnId).pipe(
      map((transaction) => {
        return this.dateService.fixDates(transaction);
      })
    );
  }
}
