import { Component, OnInit, forwardRef, Input, Injector, SimpleChanges, OnChanges } from '@angular/core';

import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormBuilder, FormGroup, NgControl } from '@angular/forms';
import { noop, of, from } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { FyCurrencyChooseCurrencyComponent } from './fy-currency-choose-currency/fy-currency-choose-currency.component';
import { FyCurrencyExchangeRateComponent } from './fy-currency-exchange-rate/fy-currency-exchange-rate.component';
import { isEqual } from 'lodash';
import { concatMap, map, switchMap } from 'rxjs/operators';
import { CurrencyService } from '../../../core/services/currency.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';

@Component({
  selector: 'app-fy-currency',
  templateUrl: './fy-currency.component.html',
  styleUrls: ['./fy-currency.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FyCurrencyComponent),
      multi: true,
    },
  ],
})
export class FyCurrencyComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() txnDt: Date;

  @Input() homeCurrency: string;

  @Input() recentlyUsed: { label: string; value: string }[];

  @Input() expanded: boolean;

  exchangeRate = 1;

  fg: FormGroup;

  private ngControl: NgControl;

  private innerValue: {
    amount: number;
    currency: string;
    orig_amount: number;
    orig_currency: string;
  };

  private onTouchedCallback: () => void = noop;

  private onChangeCallback: (_: any) => void = noop;

  get valid() {
    if (this.ngControl.touched) {
      return this.ngControl.valid;
    } else {
      return true;
    }
  }

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private currencyService: CurrencyService,
    private modalProperties: ModalPropertiesService,
    private injector: Injector
  ) {}

  ngOnInit() {
    this.ngControl = this.injector.get(NgControl);

    this.fg = this.fb.group({
      currency: [], // currency which is currently shown
      amount: [], // amount which is currently shown
      homeCurrencyAmount: [], // Amount converted to home currency
    });

    this.fg.valueChanges
      .pipe(
        switchMap((formValue) => {
          if (!formValue.amount && !formValue.homeCurrencyAmount && formValue.currency !== this.homeCurrency) {
            return this.currencyService
              .getExchangeRate(formValue.currency, this.homeCurrency, this.txnDt || new Date())
              .pipe(map((exchangeRate) => ({ formValue, exchangeRate })));
          } else {
            return of({ formValue, exchangeRate: null });
          }
        })
      )
      .subscribe(({ formValue, exchangeRate }) => {
        if (exchangeRate) {
          this.exchangeRate = exchangeRate;
        }

        const value = {
          amount: null,
          currency: null,
          orig_amount: null,
          orig_currency: null,
        };

        if (formValue.amount === null) {
          if (formValue.currency !== this.homeCurrency) {
            value.currency = this.homeCurrency;
            value.orig_currency = formValue.currency;
          } else {
            value.currency = this.homeCurrency;
          }
        } else {
          if (formValue.currency !== this.homeCurrency) {
            if (this.value.amount && this.value.orig_amount) {
              this.exchangeRate = this.value.amount / this.value.orig_amount;
            }
            value.currency = this.homeCurrency;
            value.orig_amount = +formValue.amount;
            value.orig_currency = formValue.currency;
            value.amount = +formValue.homeCurrencyAmount;
            if (value.orig_currency === this.value.orig_currency) {
              value.amount = value.orig_amount * this.exchangeRate;
            } else {
              value.amount = +formValue.homeCurrencyAmount;
            }
          } else {
            this.exchangeRate = 1;
            value.currency = this.homeCurrency;
            value.amount = formValue.amount && +formValue.amount;
          }
        }

        if (!isEqual(value, this.innerValue)) {
          this.value = value;
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      this.fg &&
      changes.txnDt &&
      changes.txnDt.previousValue &&
      changes.txnDt.currentValue &&
      !isEqual(changes.txnDt.previousValue, changes.txnDt.currentValue)
    ) {
      from(this.currencyService.getExchangeRate(this.fg.value.currency, this.homeCurrency, this.txnDt || new Date()))
        .pipe()
        .subscribe((newExchangeRate) => {
          this.exchangeRate = newExchangeRate;
          if (this.innerValue.orig_amount && this.innerValue.orig_currency !== this.homeCurrency) {
            this.innerValue.amount = this.innerValue.orig_amount * this.exchangeRate;
            this.fg.value.amount = this.innerValue.orig_amount;
            this.fg.value.homeCurrencyAmount = this.innerValue.amount;
          }
        });
    }
  }

  convertInnerValueToFormValue(innerVal) {
    if (innerVal && innerVal.orig_currency && innerVal.orig_currency !== this.homeCurrency) {
      return {
        amount: innerVal.orig_amount,
        currency: innerVal.orig_currency,
        homeCurrencyAmount: innerVal.amount,
      };
    } else if (innerVal) {
      return {
        amount: innerVal.amount,
        currency: innerVal.currency,
        homeCurrencyAmount: null,
      };
    } else {
      return {
        amount: null,
        currency: this.homeCurrency,
        homeCurrencyAmount: null,
      };
    }
  }

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (this.fg) {
      if (v !== this.innerValue) {
        this.innerValue = v;
        this.fg.patchValue(this.convertInnerValueToFormValue(this.innerValue));
        this.onChangeCallback(v);
      }
    }
  }

  onBlur() {
    this.onTouchedCallback();
  }

  writeValue(value: any) {
    if (this.fg) {
      if (value !== this.innerValue) {
        this.innerValue = value;
        this.fg.patchValue(this.convertInnerValueToFormValue(this.innerValue));
      }
    }
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  async setExchangeRate(shortCode?) {
    const exchangeRateModal = await this.modalController.create({
      component: FyCurrencyExchangeRateComponent,
      componentProps: {
        amount: this.fg.controls.amount.value,
        currentCurrency: this.homeCurrency,
        newCurrency: shortCode || this.fg.controls.currency.value,
        txnDt: this.txnDt,
        exchangeRate:
          this.value.orig_currency === (shortCode || this.fg.controls.currency.value)
            ? this.fg.value.homeCurrencyAmount / this.fg.value.amount
            : null,
      },
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      cssClass: 'fy-modal stack-modal',
      showBackdrop: true,
      swipeToClose: true,
      backdropDismiss: true,
      animated: true,
    });
    await exchangeRateModal.present();
    const { data } = await exchangeRateModal.onWillDismiss();
    if (data) {
      if (shortCode) {
        this.fg.patchValue({
          currency: shortCode,
          amount: data.amount,
          homeCurrencyAmount: data.homeCurrencyAmount,
        });
      } else {
        this.fg.patchValue(
          {
            currency: this.fg.controls.currency.value,
            amount: data.amount,
            homeCurrencyAmount: data.homeCurrencyAmount,
          },
          {
            emitEvent: false,
          }
        );

        this.value = {
          currency: this.homeCurrency,
          orig_amount: +data.amount,
          orig_currency: this.fg.controls.currency.value,
          amount: +data.homeCurrencyAmount,
        };
      }
    }
  }

  async openCurrencyModal() {
    const currencyModal = await this.modalController.create({
      component: FyCurrencyChooseCurrencyComponent,
      componentProps: {
        currentSelection: this.fg.controls.currency.value,
        recentlyUsed: this.recentlyUsed,
      },
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await currencyModal.present();

    const { data } = await currencyModal.onWillDismiss();
    if (data) {
      const shortCode = data.currency.shortCode;
      if (shortCode === this.homeCurrency) {
        this.fg.controls.currency.patchValue(shortCode);
      } else {
        if (shortCode !== this.value.orig_currency) {
          await this.setExchangeRate(shortCode);
        } else {
          await this.setExchangeRate();
        }
      }
    }
  }
}
