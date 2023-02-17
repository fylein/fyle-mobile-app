import { Component, OnInit, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { noop } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { DependentFieldModalComponent } from './dependent-field-modal/dependent-field-modal.component';

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

  @Input() fieldId: number;

  @Input() parentFieldId: number;

  @Input() parentFieldValue: string;

  displayValue: string;

  private onTouchedCallback: () => void = noop;

  private onChangeCallback: (_: any) => void = noop;

  constructor(private modalController: ModalController, private modalProperties: ModalPropertiesService) {}

  ngOnInit() {}

  async openModal() {
    const selectionModal = await this.modalController.create({
      component: DependentFieldModalComponent,
      componentProps: {
        currentSelection: this.displayValue,
        showNullOption: this.showNullOption,
        enableSearch: this.enableSearch,
        selectModalHeader: this.selectModalHeader || 'Select Item',
        placeholder: this.placeholder,
        label: this.label,
        fieldId: this.fieldId,
        parentFieldId: this.parentFieldId,
        parentFieldValue: this.parentFieldValue,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await selectionModal.present();

    const { data } = await selectionModal.onWillDismiss();

    if (data) {
      this.displayValue = data;
      this.onChangeCallback(this.displayValue);
    }
  }

  onBlur() {
    this.onTouchedCallback();
  }

  writeValue(val: string): void {
    this.displayValue = val;
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
}
