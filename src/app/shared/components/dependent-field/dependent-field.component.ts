import { Component, OnInit, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
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

  @Input() placeholder: string;

  @Input() mandatory = false;

  @Input() disabled = false;

  @Input() showNullOption = true;

  @Input() enableSearch = true;

  @Input() valid = true;

  @Input() selectModalHeader = '';

  displayValue: string;

  private innerValue;

  private onTouchedCallback: () => void = noop;

  private onChangeCallback: (_: any) => void = noop;

  constructor(private modalController: ModalController, private modalProperties: ModalPropertiesService) {}

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      const selectedOption = this.innerValue;
      if (selectedOption) {
        this.displayValue = selectedOption.name;
      } else {
        this.displayValue = '';
      }

      this.onChangeCallback(v);
    }
  }

  ngOnInit() {}

  async openModal() {
    const selectionModal = await this.modalController.create({
      component: FySelectModalComponent,
      componentProps: {
        currentSelection: this.value,
        showNullOption: this.showNullOption,
        enableSearch: this.enableSearch,
        selectModalHeader: this.selectModalHeader || 'Select Item',
        placeholder: this.placeholder,
        label: this.label,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
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
      const selectedOption = this.innerValue;
      if (selectedOption) {
        this.displayValue = selectedOption.name;
      } else {
        this.displayValue = '';
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
