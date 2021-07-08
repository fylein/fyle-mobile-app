import { Component, Injector, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormArray, FormBuilder, FormControl, FormGroup, NgControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { intersection, isEqual } from 'lodash';
import { Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MileageService } from 'src/app/core/services/mileage.service';
import { RouteSelectorModalComponent } from './route-selector-modal/route-selector-modal.component';

@Component({
  selector: 'app-route-selector',
  templateUrl: './route-selector.component.html',
  styleUrls: ['./route-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: RouteSelectorComponent
    },
    {
      provide: NG_VALIDATORS,
      useExisting: RouteSelectorComponent,
      multi: true
    }
  ]
})
export class RouteSelectorComponent implements OnInit, ControlValueAccessor, OnDestroy, OnChanges {
  private ngControl: NgControl;

  @Input() unit: 'KM' | 'MILES';
  @Input() mileageConfig;
  @Input() isDistanceMandatory;
  @Input() isAmountDisabled;
  @Input() txnFields;
  @Input() formInitialized;
  @Input() isConnected;
  skipRoundTripUpdate = false;

  onTouched = () => { };

  onChangeSub: Subscription;

  form: FormGroup = this.fb.group({
    mileage_locations: new FormArray([]),
    distance: [, Validators.required],
    round_trip: [],
  })

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private injector: Injector
  ) { }
  
  get mileage_locations() {
    return this.form.controls.mileage_locations as FormArray;
  }

  ngDoCheck() {
    if (this.ngControl.touched) {
      this.form.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.onChangeSub.unsubscribe();
  }

  customDistanceValidator(control: AbstractControl) {
    const passedInDistance = control.value && +control.value;
    if (passedInDistance !== null) {
      return (passedInDistance > 0) ? null : {
        invalidDistance: true
      };
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mileageConfig']&& !isEqual(changes['mileageConfig'].previousValue, changes['mileageConfig'].currentValue)) {
      this.form.controls.mileage_locations.clearValidators();
      this.form.controls.mileage_locations.updateValueAndValidity(); 
      if (this.mileageConfig.location_mandatory) {
        this.form.controls.mileage_locations.setValidators(Validators.required);
      }
      this.form.controls.mileage_locations.updateValueAndValidity(); 
      this.form.updateValueAndValidity();
    }

    if (changes['txnFields'] && !isEqual(changes['txnFields'].previousValue, changes['txnFields'].currentValue)) {
      const keyToControlMap: { [id: string]: AbstractControl; } = {
        distance: this.form.controls.distance
      };

      for (const control of Object.values(keyToControlMap)) {
        control.clearValidators();
        control.updateValueAndValidity();
      }

      for (const txnFieldKey of intersection(['distance'], Object.keys(this.txnFields))) {
        const control = keyToControlMap[txnFieldKey];

        if (this.txnFields[txnFieldKey].is_mandatory) {
          if (txnFieldKey === 'distance') {
            control.setValidators(this.isConnected ? Validators.compose([Validators.required, this.customDistanceValidator]) : null);
          }
        }
        control.updateValueAndValidity();
      }

      this.form.updateValueAndValidity();
    }
  }

  writeValue(value): void {
    if (value) {
      if (value.mileage_locations) {
        value.mileage_locations.forEach(location => {
          this.mileage_locations.push(new FormControl(location, this.mileageConfig.location_mandatory && Validators.required));
        });
        if (value.mileage_locations.length === 1) {
          this.mileage_locations.push(new FormControl(null, this.mileageConfig.location_mandatory && Validators.required)); 
        }
      }

      this.form.patchValue({
        distance: value.distance,
        round_trip: value.round_trip
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
    }
    else {
      this.form.enable();
    }
  }

  ngOnInit() {
    this.ngControl = this.injector.get(NgControl);

    this.form.controls.round_trip.valueChanges.subscribe(roundTrip => {
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
        mileageConfig: this.txnFields,
        isDistanceMandatory: this.txnFields,
        isAmountDisabled: this.isAmountDisabled,
        txnFields: this.txnFields,
        value: this.form.value
      },
    });

    await selectionModal.present();

    const { data } = await selectionModal.onWillDismiss();

    if (data) {
      this.skipRoundTripUpdate = true;
      this.mileage_locations.clear({
        emitEvent: false
      });

      data.mileage_locations.forEach(mileageLocation => {
        this.mileage_locations.push(new FormControl(mileageLocation, this.mileageConfig.location_mandatory && Validators.required))
      });

      this.form.patchValue({
        distance: parseFloat(data.distance),
        round_trip: data.round_trip
      });
    }
  }

  validate(fc: FormControl) {
    if (!this.form.valid) {
      return {
        ...this.form.controls.mileage_locations.errors,
        ...this.form.controls.distance.errors
      };
    }
    return null;
  }

}
