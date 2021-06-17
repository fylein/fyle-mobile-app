import { Component, OnInit, forwardRef, Input, OnDestroy, Injector } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, FormControl, NgControl } from '@angular/forms';
import { noop } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { FySelectVendorModalComponent } from './fy-select-modal/fy-select-vendor-modal.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';

@Component({
  selector: 'app-fy-select-vendor',
  templateUrl: './fy-select-vendor.component.html',
  styleUrls: ['./fy-select-vendor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FySelectVendorComponent),
      multi: true
    }
  ]
})
export class FySelectVendorComponent implements OnInit, OnDestroy {
  private ngControl: NgControl;
  @Input() options: any[];
  @Input() label = '';
  @Input() mandatory = false;

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
    private modalProperties: ModalPropertiesService,
    private injector: Injector
  ) { }

  ngOnInit() {
    this.ngControl = this.injector.get(NgControl);
  }

  ngOnDestroy() {
  }

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      const selectedOption = this.innerValue;
      if (selectedOption) {
        this.displayValue = selectedOption.display_name;
      } else {
        this.displayValue = '';
      }

      this.onChangeCallback(v);
    }
  }

  async openModal() {
    const currencyModal = await this.modalController.create({
      component: FySelectVendorModalComponent,
      componentProps: {
        currentSelection: this.value
      },
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties()
    });

    await currencyModal.present();

    const { data } = await currencyModal.onWillDismiss();
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
        this.displayValue = selectedOption.display_name;
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
