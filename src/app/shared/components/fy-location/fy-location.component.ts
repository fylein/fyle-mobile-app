import { Component, OnInit, forwardRef, Input, inject, input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { noop } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { FyLocationModalComponent } from './fy-location-modal/fy-location-modal.component';

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
export class FyLocationComponent implements ControlValueAccessor, OnInit {
  private modalController = inject(ModalController);

  readonly label = input('location');

  readonly mandatory = input(false);

  readonly disabled = input(false);

  readonly allowCustom = input(false);

  readonly hideSuffix = input(false);

  readonly recentLocations = input<string[]>([]);

  readonly cacheName = input<string>(undefined);

  readonly placeholder = input<string>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() touchedInParent: boolean;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() validInParent: boolean;

  readonly disableEnteringManualLocation = input<boolean>(false);

  displayValue;

  innerValue;

  onTouchedCallback: () => void = noop;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChangeCallback: (_: any) => void = noop;

  get valid() {
    if (this.touchedInParent) {
      return this.validInParent;
    } else {
      return true;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get value(): any {
    return this.innerValue;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set value(v: any) {
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

  ngOnInit() {}

  async openModal() {
    if (!this.disabled()) {
      const selectionModal = await this.modalController.create({
        component: FyLocationModalComponent,
        componentProps: {
          currentSelection: this.value,
          allowCustom: this.allowCustom(),
          recentLocations: this.recentLocations(),
          cacheName: this.cacheName(),
          disableEnteringManualLocation: this.disableEnteringManualLocation(),
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  writeValue(value: any): void {
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

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
}
