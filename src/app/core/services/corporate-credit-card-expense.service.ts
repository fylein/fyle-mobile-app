import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';
import { switchMap, tap } from 'rxjs/operators';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CorporateCreditCardExpenseService {

  constructor(
    private networkService: NetworkService,
    private storageService: StorageService,
    private apiService: ApiService
  ) { }

  getPaginatedECorporateCreditCardExpenseStats = function (params) {
    return this.apiService.get('/extended_corporate_credit_card_expenses/stats', {params});
  };
}
