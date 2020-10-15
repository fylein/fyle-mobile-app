import { Component, OnInit, forwardRef, Input } from '@angular/core';

import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormBuilder, FormGroup } from '@angular/forms';
import { noop } from 'rxjs';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ModalController } from '@ionic/angular';
import { FyCurrencyChooseCurrencyComponent } from './fy-currency-choose-currency/fy-currency-choose-currency.component';
import { FyCurrencyExchangeRateComponent } from './fy-currency-exchange-rate/fy-currency-exchange-rate.component';

@Component({
  selector: 'app-fy-currency',
  templateUrl: './fy-currency.component.html',
  styleUrls: ['./fy-currency.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FyCurrencyComponent),
      multi: true
    }
  ]
})
export class FyCurrencyComponent implements ControlValueAccessor, OnInit {
  @Input() txnDt: Date;
  @Input() homeCurrency: string;

  private innerValue: {
    amount: number,
    currency: string,
    orig_amount: number,
    orig_currency: string
  };

  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;
  fg: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private currencyService: CurrencyService
  ) { }

  ngOnInit() {
    this.fg = this.fb.group({
      currency: [], // currency which is currently shown
      amount: [], // amount which is currently shown
      homeCurrencyAmount: [] // Amount converted to home currency
    });

    this.fg.valueChanges.subscribe(formValue => {
      const value = {
        amount: null,
        currency: null,
        orig_amount: null,
        orig_currency: null
      };
      if (formValue.currency !== this.homeCurrency) {
        value.currency = this.homeCurrency;
        value.amount = formValue.homeCurrencyAmount;
        value.orig_amount = formValue.amount;
        value.orig_currency = formValue.currency;
      } else {
        value.currency = this.homeCurrency;
        value.amount = formValue.amount;
      }

      if (!this.checkIfSameValue(value, this.innerValue)) {
        this.value = value;
      }
    });
  }

  checkIfSameValue(amount1, amount2) {
    return amount1.amount === amount2.amount &&
      amount1.currency === amount2.currency &&
      amount1.orig_amount === amount2.orig_amount &&
      amount1.orig_currency === amount2.orig_currency;
  }

  convertInnerValueToFormValue(innerVal) {
    if (innerVal.orig_currency && innerVal.orig_currency !== this.homeCurrency) {
      return {
        amount: innerVal.orig_amount,
        currency: innerVal.orig_currency,
        homeCurrencyAmount: innerVal.amount
      };
    } else {
      return {
        amount: innerVal.amount,
        currency: innerVal.currency,
        homeCurrencyAmount: null
      };
    }
  }

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.fg.setValue(this.convertInnerValueToFormValue(this.innerValue));
      this.onChangeCallback(v);
    }
  }

  onBlur() {
    this.onTouchedCallback();
  }

  writeValue(value: any) {
    if (value !== this.innerValue) {
      this.innerValue = value;
      this.fg.setValue(this.convertInnerValueToFormValue(this.innerValue));
    }
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  async openCurrencyModal() {
    const currencyModal = await this.modalController.create({
      component: FyCurrencyChooseCurrencyComponent,
      componentProps: {
        currentSelection: this.fg.controls.currency.value
      }
    });

    await currencyModal.present();

    const { data } = await currencyModal.onWillDismiss();
    if (data) {
      const shortCode = data.currency.shortCode;
      if (shortCode === this.homeCurrency) {
        this.fg.controls.currency.setValue(shortCode);
      } else {
        const exchangeRateModal = await this.modalController.create({
          component: FyCurrencyExchangeRateComponent,
          componentProps: {
            amount: this.fg.controls.amount.value,
            currentCurrency: this.homeCurrency,
            newCurrency: shortCode
          }
        });

        await exchangeRateModal.present();

        const { data } = await exchangeRateModal.onWillDismiss();
        if (data) {
          this.fg.setValue({
            currency: shortCode,
            amount: data.amount,
            homeCurrencyAmount: data.homeCurrencyAmount
          });
        }
      }
    }
  }
}
