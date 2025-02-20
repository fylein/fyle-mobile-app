import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
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

  fg: UntypedFormGroup;

  constructor(
    private modalController: ModalController,
    private currencyService: CurrencyService,
    private formBuilder: UntypedFormBuilder,
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

    if (this.exchangeRate) {
      this.fg.setValue({
        newCurrencyAmount: this.amount,
        exchangeRate: this.toFixed(this.exchangeRate, 7),
        homeCurrencyAmount: this.currencyService.getAmountWithCurrencyFraction(
          this.exchangeRate * this.amount,
          this.currentCurrency
        ),
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
            homeCurrencyAmount: this.currencyService.getAmountWithCurrencyFraction(
              exchangeRate * this.amount,
              this.currentCurrency
            ),
          });
        });
    }

    this.fg.controls.newCurrencyAmount.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      const amount = +this.fg.controls.newCurrencyAmount.value * +this.fg.controls.exchangeRate.value;
      if (amount && amount !== Infinity) {
        const formattedAmount = this.currencyService.getAmountWithCurrencyFraction(amount, this.currentCurrency);
        this.fg.controls.homeCurrencyAmount.setValue(formattedAmount, {
          emitEvent: false,
        });
      } else {
        this.fg.controls.homeCurrencyAmount.setValue(0, {
          emitEvent: false,
        });
      }
    });

    this.fg.controls.exchangeRate.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      const amount = +this.fg.controls.newCurrencyAmount.value * +this.fg.controls.exchangeRate.value;
      if (amount && amount !== Infinity) {
        const formattedAmount = this.currencyService.getAmountWithCurrencyFraction(amount, this.currentCurrency);
        this.fg.controls.homeCurrencyAmount.setValue(formattedAmount, {
          emitEvent: false,
        });
      } else {
        this.fg.controls.homeCurrencyAmount.setValue(0, {
          emitEvent: false,
        });
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
