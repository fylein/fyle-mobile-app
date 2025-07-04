import { Component, OnInit, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { isEqual } from 'lodash';
import { FyMultiselectModalComponent } from './fy-multiselect-modal/fy-multiselect-modal.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-fy-multiselect',
  templateUrl: './fy-multiselect.component.html',
  styleUrls: ['./fy-multiselect.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FyMultiselectComponent),
      multi: true,
    },
  ],
})
export class FyMultiselectComponent implements OnInit, ControlValueAccessor {
  @Input() options: { label: string; value: unknown }[] = [];

  @Input() disabled = false;

  @Input() label = '';

  @Input() mandatory = false;

  @Input() selectModalHeader: string;

  @Input() subheader: string;

  @Input() placeholder: string;

  @Input() touchedInParent: boolean;

  @Input() validInParent: boolean;

  displayValue: string;

  innerValue: unknown[] = [];

  onTouchedCallback: () => void = noop;

  onChangeCallback: (_: unknown[]) => void = noop;

  constructor(
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private translocoService: TranslocoService
  ) {}

  get valid(): boolean {
    if (this.touchedInParent) {
      return this.validInParent;
    } else {
      return true;
    }
  }

  get computedPlaceholder(): string {
    return this.placeholder || `${this.translocoService.translate('fyMultiselect.select')} ${this.label}`;
  }

  get value(): unknown[] {
    return this.innerValue;
  }

  set value(v: unknown[]) {
    if (!isEqual(v, this.innerValue)) {
      this.innerValue = v;
      if (this.innerValue && this.innerValue.length > 0) {
        this.displayValue = this.innerValue
          .map((selectedValue) => this.options.find((option) => isEqual(option.value, selectedValue)))
          .map((option) => option?.label || '')
          .join(',');
      } else {
        this.displayValue = '';
      }

      this.onChangeCallback(v);
    }
  }

  ngOnInit(): void {
    this.selectModalHeader = this.selectModalHeader ?? this.translocoService.translate('fyMultiselect.selectItems');
    this.subheader = this.subheader ?? this.translocoService.translate('fyMultiselect.allItems');
  }

  async openModal(): Promise<void> {
    const selectionModal = await this.modalController.create({
      component: FyMultiselectModalComponent,
      componentProps: {
        options: this.options,
        currentSelections: this.value,
        selectModalHeader: this.selectModalHeader,
        subheader: this.subheader,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await selectionModal.present();

    const result = await selectionModal.onWillDismiss();
    const data = result.data as { selected?: { value: unknown }[] } | undefined;

    if (data?.selected) {
      this.value = data.selected.map((selection) => selection.value);
    }
  }

  onBlur(): void {
    this.onTouchedCallback();
  }

  writeValue(value: unknown[]): void {
    if (!isEqual(value, this.innerValue)) {
      this.innerValue = value;
      if (this.innerValue && this.innerValue.length > 0) {
        this.displayValue = this.innerValue
          .map((selectedValue) => this.options.find((option) => isEqual(option.value, selectedValue)))
          .map((option) => option?.label || '')
          .join(',');
      } else {
        this.displayValue = '';
      }
    }
  }

  registerOnChange(fn: (value: unknown[]) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }
}
