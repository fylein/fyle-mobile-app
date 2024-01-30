import { Component, DoCheck, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { intersection, isEqual } from 'lodash';
import { Subscription } from 'rxjs';
import { RouteSelectorModalComponent } from './route-selector-modal/route-selector-modal.component';

@Component({
  selector: 'app-route-selector',
  templateUrl: './route-selector.component.html',
  styleUrls: ['./route-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: RouteSelectorComponent,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: RouteSelectorComponent,
      multi: true,
    },
  ],
})
export class RouteSelectorComponent implements OnInit, ControlValueAccessor, OnDestroy, OnChanges, DoCheck {
  @Input() unit: 'KM' | 'MILES';

  @Input() mileageConfig;

  @Input() isDistanceMandatory;

  @Input() isAmountDisabled;

  @Input() txnFields;

  @Input() formInitialized;

  @Input() isConnected;

  @Input() touchedInParent = false;

  @Input() validInParent = true;

  @Input() recentlyUsedMileageLocations: {
    recent_start_locations?: string[];
    recent_end_locations?: string[];
    recent_locations?: string[];
  };

  skipRoundTripUpdate = false;

  onChangeSub: Subscription;

  form: UntypedFormGroup = this.fb.group({
    mileageLocations: new UntypedFormArray([]),
    distance: [, Validators.required],
    roundTrip: [],
  });

  constructor(private fb: UntypedFormBuilder, private modalController: ModalController) {}

  get mileageLocations() {
    return this.form.controls.mileageLocations as UntypedFormArray;
  }

  onTouched = () => {};

  ngDoCheck() {
    if (this.touchedInParent) {
      this.form.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.onChangeSub.unsubscribe();
  }

  customDistanceValidator(control: AbstractControl) {
    const passedInDistance = control.value && +control.value;
    if (passedInDistance !== null) {
      return passedInDistance > 0
        ? null
        : {
            invalidDistance: true,
          };
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.mileageConfig && !isEqual(changes.mileageConfig.previousValue, changes.mileageConfig.currentValue)) {
      this.onMileageConfigChange();
    }

    if (changes.txnFields && !isEqual(changes.txnFields.previousValue, changes.txnFields.currentValue)) {
      this.onTxnFieldsChange();
    }
  }

  onTxnFieldsChange() {
    const keyToControlMap: { [id: string]: AbstractControl } = {
      distance: this.form.controls.distance,
    };

    for (const control of Object.values(keyToControlMap)) {
      control.clearValidators();
      control.updateValueAndValidity();
    }

    for (const txnFieldKey of intersection(['distance'], Object.keys(this.txnFields))) {
      const control = keyToControlMap[txnFieldKey];

      if (this.txnFields[txnFieldKey].is_mandatory) {
        if (txnFieldKey === 'distance') {
          control.setValidators(
            this.isConnected ? Validators.compose([Validators.required, this.customDistanceValidator]) : null
          );
        }
      }
      control.updateValueAndValidity();
    }

    this.form.updateValueAndValidity();
  }

  onMileageConfigChange() {
    this.form.controls.mileageLocations.clearValidators();
    this.form.controls.mileageLocations.updateValueAndValidity();
    if (this.mileageConfig.location_mandatory) {
      this.form.controls.mileageLocations.setValidators(Validators.required);
    }
    this.form.controls.mileageLocations.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }

  writeValue(value): void {
    if (value) {
      if (value.mileageLocations) {
        value.mileageLocations.forEach((location) => {
          this.mileageLocations.push(
            new UntypedFormControl(location, this.mileageConfig.location_mandatory && Validators.required)
          );
        });
        if (value.mileageLocations.length === 1) {
          this.mileageLocations.push(
            new UntypedFormControl(null, this.mileageConfig.location_mandatory && Validators.required)
          );
        }
      }

      this.form.patchValue({
        distance: value.distance,
        roundTrip: value.roundTrip,
      });
    }
  }

  registerOnChange(onChange): void {
    this.onChangeSub = this.form.valueChanges.subscribe(onChange);
  }

  registerOnTouched(onTouched): void {
    this.onTouched = onTouched;
  }

  setDisabledState?(disabled: boolean): void {
    if (disabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  ngOnInit() {
    this.form.controls.roundTrip.valueChanges.subscribe((roundTrip) => {
      if (!this.skipRoundTripUpdate) {
        if (this.formInitialized) {
          if (this.form.value.distance) {
            if (roundTrip) {
              this.form.controls.distance.setValue((+this.form.value.distance * 2).toFixed(2));
            } else {
              this.form.controls.distance.setValue((+this.form.value.distance / 2).toFixed(2));
            }
          }
        }
      } else {
        this.skipRoundTripUpdate = false;
      }
    });
  }

  async openModal() {
    const selectionModal = await this.modalController.create({
      component: RouteSelectorModalComponent,
      componentProps: {
        unit: this.unit,
        mileageConfig: this.mileageConfig,
        isDistanceMandatory: this.isDistanceMandatory,
        isAmountDisabled: this.isAmountDisabled,
        txnFields: this.txnFields,
        value: this.form.value,
        recentlyUsedMileageLocations: this.recentlyUsedMileageLocations,
      },
    });

    await selectionModal.present();

    const { data } = await selectionModal.onWillDismiss();

    if (data) {
      this.skipRoundTripUpdate = true;
      this.mileageLocations.clear({
        emitEvent: false,
      });

      data.mileageLocations?.forEach((mileageLocation) => {
        this.mileageLocations.push(
          new UntypedFormControl(mileageLocation, this.mileageConfig.location_mandatory && Validators.required)
        );
      });

      this.form.patchValue({
        distance: parseFloat(data.distance),
        roundTrip: data.roundTrip,
      });
    }
  }

  validate(fc: UntypedFormControl) {
    if (!this.form.valid) {
      return {
        ...this.form.controls.mileageLocations.errors,
        ...this.form.controls.distance.errors,
      };
    }
    return null;
  }
}
