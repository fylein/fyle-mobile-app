import { Component, OnInit, forwardRef, Input, inject, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { noop } from 'rxjs';
import { ModalController } from '@ionic/angular/standalone';
import { isEqual } from 'lodash';
import { FyMultiselectModalComponent } from './fy-multiselect-modal/fy-multiselect-modal.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { TranslocoService } from '@jsverse/transloco';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

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
  imports: [NgClass, FormsModule, MatIcon],
})
export class FyMultiselectComponent implements OnInit, ControlValueAccessor {
  private modalController = inject(ModalController);

  private modalProperties = inject(ModalPropertiesService);

  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() options: { label: string; value: unknown }[] = [];

  readonly disabled = input(false);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() label = '';

  readonly mandatory = input(false);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() selectModalHeader: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() subheader: string;

  readonly placeholder = input<string>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() touchedInParent: boolean;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() validInParent: boolean;

  displayValue: string;

  innerValue: unknown[] = [];

  onTouchedCallback: () => void = noop;

  onChangeCallback: (_: unknown[]) => void = noop;

  get valid(): boolean {
    if (this.touchedInParent) {
      return this.validInParent;
    } else {
      return true;
    }
  }

  get computedPlaceholder(): string {
    return this.placeholder() || `${this.translocoService.translate('fyMultiselect.select')} ${this.label}`;
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

    // Blur active element to prevent auto-focus after modal closes
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
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
