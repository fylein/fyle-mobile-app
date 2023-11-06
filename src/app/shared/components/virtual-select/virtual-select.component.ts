import { Component, OnInit, forwardRef, Input, TemplateRef, Injector } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NgControl } from '@angular/forms';
import { noop } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { VirtualSelectModalComponent } from './virtual-select-modal/virtual-select-modal.component';
import { isEqual } from 'lodash';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { SelectionReturnType, VirtualSelectOptionValues } from './virtual-select.model';

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
})
export class VirtualSelectComponent implements ControlValueAccessor, OnInit {
  @Input() options: { label: string; value: Partial<VirtualSelectOptionValues> }[] = [];

  @Input() disabled = false;

  @Input() label = '';

  @Input() mandatory = false;

  @Input() selectionElement: TemplateRef<unknown>;

  @Input() nullOption = true;

  @Input() cacheName = '';

  @Input() subheader = 'All';

  @Input() enableSearch = true;

  @Input() selectModalHeader = '';

  @Input() showSaveButton = false;

  @Input() placeholder: string;

  @Input() defaultLabelProp: string;

  @Input() recentlyUsed: { label: string; value: Partial<VirtualSelectOptionValues>; selected?: boolean }[];

  displayValue: string;

  private innerValue: Partial<VirtualSelectOptionValues>;

  private ngControl: NgControl;

  private onTouchedCallback: () => void = noop;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private onChangeCallback: (_: any) => void = noop;

  constructor(
    private modalController: ModalController,
    private injector: Injector,
    private modalProperties: ModalPropertiesService
  ) {}

  get valid(): boolean {
    if (this.ngControl.touched) {
      return this.ngControl.valid;
    } else {
      return true;
    }
  }

  get value(): Partial<VirtualSelectOptionValues> {
    return this.innerValue;
  }

  set value(v: Partial<VirtualSelectOptionValues>) {
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
  }

  async openModal(): Promise<void> {
    const cssClass = this.label === 'Payment Mode' ? 'payment-mode-modal' : 'virtual-modal';

    const selectionModal = await this.modalController.create({
      component: VirtualSelectModalComponent,
      componentProps: {
        options: this.options,
        currentSelection: this.value,
        selectionElement: this.selectionElement,
        nullOption: this.nullOption,
        cacheName: this.cacheName,
        subheader: this.subheader,
        enableSearch: this.enableSearch,
        selectModalHeader: this.selectModalHeader || 'Select Item',
        placeholder: this.placeholder,
        showSaveButton: this.showSaveButton,
        defaultLabelProp: this.defaultLabelProp,
        recentlyUsed: this.recentlyUsed,
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

  writeValue(value: Partial<VirtualSelectOptionValues>): void {
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

        //exception for display_name values added to resolve BR related to merchant name not in list, BR: https://app.clickup.com/t/85ztztwg6;
        if (this.innerValue?.display_name) {
          this.displayValue = value.display_name;
        }
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerOnChange(fn: any): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.onChangeCallback = fn;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerOnTouched(fn: any): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.onTouchedCallback = fn;
  }
}
