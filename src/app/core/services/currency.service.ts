import { getNumberOfCurrencyDigits } from '@angular/common';
import { Injectable } from '@angular/core';
import * as dayjs from 'dayjs';
import { Observable, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Cacheable } from 'ts-cacheable';
import { CurrencyName } from '../models/currency.model';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { PublicPolicyExpense } from '../models/public-policy-expense.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { OrgService } from './org.service';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  constructor(private orgService: OrgService, private authService: AuthService, private apiService: ApiService) {}

  @Cacheable()
  getExchangeRate(fromCurrency: string, toCurrency: string, dt = new Date(), txnId?: string): Observable<number> {
    const txnDt = dayjs(dt).format('YYYY-MM-D');
    const queryParams = {
      from: fromCurrency,
      to: toCurrency,
      dt: txnDt,
    };

    if (txnId) {
      queryParams[txnId] = txnId;
    }

    return this.apiService
      .get<Partial<PublicPolicyExpense>>('/currency/exchange', {
        params: queryParams,
      })
      .pipe(
        map((res) => parseFloat(res.exchange_rate.toFixed(7))),
        catchError(() => of(1))
      );
  }

  @Cacheable()
  getAll(): Observable<CurrencyName> {
    return from(this.authService.getEou()).pipe(
      switchMap((currentEou: ExtendedOrgUser) =>
        this.apiService.get<CurrencyName>('/currency/all', {
          params: {
            org_id: currentEou && currentEou.ou && currentEou.ou.org_id,
          },
        })
      )
    );
  }

  @Cacheable()
  getHomeCurrency(): Observable<string> {
    return this.orgService.getCurrentOrg().pipe(map((org) => org.currency));
  }

  getAmountWithCurrencyFraction(amount: number, currencyCode: string): number {
    const currencyFraction = getNumberOfCurrencyDigits(currencyCode);
    const fixedAmount = amount.toFixed(currencyFraction);

    return parseFloat(fixedAmount);
  }
}
