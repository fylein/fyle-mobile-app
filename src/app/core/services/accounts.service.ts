import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { DataTransformService } from './data-transform.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  constructor(
    private apiService: ApiService,
    private dataTransformService: DataTransformService
  ) { }

  getEMyAccounts(filters?) {
    const data = {
      params: filters
    };

    return this.apiService.get('/eaccounts/', data).pipe(
      map(
        (accountsRaw: any[]) => {
          const accounts = [];

          accountsRaw.forEach((accountRaw) => {
            const account = this.dataTransformService.unflatten(accountRaw);
            accounts.push(account);
          });

          return accounts;
        }
      )
    );
  }
}
