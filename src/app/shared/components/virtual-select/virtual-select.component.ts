import { Component, OnInit, forwardRef, Input, TemplateRef, Injector, inject, input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NgControl } from '@angular/forms';
import { noop } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { VirtualSelectModalComponent } from './virtual-select-modal/virtual-select-modal.component';
import { isEqual } from 'lodash';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { SelectionReturnType, VirtualSelectOptions } from './virtual-select.model';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-virtual-select',
  templateUrl: './virtual-select.component.html',
  styleUrls: ['./virtual-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VirtualSelectComponent),
      multi: true,
    },
  ],
  standalone: false,
})
export class VirtualSelectComponent implements ControlValueAccessor, OnInit {
  private modalController = inject(ModalController);

  private injector = inject(Injector);

  private modalProperties = inject(ModalPropertiesService);

  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() options: { label: string; value: VirtualSelectOptions }[] = [];

  readonly disabled = input(false);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() label = '';

  readonly mandatory = input(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly selectionElement = input<TemplateRef<any>>(undefined);

  readonly nullOption = input(true);

  readonly cacheName = input('');

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() subheader: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() enableSearch = true;

  readonly selectModalHeader = input('');

  readonly placeholder = input<string>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() defaultLabelProp: string;

  readonly recentlyUsed = input<
    {
      label: string;
      value: VirtualSelectOptions;
      selected?: boolean;
    }[]
  >(undefined);

  displayValue: string;

  private innerValue: VirtualSelectOptions;

  private ngControl: NgControl;

  private onTouchedCallback: () => void = noop;

  private onChangeCallback: (_: VirtualSelectOptions) => void = noop;

  get valid(): boolean {
    if (this.ngControl.touched) {
      return this.ngControl.valid;
    } else {
      return true;
    }
  }

  get value(): VirtualSelectOptions {
    return this.innerValue;
  }

  set value(v: VirtualSelectOptions) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      if (this.options) {
        const selectedOption = this.options.find((option) => isEqual(option.value, this.innerValue));
        if (selectedOption && selectedOption.label) {
          this.displayValue = selectedOption.label;
        } else if (typeof this.innerValue === 'string') {
          this.displayValue = this.innerValue;
        } else if (this.innerValue && this.defaultLabelProp) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          this.displayValue = this.innerValue[this.defaultLabelProp];
        } else {
          this.displayValue = '';
        }
      }
      this.onChangeCallback(v);
    }
  }

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl);
    this.subheader = this.subheader || this.translocoService.translate('virtualSelect.subheader');
  }

  async openModal(): Promise<void> {
    const selectModalHeader = this.translocoService.translate('virtualSelect.selectItemHeader');
    const cssClass =
      this.label === this.translocoService.translate('virtualSelect.paymentModeLabel')
        ? 'payment-mode-modal'
        : 'virtual-modal';

    const selectionModal = await this.modalController.create({
      component: VirtualSelectModalComponent,
      componentProps: {
        options: this.options,
        currentSelection: this.value,
        selectionElement: this.selectionElement(),
        nullOption: this.nullOption(),
        cacheName: this.cacheName(),
        subheader: this.subheader,
        enableSearch: this.enableSearch,
        selectModalHeader: this.selectModalHeader() || selectModalHeader,
        placeholder: this.placeholder(),
        defaultLabelProp: this.defaultLabelProp,
        recentlyUsed: this.recentlyUsed(),
        label: this.label,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(cssClass),
    });

    await selectionModal.present();

    const { data }: { data?: SelectionReturnType } = await selectionModal.onWillDismiss();
    if (data) {
      this.value = data.value;
    }
  }

  onBlur(): void {
    this.onTouchedCallback();
  }

  writeValue(value: VirtualSelectOptions): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
      if (this.options) {
        const selectedOption = this.options.find((option) => isEqual(option.value, this.innerValue));
        if (selectedOption && selectedOption.label) {
          this.displayValue = selectedOption.label;
        } else if (typeof this.innerValue === 'string') {
          this.displayValue = this.innerValue;
        } else if (this.innerValue && this.defaultLabelProp) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          this.displayValue = this.innerValue[this.defaultLabelProp];
        } else {
          this.displayValue = '';
        }
        this.handleDisplayNameException();
      }
    }
  }

  //Hack for display_name values added to resolve BR related to merchant name not in list of options, BR: https://app.clickup.com/t/85ztztwg6;
  handleDisplayNameException(): void {
    if (this.innerValue && this.innerValue.hasOwnProperty('display_name') && !this.displayValue) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/dot-notation
      const displayName = this.innerValue['display_name'];
      if (displayName) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.displayValue = displayName;
      }
    }
  }

  registerOnChange(fn: () => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }
}
