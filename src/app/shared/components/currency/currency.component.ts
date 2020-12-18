import { Component, OnInit, Input } from '@angular/core';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import {filter, map, switchMap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Expense} from '../../../core/models/expense.model';


@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss'],
})
export class CurrencyComponent implements OnInit {

  @Input() options: any;
  @Input() etxn: Expense;

  calculatedExchangeRate$: Observable<number>;
  amountConvertedToHomeCurrency$: Observable<number>;
  homeCurrency$: Observable<string>;

  constructor(
    private currencyService: CurrencyService,
    private offlineService: OfflineService
  ) { }

  ngOnInit() {
    console.log(this.etxn);
    this.homeCurrency$ = this.offlineService.getHomeCurrency();

    this.calculatedExchangeRate$ = this.homeCurrency$.pipe(
        filter(homeCurrency => this.etxn.tx_currency !== homeCurrency),
        switchMap(homeCurrency => {
          return this.currencyService.getExchangeRate(this.etxn.tx_currency, homeCurrency, this.etxn.tx_txn_dt);
        })
    );

    this.amountConvertedToHomeCurrency$ = this.calculatedExchangeRate$.pipe(
        map(
            (calculatedExchangeRate: number) => this.etxn.tx_amount * calculatedExchangeRate
        )
    );
  }

}
