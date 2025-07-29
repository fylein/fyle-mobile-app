import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
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

  get valid(): boolean {
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

  async openModal(): Promise<void> {
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

  onBlur(): void {
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

  registerOnChange(fn: (value: LocationValue | null) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }
}
