import { Injectable } from '@angular/core';
import { ApiV2Service } from './api-v2.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(
    private apiv2Service: ApiV2Service
  ) { }

  getV2Expenses(params) {
    return this.apiv2Service.get('/expenses', {
      params
    });
  }
}
