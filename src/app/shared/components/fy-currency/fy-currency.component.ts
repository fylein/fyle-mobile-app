import { Component, OnInit, forwardRef, Input, SimpleChanges, OnChanges, inject } from '@angular/core';

import { NG_VALUE_ACCESSOR, ControlValueAccessor, UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { noop, of, from } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { FyCurrencyChooseCurrencyComponent } from './fy-currency-choose-currency/fy-currency-choose-currency.component';
import { FyCurrencyExchangeRateComponent } from './fy-currency-exchange-rate/fy-currency-exchange-rate.component';
import { isEqual } from 'lodash';
import { map, switchMap } from 'rxjs/operators';
import { CurrencyService } from '../../../core/services/currency.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { ParsedResponse } from 'src/app/core/models/parsed_response.model';
import { CurrencyObj } from 'src/app/core/models/currency-obj.model';
import { CurrencyAmountFormValues } from 'src/app/core/models/currency-amount-form-values.model';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { NgClass, DecimalPipe, CurrencyPipe } from '@angular/common';
import { FyNumberComponent } from '../fy-number/fy-number.component';
import { FyCurrencyPipe } from '../../pipes/fy-currency.pipe';

@Component({
    selector: 'app-currency',
    templateUrl: './fy-currency.component.html',
    styleUrls: ['./fy-currency.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FyCurrencyComponent),
            multi: true,
        },
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatIcon,
        NgClass,
        FyNumberComponent,
        DecimalPipe,
        CurrencyPipe,
        TranslocoPipe,
        FyCurrencyPipe,
    ],
})
export class FyCurrencyComponent implements ControlValueAccessor, OnInit, OnChanges {
  private fb = inject(UntypedFormBuilder);

  private modalController = inject(ModalController);

  private currencyService = inject(CurrencyService);

  private modalProperties = inject(ModalPropertiesService);

  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() txnDt: Date;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() homeCurrency: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() recentlyUsed: { label: string; value: string }[];

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() expanded: boolean;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() touchedInParent = false;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() validInParent = true;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() autoCodedData: ParsedResponse;

  currencyAutoCodeMessage = '';

  amountAutoCodeMessage = '';

  exchangeRate = 1;

  fg: UntypedFormGroup;

  innerValue: CurrencyObj;

  onTouchedCallback: () => void = noop;

  onChangeCallback: (_: CurrencyObj) => void = noop;

  get valid(): boolean {
    if (this.touchedInParent) {
      return this.validInParent;
    } else {
      return true;
    }
  }

  get value(): CurrencyObj {
    return this.innerValue;
  }

  set value(v: CurrencyObj) {
    if (this.fg) {
      if (v !== this.innerValue) {
        this.innerValue = v;
        this.fg.patchValue(this.convertInnerValueToFormValue(this.innerValue));
        this.onChangeCallback(v);
      }
    }
  }

