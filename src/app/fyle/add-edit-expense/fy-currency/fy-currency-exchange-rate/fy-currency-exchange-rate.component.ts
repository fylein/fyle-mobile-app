import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoaderService } from 'src/app/core/services/loader.service';
import {
  switchMap,
  finalize,
  distinctUntilChanged,
  debounceTime,
  throttle,
  throttleTime,
  pairwise,
  map,
} from 'rxjs/operators';
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

  @Input() txnDt;

  @Input() exchangeRate;

  fg: FormGroup;

  constructor(
    private modalController: ModalController,
    private currencyService: CurrencyService,
    private formBuilder: FormBuilder,
    private loaderService: LoaderService
  ) {}

  toFixed(num, fixed) {
    const re = new RegExp('^-?\\d+(?:.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
  }

  ngOnInit() {
    this.fg = this.formBuilder.group({
      newCurrencyAmount: [, Validators.compose([Validators.required])],
      exchangeRate: [, Validators.compose([Validators.required])],
      homeCurrencyAmount: [, Validators.compose([Validators.required])],
    });

    this.fg.updateValueAndValidity();

    if (this.exchangeRate) {
      this.fg.setValue({
        newCurrencyAmount: this.amount,
        exchangeRate: this.toFixed(this.exchangeRate, 7),
        homeCurrencyAmount: this.toFixed(this.exchangeRate * this.amount, 2),
      });
    } else {
      from(this.loaderService.showLoader())
        .pipe(
          switchMap(() =>
            this.currencyService.getExchangeRate(this.newCurrency, this.currentCurrency, this.txnDt || new Date())
          ),
          finalize(() => from(this.loaderService.hideLoader()))
        )
        .subscribe((exchangeRate) => {
          this.fg.setValue({
            newCurrencyAmount: this.amount,
            exchangeRate,
            homeCurrencyAmount: this.toFixed(exchangeRate * this.amount, 2),
          });
        });
    }

    this.fg.controls.newCurrencyAmount.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      const amount = +this.fg.controls.newCurrencyAmount.value * +this.fg.controls.exchangeRate.value;
      if (amount && amount !== Infinity) {
        this.fg.controls.homeCurrencyAmount.setValue(this.toFixed(amount, 2), {
          emitEvent: false,
        });
      } else {
        this.fg.controls.homeCurrencyAmount.setValue(0, {
          emitEvent: false,
        });
      }
      if (this.fg.controls.newCurrencyAmount.errors.pattern) {
        this.fg.controls.newCurrencyAmount.clearValidators();
        this.fg.controls.newCurrencyAmount.updateValueAndValidity();
      }
    });

    this.fg.controls.exchangeRate.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      const amount = +this.fg.controls.newCurrencyAmount.value * +this.fg.controls.exchangeRate.value;
      if (amount && amount !== Infinity) {
        this.fg.controls.homeCurrencyAmount.setValue(this.toFixed(amount, 2), {
          emitEvent: false,
        });
      } else {
        this.fg.controls.homeCurrencyAmount.setValue(0, {
          emitEvent: false,
        });
      }
      if (this.fg.controls.exchangeRate.errors.pattern) {
        this.fg.controls.exchangeRate.clearValidators();
        this.fg.controls.exchangeRate.updateValueAndValidity();
      }
    });

    this.fg.controls.homeCurrencyAmount.valueChanges.pipe(distinctUntilChanged()).subscribe((e) => {
      if (this.fg.controls.newCurrencyAmount.value && this.fg.controls.homeCurrencyAmount.value) {
        this.fg.controls.exchangeRate.setValue(
          this.toFixed(+this.fg.controls.homeCurrencyAmount.value / +this.fg.controls.newCurrencyAmount.value, 7),
          {
            emitEvent: false,
          }
        );
      }
      if (this.fg.controls.homeCurrencyAmount.errors.pattern) {
        this.fg.controls.homeCurrencyAmount.clearValidators();
        this.fg.controls.homeCurrencyAmount.updateValueAndValidity();
      }
    });
  }

  save() {
    this.modalController.dismiss({
      amount: +this.fg.value.newCurrencyAmount,
      homeCurrencyAmount: +this.fg.value.homeCurrencyAmount,
    });
  }

  onDoneClick() {
    this.modalController.dismiss({
      amount: +this.fg.value.newCurrencyAmount,
      homeCurrencyAmount: +this.fg.value.homeCurrencyAmount,
    });
  }
}
