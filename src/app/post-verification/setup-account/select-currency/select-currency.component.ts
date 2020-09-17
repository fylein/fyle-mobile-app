import { Component, OnInit } from '@angular/core';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { Observable, noop, from } from 'rxjs';
import { tap, map, finalize, concatMap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { LoaderService } from 'src/app/core/services/loader.service';

@Component({
  selector: 'app-select-currency',
  templateUrl: './select-currency.component.html',
  styleUrls: ['./select-currency.component.scss'],
})
export class SelectCurrencyComponent implements OnInit {

  $currencies: Observable<any>;

  constructor(
    private currencyService: CurrencyService,
    private modalController: ModalController,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.$currencies = from(this.loaderService.showLoader()).pipe(
      concatMap(() => {
        return this.currencyService.getAll();
      }),
      map(currenciesObj => Object.keys(currenciesObj).map(shortCode => ({ shortCode, longName: currenciesObj[shortCode] }))),
      finalize(() => {
        from(this.loaderService.hideLoader()).subscribe(noop);
      })
    );

    this.$currencies.subscribe(noop);
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  onCurrencySelect(currency) {
    this.modalController.dismiss({
      currency
    });
  }

}