  ngOnInit(): void {
    this.fg = this.fb.group({
      currency: [], // currency which is currently shown
      amount: [], // amount which is currently shown
      homeCurrencyAmount: [], // Amount converted to home currency
    });

    this.fg.valueChanges
      .pipe(
        switchMap((formValue: CurrencyAmountFormValues) => {
          if (!formValue.amount && !formValue.homeCurrencyAmount && formValue.currency !== this.homeCurrency) {
            return this.currencyService
              .getExchangeRate(formValue.currency, this.homeCurrency, this.txnDt || new Date())
              .pipe(map((exchangeRate) => ({ formValue, exchangeRate })));
          } else {
            return of({ formValue, exchangeRate: null });
          }
        }),
      )
      .subscribe(({ formValue, exchangeRate }: { formValue: CurrencyAmountFormValues; exchangeRate: number }) => {
        if (exchangeRate) {
          this.exchangeRate = exchangeRate;
        }

        const value: CurrencyObj = {
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
        this.showAutoCodeMessage();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.fg &&
      changes.txnDt &&
      changes.txnDt.previousValue &&
      changes.txnDt.currentValue &&
      !isEqual(changes.txnDt.previousValue, changes.txnDt.currentValue)
    ) {
      from(
        this.currencyService.getExchangeRate(
          (this.fg.value as CurrencyAmountFormValues).currency,
          this.homeCurrency,
          this.txnDt || new Date(),
        ),
      )
        .pipe()
        .subscribe((newExchangeRate) => {
          this.exchangeRate = newExchangeRate;
          if (this.innerValue.orig_amount && this.innerValue.orig_currency !== this.homeCurrency) {
            this.innerValue.amount = this.innerValue.orig_amount * this.exchangeRate;
            this.fg.controls.amount.setValue(this.innerValue.orig_amount);
            this.fg.controls.homeCurrencyAmount.setValue(this.innerValue.amount);
          }
        });
    }

    this.showAutoCodeMessage();
  }

  showAutoCodeMessage(): void {
    const { currency, amount } = this.autoCodedData || {};
    const { currency: formCurrency, amount: formAmount } = (this.fg?.value as CurrencyAmountFormValues) || {};

    const isCurrencyAutoCoded = currency && currency === formCurrency;
    const isAmountAutoCoded = amount && amount === formAmount;

    this.currencyAutoCodeMessage = isCurrencyAutoCoded
      ? this.translocoService.translate('fyCurrency.currencyAutoCoded')
      : '';
    this.amountAutoCodeMessage = isAmountAutoCoded ? this.translocoService.translate('fyCurrency.amountAutoCoded') : '';
  }

  convertInnerValueToFormValue(innerVal: CurrencyObj): CurrencyAmountFormValues {
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

  onBlur(): void {
    this.onTouchedCallback();
  }

  writeValue(value: CurrencyObj): void {
    if (this.fg) {
      if (value !== this.innerValue) {
        this.innerValue = value;
        this.fg.patchValue(this.convertInnerValueToFormValue(this.innerValue));
      }
    }
  }

  registerOnChange(fn: (_: CurrencyObj) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  async setExchangeRate(shortCode?: string): Promise<void> {
    let exchangeRate: number | null = null;
    const formValues = this.fg.value as CurrencyAmountFormValues;
    if (formValues.amount !== 0 && this.value.orig_currency === (shortCode || this.fg.controls.currency.value)) {
      exchangeRate = formValues.homeCurrencyAmount / formValues.amount;
    }

    const exchangeRateModal = await this.modalController.create({
      component: FyCurrencyExchangeRateComponent,
      componentProps: {
        amount: this.fg.controls.amount.value as number,
        currentCurrency: this.homeCurrency,
        newCurrency: shortCode || (this.fg.controls.currency.value as string),
        txnDt: this.txnDt,
        exchangeRate,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties('fy-modal stack-modal'),
    });
    await exchangeRateModal.present();
    const { data }: { data?: CurrencyAmountFormValues } = await exchangeRateModal.onWillDismiss();
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
            currency: this.fg.controls.currency.value as string,
            amount: data.amount,
            homeCurrencyAmount: data.homeCurrencyAmount,
          },
          {
            emitEvent: false,
          },
        );

        this.value = {
          currency: this.homeCurrency,
          orig_amount: +data.amount,
          orig_currency: this.fg.controls.currency.value as string,
          amount: +data.homeCurrencyAmount,
        };
      }
    }
  }

  async openCurrencyModal(): Promise<void> {
    const currencyModal = await this.modalController.create({
      component: FyCurrencyChooseCurrencyComponent,
      componentProps: {
        currentSelection: this.fg.controls.currency.value as string,
        recentlyUsed: this.recentlyUsed,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await currencyModal.present();

    const { data }: { data?: { currency: { shortCode: string } } } = await currencyModal.onWillDismiss();
    if (data?.currency?.shortCode) {
      const shortCode: string = data.currency.shortCode;
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
