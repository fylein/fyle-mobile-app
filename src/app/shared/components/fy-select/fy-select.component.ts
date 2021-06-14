import { Component, OnInit, forwardRef, Input, ContentChild, TemplateRef, ElementRef, OnDestroy, Injector, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NG_VALIDATORS, FormControl, NgControl } from '@angular/forms';
import { noop } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { FySelectModalComponent } from './fy-select-modal/fy-select-modal.component';
import { isEqual } from 'lodash';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';


@Component({
  selector: 'app-fy-select',
  templateUrl: './fy-select.component.html',
  styleUrls: ['./fy-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FySelectComponent),
      multi: true
    }
  ]
})
export class FySelectComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private ngControl: NgControl;
  @Input() options: { label: string, value: any }[] = [];
  @Input() disabled = false;
  @Input() label = '';
  @Input() mandatory = false;
  @Input() selectionElement: TemplateRef<any>;
  @Input() nullOption = true;
  @Input() cacheName = '';
  @Input() customInput = false;
  @Input() subheader = 'All';
  @Input() enableSearch = true;
  @Input() selectModalHeader = '';
  @Input() showSaveButton = false;
  @Input() placeholder = '';
  @Input() defaultLabelProp;
  @Input() recentlyUsed: { label: string, value: any, selected?: boolean }[];

  private innerValue;
  displayValue;

  get valid() {
    if (this.ngControl.touched) {
      return this.ngControl.valid;
    } else {
      return true;
    }
  }

  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;

  constructor(
    private modalController: ModalController,
    private injector: Injector,
    private modalProperties: ModalPropertiesService,
    private recentLocalStorageItemsService: RecentLocalStorageItemsService
  ) { }

  ngOnInit() {
    this.ngControl = this.injector.get(NgControl);
  }

  ngOnDestroy(): void {
  }

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      if (this.options) {
        const selectedOption = this.options.find(option => isEqual(option.value, this.innerValue));
        if (selectedOption && selectedOption.label) {
          this.displayValue = selectedOption.label;
        } else if (typeof this.innerValue === 'string') {
          this.displayValue = this.innerValue;
        } else if (this.innerValue && this.defaultLabelProp) {
          this.displayValue = this.innerValue[this.defaultLabelProp];
        }  else {
          this.displayValue = '';
        }
      }

      this.onChangeCallback(v);
    }
  }

  async openModal() {
    const selectionModal = await this.modalController.create({
      component: FySelectModalComponent,
      componentProps: {
        options: this.options,
        currentSelection: this.value,
        selectionElement: this.selectionElement,
        nullOption: this.nullOption,
        cacheName: this.cacheName,
        customInput: this.customInput,
        subheader: this.subheader,
        enableSearch: this.enableSearch,
        selectModalHeader: this.selectModalHeader || 'Select Item',
        placeholder: this.placeholder,
        showSaveButton: this.showSaveButton,
        defaultLabelProp: this.defaultLabelProp,
        recentlyUsed: this.recentlyUsed
      },
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties()
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
        const selectedOption = this.options.find(option => isEqual(option.value, this.innerValue));

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

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
}
