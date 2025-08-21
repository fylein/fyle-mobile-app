import { getNumberOfCurrencyDigits } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import dayjs from 'dayjs';
import { Observable, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Cacheable } from 'ts-cacheable';
import { CurrencyName } from '../models/currency.model';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { ExchangeRateResponse } from '../models/exchange-rate-response.model';
import { AuthService } from './auth.service';
import { OrgService } from './org.service';
import { PlatformCommonApiService } from './platform-common-api.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private orgService = inject(OrgService);

  private authService = inject(AuthService);

  private platformCommonApiService = inject(PlatformCommonApiService);

  @Cacheable()
  getExchangeRate(fromCurrency: string, toCurrency: string, dt = new Date(), txnId?: string): Observable<number> {
    const txnDt = dayjs(dt).format('YYYY-MM-D');
    const queryParams = {
      from: fromCurrency,
      to: toCurrency,
      date: txnDt,
    };

    if (txnId) {
      queryParams[txnId] = txnId;
    }

    return this.platformCommonApiService
      .get<PlatformApiResponse<ExchangeRateResponse>>('/currency/exchange_rate', {
        params: queryParams,
      })
      .pipe(
        map((res) => parseFloat(res.data.exchange_rate.toFixed(7))),
        catchError(() => of(1)),
      );
  }

  @Cacheable()
  getAll(): Observable<CurrencyName> {
    return from(this.authService.getEou()).pipe(
      switchMap((currentEou: ExtendedOrgUser) =>
        this.platformCommonApiService
          .get<PlatformApiResponse<CurrencyName>>('/currency/list', {
            params: {
              org_id: currentEou?.ou?.org_id,
            },
          })
          .pipe(map((response) => response.data)),
      ),
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
