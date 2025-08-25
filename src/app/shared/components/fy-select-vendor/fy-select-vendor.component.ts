import { Component, OnInit, forwardRef, Input, OnDestroy, inject, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
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
      multi: true,
    },
  ],
  standalone: false,
})
export class FySelectVendorComponent implements OnInit, OnDestroy {
  private modalController = inject(ModalController);

  private modalProperties = inject(ModalPropertiesService);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly options = input<any[]>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() label = '';

  readonly mandatory = input(false);

  readonly placeholder = input<string>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() touchedInParent: boolean;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() validInParent: boolean;

  displayValue;

  innerValue;

  onTouchedCallback: () => void = noop;

  onChangeCallback: (_: any) => void = noop;

  get valid(): boolean {
    if (this.touchedInParent) {
      return this.validInParent;
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
      const selectedOption = this.innerValue;
      if (selectedOption) {
        this.displayValue = selectedOption.display_name;
      } else {
        this.displayValue = '';
      }

      this.onChangeCallback(v);
    }
  }

  ngOnInit() {}

  ngOnDestroy() {}

  async openModal() {
    const currencyModal = await this.modalController.create({
      component: FySelectVendorModalComponent,
      componentProps: {
        currentSelection: this.value,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
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
