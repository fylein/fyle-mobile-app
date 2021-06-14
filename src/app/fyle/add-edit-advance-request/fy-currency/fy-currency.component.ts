import { Component, OnInit, forwardRef, Input, Injector } from '@angular/core';

import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormBuilder, FormGroup, NgControl } from '@angular/forms';
import { noop } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { FyCurrencyChooseCurrencyComponent } from './fy-currency-choose-currency/fy-currency-choose-currency.component';
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
    currency: string
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
    });

    this.fg.valueChanges.subscribe(formValue => {
      const value = {
        amount: null,
        currency: null
      };

      if (formValue.amount !== null) {
        value.amount = +formValue.amount;
      }
      value.currency = formValue.currency;

      if (!this.checkIfSameValue(value, this.innerValue)) {
        this.value = value;
      }
    });
  }

  checkIfSameValue(amount1, amount2) {
    return amount1 && amount2 && amount1.amount === amount2.amount &&
      amount1.currency === amount2.currency;
  }

  convertInnerValueToFormValue(innerVal) {
    if (innerVal) {
      return {
        amount: innerVal.amount,
        currency: innerVal.currency
      };
    } else {
      return {
        amount: null,
        currency: this.homeCurrency
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
      this.fg.controls.currency.setValue(shortCode);
    }
  }
}
