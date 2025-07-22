import {
  Component,
  DoCheck,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
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
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { intersection, isEqual } from 'lodash';
import { Subscription, distinctUntilChanged } from 'rxjs';
import { RouteSelectorModalComponent } from './route-selector-modal/route-selector-modal.component';
import { MileageDetails } from 'src/app/core/models/mileage.model';
import { MileageLocation } from '../route-visualizer/mileage-locations.interface';
import { NgClass, TitleCasePipe } from '@angular/common';
import { FyLocationComponent } from '../fy-location/fy-location.component';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { FyNumberComponent } from '../fy-number/fy-number.component';
import { TranslocoPipe } from '@jsverse/transloco';

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
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    FyLocationComponent,
    MatIcon,
    MatCheckbox,
    FyNumberComponent,
    TitleCasePipe,
    TranslocoPipe,
  ],
})
export class RouteSelectorComponent implements OnInit, ControlValueAccessor, OnDestroy, OnChanges, DoCheck {
  @Input() unit: 'KM' | 'MILES';

  @Input() mileageConfig: MileageDetails;

  @Input() isDistanceMandatory: boolean;

  @Input() isAmountDisabled: boolean;

  @Input() txnFields;

  @Input() formInitialized;

  @Input() isConnected;

  @Input() touchedInParent = false;

  @Input() validInParent = true;

  @Input() recentlyUsedMileageLocations: {
    start_locations?: string[];
    end_locations?: string[];
    locations?: string[];
  };

  @Output() distanceChange = new EventEmitter<number>();

  onChangeSub: Subscription;

  form: UntypedFormGroup = this.fb.group({
    mileageLocations: new UntypedFormArray([]),
    distance: [, Validators.required],
    roundTrip: [],
  });

  constructor(private fb: UntypedFormBuilder, private modalController: ModalController) {}

  get mileageLocations(): UntypedFormArray {
    return this.form.controls.mileageLocations as UntypedFormArray;
  }

  get isRoundTripDisabled(): boolean {
    return this.isAmountDisabled;
  }

  // eslint-disable-next-line
  onTouched = () => {};

  ngDoCheck(): void {
    if (this.touchedInParent) {
      this.form.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.onChangeSub.unsubscribe();
  }

  customDistanceValidator(control: AbstractControl): { invalidDistance: boolean } {
    const passedInDistance = parseFloat(String(control.value));
    if (passedInDistance !== null) {
      return passedInDistance >= 0
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

  onTxnFieldsChange(): void {
    const keyToControlMap: { [id: string]: AbstractControl } = {
      distance: this.form.controls.distance,
    };

    for (const control of Object.values(keyToControlMap)) {
      control.clearValidators();
      control.updateValueAndValidity();
    }

    // eslint-disable-next-line
    for (const txnFieldKey of intersection(['distance'], Object.keys(this.txnFields))) {
      const control = keyToControlMap[txnFieldKey];

      // eslint-disable-next-line
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

  onMileageConfigChange(): void {
    this.form.controls.mileageLocations.clearValidators();
    this.form.controls.mileageLocations.updateValueAndValidity();
    if (this.mileageConfig.location_mandatory) {
      this.form.controls.mileageLocations.setValidators(Validators.required);
    }
    this.form.controls.mileageLocations.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }

  writeValue(value: { mileageLocations: MileageLocation[]; distance?: number; roundTrip?: boolean }): void {
    if (value) {
      if (value.mileageLocations) {
        value.mileageLocations.forEach((location) => {
          this.mileageLocations.push(
            new UntypedFormControl(location, this.mileageConfig.location_mandatory && Validators.required)
          );
        });
        if (value.mileageLocations.length === 1) {
          this.mileageLocations.push(
            new UntypedFormControl({}, this.mileageConfig.location_mandatory && Validators.required)
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
    // eslint-disable-next-line
    this.onChangeSub = this.form.valueChanges.subscribe(onChange);
  }

  registerOnTouched(onTouched): void {
    // eslint-disable-next-line
    this.onTouched = onTouched;
  }

  setDisabledState?(disabled: boolean): void {
    if (disabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  ngOnInit(): void {
    this.form.controls.roundTrip.valueChanges.pipe(distinctUntilChanged()).subscribe((roundTrip) => {
      if (this.formInitialized) {
        const formValue = this.form.value as { distance: number };
        if (formValue.distance) {
          if (roundTrip) {
            this.form.controls.distance.setValue(parseFloat((+formValue.distance * 2).toFixed(2)));
          } else {
            this.form.controls.distance.setValue(parseFloat((+formValue.distance / 2).toFixed(2)));
          }
        }
      }
    });
  }

  async openModal(): Promise<void> {
    const selectionModal = await this.modalController.create({
      component: RouteSelectorModalComponent,
      componentProps: {
        unit: this.unit,
        mileageConfig: this.mileageConfig,
        isDistanceMandatory: this.isDistanceMandatory,
        isAmountDisabled: this.isAmountDisabled,
        // eslint-disable-next-line
        txnFields: this.txnFields,
        value: this.form.value as {
          distance: string;
          mileageLocations: [];
          roundTrip: boolean;
        },
        recentlyUsedMileageLocations: this.recentlyUsedMileageLocations,
      },
    });

    await selectionModal.present();

    const { data } = (await selectionModal.onWillDismiss()) as {
      data: { mileageLocations: []; distance: number; roundTrip: boolean };
    };

    if (data) {
      this.mileageLocations.clear({
        emitEvent: false,
      });

      data.mileageLocations?.forEach((mileageLocation: MileageLocation) => {
        this.mileageLocations.push(
          new UntypedFormControl(mileageLocation || {}, this.mileageConfig.location_mandatory && Validators.required)
        );
      });

      this.form.patchValue({
        distance: parseFloat(String(data.distance)),
        roundTrip: data.roundTrip,
      });

      this.distanceChange.emit(data.distance);
    }
  }

  // eslint-disable-next-line
  validate() {
    if (!this.form.valid) {
      return {
        ...this.form.controls.mileageLocations.errors,
        ...this.form.controls.distance.errors,
      };
    }
    return null;
  }
}
