import { Component, OnInit, Input } from '@angular/core';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { filter, map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Expense } from '../../../core/models/expense.model';
import { cloneDeep } from 'lodash';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss'],
})
export class CurrencyComponent implements OnInit {
  @Input() options: any;

  @Input() etxn: Expense;

  extnInternal: Expense;

  showExchangeRate$: Observable<boolean>;

  calculatedExchangeRate$: Observable<number>;

  amountConvertedToHomeCurrency$: Observable<number>;

  homeCurrency$: Observable<string>;

  isIos: boolean;

  constructor(
    private currencyService: CurrencyService,
    private offlineService: OfflineService,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.isIos = this.platform.is('ios');
    this.extnInternal = cloneDeep(this.etxn);
    this.homeCurrency$ = this.offlineService.getHomeCurrency();

    this.showExchangeRate$ = this.homeCurrency$.pipe(
      map((homeCurrency) => {
        if (this.etxn.tx_orig_currency) {
          return this.etxn.tx_orig_currency !== homeCurrency;
        }

        return this.etxn.tx_currency !== homeCurrency;
      })
    );

    // TODO cleanup
    this.calculatedExchangeRate$ = this.homeCurrency$.pipe(
      switchMap((homeCurrency) => {
        let isHomeCurrency: boolean;

        if (this.etxn.tx_orig_amount && this.etxn.tx_orig_currency) {
          isHomeCurrency = this.etxn.tx_orig_currency === homeCurrency;

          if (!isHomeCurrency) {
            return of(this.etxn.tx_amount / this.etxn.tx_orig_amount);
          }
        } else {
          isHomeCurrency = this.etxn.tx_currency === homeCurrency;

          if (!isHomeCurrency) {
            this.extnInternal.tx_orig_currency = this.etxn.tx_currency;
            this.extnInternal.tx_currency = homeCurrency;
            this.extnInternal.tx_orig_amount = this.etxn.tx_amount;

            return this.currencyService.getExchangeRate(
              this.extnInternal.tx_orig_currency,
              homeCurrency,
              this.extnInternal.tx_txn_dt
            );
          }
        }
      })
    );

    this.amountConvertedToHomeCurrency$ = this.calculatedExchangeRate$.pipe(
      map((calculatedExchangeRate: number) => {
        if (this.etxn.tx_orig_amount) {
          return this.etxn.tx_orig_amount * calculatedExchangeRate;
        } else {
          return this.etxn.tx_amount * calculatedExchangeRate;
        }
      })
    );
  }
}
