import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoaderService } from 'src/app/core/services/loader.service';
import { switchMap, finalize, distinctUntilChanged, debounceTime, throttle, throttleTime } from 'rxjs/operators';
import { from } from 'rxjs';

@Component({
  selector: 'app-fy-currency-exchange-rate',
  templateUrl: './fy-currency-exchange-rate.component.html',
  styleUrls: ['./fy-currency-exchange-rate.component.scss'],
})
export class FyCurrencyExchangeRateComponent implements OnInit {

  @Input() amount;
  @Input() currentCurrency;
  @Input() newCurrency;

  fg: FormGroup;

  constructor(
    private modalController: ModalController,
    private currencyService: CurrencyService,
    private formBuilder: FormBuilder,
    private loaderService: LoaderService
  ) { }

  toFixed(num, fixed) {
    const re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
  }

  ngOnInit() {

    this.fg = this.formBuilder.group({
      newCurrencyAmount: [, Validators.compose([Validators.pattern('^[0-9]*$'), Validators.required])],
      exchangeRate: [, Validators.compose([Validators.pattern('^[0-9]*$'), Validators.required])],
      homeCurrencyAmount: [, Validators.compose([Validators.pattern('^[0-9]*$'), Validators.required])]
    });

    from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        // TODO: Pass transaction date here
        return this.currencyService.getExchangeRate(this.newCurrency, this.currentCurrency);
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    ).subscribe((exchangeRate) => {
      this.fg.setValue({
        newCurrencyAmount: this.amount,
        exchangeRate,
        homeCurrencyAmount: (exchangeRate * this.amount)
      });
    });


    this.fg.controls.newCurrencyAmount.valueChanges.pipe(
      distinctUntilChanged(),
      throttleTime(100)
    ).subscribe(() => {
      const amount = +this.fg.controls.newCurrencyAmount.value * +this.fg.controls.exchangeRate.value;
      if (amount && amount !== Infinity) {
        this.fg.controls.homeCurrencyAmount.setValue(this.toFixed(amount, 2));
      } else {
        this.fg.controls.homeCurrencyAmount.setValue(0);
      }
    });


    this.fg.controls.exchangeRate.valueChanges.pipe(
      distinctUntilChanged(),
      throttleTime(100)
    ).subscribe(() => {
      const amount = +this.fg.controls.newCurrencyAmount.value * +this.fg.controls.exchangeRate.value;
      if (amount && amount !== Infinity) {
        this.fg.controls.homeCurrencyAmount.setValue(this.toFixed(amount, 2));
      } else {
        this.fg.controls.homeCurrencyAmount.setValue(0);
      }
    });

    this.fg.controls.homeCurrencyAmount.valueChanges.pipe(
      distinctUntilChanged(),
      throttleTime(100)
    ).subscribe((e) => {
      if (this.fg.controls.newCurrencyAmount.value && this.fg.controls.homeCurrencyAmount.value) {
        this.fg.controls.exchangeRate.setValue(
          this.toFixed((+this.fg.controls.homeCurrencyAmount.value) / (+this.fg.controls.newCurrencyAmount.value), 7));
      }
    });
  }

  save() {
    this.modalController.dismiss({
      amount: this.fg.value.newCurrencyAmount,
      homeCurrencyAmount: this.fg.value.homeCurrencyAmount
    });
  }

  onDoneClick() {
    this.modalController.dismiss();
  }
}
