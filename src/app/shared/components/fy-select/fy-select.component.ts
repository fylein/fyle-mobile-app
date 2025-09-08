import { Component, forwardRef, Input, TemplateRef, inject, input, output } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { noop } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { FySelectModalComponent } from './fy-select-modal/fy-select-modal.component';
import { isEqual } from 'lodash';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { Value } from './fy-select.interface';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-fy-select',
  templateUrl: './fy-select.component.html',
  styleUrls: ['./fy-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FySelectComponent),
      multi: true,
    },
  ],
  standalone: false,
})
export class FySelectComponent implements ControlValueAccessor {
  private modalController = inject(ModalController);

  private modalProperties = inject(ModalPropertiesService);

  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() options: { label: string; value: any }[] = [];

  readonly disabled = input(false);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() label = '';

  readonly mandatory = input(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly selectionElement = input<TemplateRef<any>>(undefined);

  readonly nullOption = input(true);

  readonly cacheName = input('');

  readonly customInput = input(false);

  readonly enableSearch = input(true);

  readonly selectModalHeader = input('');

  readonly showSaveButton = input(false);

  readonly placeholder = input<string>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() defaultLabelProp?: string;

  readonly recentlyUsed = input<
    {
      label: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: any;
      selected?: boolean;
    }[]
  >(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() touchedInParent: boolean;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() validInParent: boolean;

  readonly isCustomSelect = input<boolean>(undefined);

  readonly valueChange = output<string | Value>();

  displayValue: string | number | boolean;

  innerValue: string | Value;

  onTouchedCallback: () => void = noop;

  onChangeCallback: (_: any) => void = noop;

  get valid(): boolean {
    if (this.touchedInParent) {
      return this.validInParent;
    } else {
      return true;
    }
  }

  get value(): string | Value {
    return this.innerValue;
  }

  set value(v: string | Value) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      if (this.options) {
        const selectedOption = this.options.find((option) => isEqual(option.value, this.innerValue));
        if (selectedOption && selectedOption.label) {
          this.displayValue = selectedOption.label;
        } else if (typeof this.innerValue === 'string') {
          this.displayValue = this.innerValue;
        } else if (this.innerValue && this.defaultLabelProp) {
          this.displayValue = this.innerValue[this.defaultLabelProp];
        } else {
          this.displayValue = '';
        }
      }

      this.onChangeCallback(v);
      this.valueChange.emit(v);
    }
  }

  async openModal(): Promise<void> {
    let cssClass: string;

    if (this.label === 'Payment mode') {
      cssClass = 'payment-mode-modal';
    } else if (this.label === 'Commute Deduction') {
      cssClass = 'add-location-modal';
    } else {
      cssClass = 'fy-modal';
    }

    const selectionModal = await this.modalController.create({
      component: FySelectModalComponent,
      componentProps: {
        options: this.options,
        currentSelection: this.value,
        selectionElement: this.selectionElement(),
        nullOption: this.nullOption(),
        cacheName: this.cacheName(),
        customInput: this.customInput(),
        enableSearch: this.enableSearch(),
        selectModalHeader: this.selectModalHeader() || this.translocoService.translate<string>('fySelect.selectItem'),
        placeholder: this.placeholder(),
        showSaveButton: this.showSaveButton(),
        defaultLabelProp: this.defaultLabelProp,
        recentlyUsed: this.recentlyUsed(),
        isCustomSelect: this.isCustomSelect(),
        label: this.label,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(cssClass),
    });

    await selectionModal.present();

    const { data } = (await selectionModal.onWillDismiss()) as { data: { value: string } };

    if (data) {
      this.value = data.value;
    }
  }

  onBlur(): void {
    this.onTouchedCallback();
  }

  writeValue(value: string | Value): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
      if (this.options) {
        const selectedOption = this.options.find((option) => isEqual(option.value, this.innerValue));

        if (selectedOption && selectedOption.label) {
          this.displayValue = selectedOption.label;
        } else if (typeof this.innerValue === 'string') {
          this.displayValue = this.innerValue;
        } else if (this.innerValue && this.defaultLabelProp) {
          this.displayValue = this.innerValue[this.defaultLabelProp];
        } else {
          this.displayValue = '';
        }
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }
}
