import { Injectable } from '@angular/core';
import { OrgService } from './org.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  constructor(
    private orgService: OrgService,
    private authService: AuthService,
    private apiService: ApiService
  ) { }

  getHomeCurrency() {
    return this.orgService.getCurrentOrg()
      .pipe(
        map(
          org => org.currency
        )
      );
  }

 

  getAll() {
    return from(this.authService.getEou())
      .pipe(
        switchMap(
          currentEou => {
            return this.apiService.get('/currency/all', {
              params: {
                org_id: currentEou && currentEou.ou && currentEou.ou.org_id
              }
            });
          }
        )
      );
  }

  getCurrenyList(currencies) {
    const currencyList = [];
    for (const currency in currencies) {
      if (Object.prototype.hasOwnProperty.call(currencies, currency)) {
        const obj = {
          id: currency,
          value: currencies[currency]
        };
        currencyList.push(obj);
      }
    }
    return currencyList;
  }

  // Todo: Remove this method and change getAll() method to return currency in list format not in object format.
  getAllCurrenciesInList() {
    return from(this.getAll()).pipe(
      map((res) => {
        return this.getCurrenyList(res);
      })
    )
  }
}


