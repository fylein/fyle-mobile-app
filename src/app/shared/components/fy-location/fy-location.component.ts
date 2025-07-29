/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component, OnInit, forwardRef, Input, Injector } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NgControl } from '@angular/forms';
import { noop } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { FyLocationModalComponent } from './fy-location-modal/fy-location-modal.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';

// eslint-disable-next-line custom-rules/prefer-semantic-extension-name
interface LocationValue {
  display: string;
  value?: string;
}

@Component({
  selector: 'app-fy-location',
  templateUrl: './fy-location.component.html',
  styleUrls: ['./fy-location.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FyLocationComponent),
      multi: true,
    },
  ],
  standalone: false,
})
export class FyLocationComponent implements ControlValueAccessor {
  @Input() label = 'location';

  @Input() mandatory = false;

  @Input() disabled = false;

  @Input() allowCustom = false;

  @Input() hideSuffix = false;

  @Input() recentLocations: string[] = [];

  @Input() cacheName?: string;

  @Input() placeholder: string;

  @Input() touchedInParent: boolean;

  @Input() validInParent: boolean;

  @Input() disableEnteringManualLocation? = false;

  displayValue = '';

  innerValue: LocationValue | null = null;

  onTouchedCallback: () => void = noop;

  onChangeCallback: (_: LocationValue | null) => void = noop;

  constructor(
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
  ) {}

  get valid() {
    if (this.touchedInParent) {
      return this.validInParent;
    } else {
      return true;
    }
  }

  get value(): LocationValue | null {
    return this.innerValue;
  }

  set value(v: LocationValue | null) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      const selectedOption = this.innerValue;
      if (selectedOption) {
        this.displayValue = selectedOption.display;
      } else {
        this.displayValue = '';
      }

      this.onChangeCallback(v);
    }
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method, @typescript-eslint/no-empty-function
  ngOnInit() {}

  async openModal() {
    if (!this.disabled) {
      const selectionModal = await this.modalController.create({
        component: FyLocationModalComponent,
        componentProps: {
          currentSelection: this.value,
          allowCustom: this.allowCustom,
          recentLocations: this.recentLocations,
          cacheName: this.cacheName,
          disableEnteringManualLocation: this.disableEnteringManualLocation,
        },
      });

      await selectionModal.present();

      const { data } = await selectionModal.onWillDismiss();

      if (data) {
        this.value = data.selection;
      }
    }
  }

  onBlur() {
    this.onTouchedCallback();
  }

  writeValue(value: LocationValue | null): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
      const selectedOption = this.innerValue;
      if (selectedOption) {
        this.displayValue = selectedOption.display;
      } else {
        this.displayValue = '';
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
}
