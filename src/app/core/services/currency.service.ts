import { Injectable } from '@angular/core';
import { OrgService } from './org.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { from, of, Subject } from 'rxjs';
import * as moment from 'moment';
import { Cacheable } from 'ts-cacheable';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  constructor(private orgService: OrgService, private authService: AuthService, private apiService: ApiService) {}

  @Cacheable()
  getExchangeRate(fromCurrency, toCurrency, dt = new Date(), txnId?) {
    const txnDt = moment(dt).format('y-MM-D');
    const queryParams = {
      from: fromCurrency,
      to: toCurrency,
      dt: txnDt,
    };

    if (txnId) {
      queryParams[txnId] = txnId;
    }

    return this.apiService
      .get('/currency/exchange', {
        params: queryParams,
      })
      .pipe(
        map((res) => parseFloat(res.exchange_rate.toFixed(7))),
        catchError(() => of(1))
      );
  }

  @Cacheable()
  getAll() {
    return from(this.authService.getEou()).pipe(
      switchMap((currentEou) =>
        this.apiService.get('/currency/all', {
          params: {
            org_id: currentEou && currentEou.ou && currentEou.ou.org_id,
          },
        })
      )
    );
  }

  getHomeCurrency() {
    return this.orgService.getCurrentOrg().pipe(map((org) => org.currency));
  }

  getAmountDecimalsBasedOnValue(amount) {
    let decimalAmount;

    if (amount < 0.01) {
      decimalAmount = parseFloat(amount.toFixed(7));
    } else if (amount >= 0.01 && amount < 1) {
      decimalAmount = parseFloat(amount.toFixed(4));
    } else {
      decimalAmount = parseFloat(amount.toFixed(2));
    }

    return decimalAmount;
  }

  getCurrenyList(currencies) {
    const currencyList = [];
    for (const currency in currencies) {
      if (Object.prototype.hasOwnProperty.call(currencies, currency)) {
        const obj = {
          id: currency,
          value: currencies[currency],
        };
        currencyList.push(obj);
      }
    }
    return currencyList;
  }

  // Todo: Remove this method and change getAll() method to return currency in list format not in object format.
  getAllCurrenciesInList() {
    return from(this.getAll()).pipe(map((res) => this.getCurrenyList(res)));
  }
}
