import { Component, OnInit, forwardRef, Input, Injector } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NgControl } from '@angular/forms';
import { noop } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { FySelectModalComponent } from '../fy-select/fy-select-modal/fy-select-modal.component';
import { isEqual } from 'lodash';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';

@Component({
  selector: 'app-dependent-field',
  templateUrl: './dependent-field.component.html',
  styleUrls: ['./dependent-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DependentFieldComponent),
      multi: true,
    },
  ],
})
export class DependentFieldComponent implements OnInit, ControlValueAccessor {
  @Input() label = '';

  @Input() options: { label: string; value: any }[] = [];

  @Input() placeholder: string;

  @Input() mandatory = false;

  @Input() disabled = false;

  @Input() showNullOption = true;

  @Input() enableSearch = true;

  @Input() selectModalHeader = '';

  displayValue: string;

  private innerValue: string;

  private ngControl: NgControl;

  private onTouchedCallback: () => void = noop;

  private onChangeCallback: (_: any) => void = noop;

  constructor(
    private modalController: ModalController,
    private injector: Injector,
    private modalProperties: ModalPropertiesService
  ) {}

  get valid() {
    if (this.ngControl.touched) {
      return this.ngControl.valid;
    } else {
      return true;
    }
  }

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      if (this.options) {
        const selectedOption = this.options.find((option) => isEqual(option.value, this.innerValue));
        if (selectedOption && selectedOption.label) {
          this.displayValue = selectedOption.label;
        } else if (typeof this.innerValue === 'string') {
          this.displayValue = this.innerValue;
        } else {
          this.displayValue = '';
        }
      }

      this.onChangeCallback(v);
    }
  }

  ngOnInit() {
    this.ngControl = this.injector.get(NgControl);
  }

  async openModal() {
    const cssClass = this.label === 'Payment Mode' ? 'payment-mode-modal' : 'fy-modal';

    const selectionModal = await this.modalController.create({
      component: FySelectModalComponent,
      componentProps: {
        options: this.options,
        currentSelection: this.value,
        showNullOption: this.showNullOption,
        enableSearch: this.enableSearch,
        selectModalHeader: this.selectModalHeader || 'Select Item',
        placeholder: this.placeholder,
        label: this.label,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(cssClass),
    });

    await selectionModal.present();

    const { data } = await selectionModal.onWillDismiss();

    if (data) {
      this.value = data.value;
    }
  }

  onBlur() {
    this.onTouchedCallback();
  }

  writeValue(value: any): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
      if (this.options) {
        const selectedOption = this.options.find((option) => isEqual(option.value, this.innerValue));

        if (selectedOption && selectedOption.label) {
          this.displayValue = selectedOption.label;
        } else if (typeof this.innerValue === 'string') {
          this.displayValue = this.innerValue;
        } else {
          this.displayValue = '';
        }
      }
    }
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
}
