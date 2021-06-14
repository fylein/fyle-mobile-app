import { Component, OnInit, forwardRef, Input, Injector } from '@angular/core';

import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormBuilder, FormGroup, NgControl } from '@angular/forms';
import { noop } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { FyCurrencyChooseCurrencyComponent } from './fy-currency-choose-currency/fy-currency-choose-currency.component';
import { FyCurrencyExchangeRateComponent } from './fy-currency-exchange-rate/fy-currency-exchange-rate.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';

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
  private ngControl: NgControl;
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

  get valid() {
    if (this.ngControl.touched) {
      return this.ngControl.valid;
    } else {
      return true;
    }
  }

  get disabled() {
    return this.fg.disabled;
  }

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private injector: Injector
  ) { }

  ngOnInit() {
    this.ngControl = this.injector.get(NgControl);

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

        value.orig_amount = +formValue.amount;
        value.orig_currency = formValue.currency;
        if (value.orig_currency === this.value.orig_currency) {
          value.amount = value.orig_amount * (this.value.amount / this.value.orig_amount);
        } else {
          value.amount = +formValue.homeCurrencyAmount;
        }
      } else {
        value.currency = this.homeCurrency;
        value.amount = formValue.amount && +formValue.amount;
      }

      if (!this.checkIfSameValue(value, this.innerValue)) {
        this.value = value;
      }
    });
  }

  checkIfSameValue(amount1, amount2) {
    return amount1 && amount2 && amount1.amount === amount2.amount &&
      amount1.currency === amount2.currency &&
      amount1.orig_amount === amount2.orig_amount &&
      amount1.orig_currency === amount2.orig_currency;
  }

  convertInnerValueToFormValue(innerVal) {
    if (innerVal && innerVal.orig_currency && innerVal.orig_currency !== this.homeCurrency) {
      return {
        amount: innerVal.orig_amount,
        currency: innerVal.orig_currency,
        homeCurrencyAmount: innerVal.amount
      };
    } else if (innerVal) {
      return {
        amount: innerVal.amount,
        currency: innerVal.currency,
        homeCurrencyAmount: null
      };
    } else {
      return {
        amount: null,
        currency: this.homeCurrency,
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
      this.fg.setValue(
        this.convertInnerValueToFormValue(
          this.innerValue));
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
    if (!this.fg.controls.currency.disabled) {
      const currencyModal = await this.modalController.create({
        component: FyCurrencyChooseCurrencyComponent,
        componentProps: {
          currentSelection: this.fg.controls.currency.value
        },
        mode: 'ios',
        presentingElement: await this.modalController.getTop(),
        ...this.modalProperties.getModalDefaultProperties()
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
              newCurrency: shortCode,
              txnDt: this.txnDt
            },
            mode: 'ios',
            presentingElement: await this.modalController.getTop(),
            ...this.modalProperties.getModalDefaultProperties()
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

  setDisabledState(isDisabled: boolean) {
    if (isDisabled) {
      this.fg.disable();
    } else {
      this.fg.enable();
    }
  }
}
