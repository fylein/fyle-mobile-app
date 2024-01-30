import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { intersection, isEmpty } from 'lodash';
import { Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MileageService } from 'src/app/core/services/mileage.service';

@Component({
  selector: 'app-route-selector-modal',
  templateUrl: './route-selector-modal.component.html',
  styleUrls: ['./route-selector-modal.component.scss'],
})
export class RouteSelectorModalComponent implements OnInit {
  @Input() unit: 'KM' | 'MILES';

  @Input() mileageConfig;

  @Input() isDistanceMandatory;

  @Input() isAmountDisabled;

  @Input() txnFields;

  @Input() formInitialized;

  @Input() isConnected;

  @Input() value;

  @Input() recentlyUsedMileageLocations: {
    recent_start_locations?: string[];
    recent_end_locations?: string[];
    recent_locations?: string[];
  };

  distance: string;

  form: UntypedFormGroup = this.fb.group({
    mileageLocations: new UntypedFormArray([]),
    roundTrip: [],
  });

  constructor(
    private fb: UntypedFormBuilder,
    private modalController: ModalController,
    private mileageService: MileageService
  ) {}

  get mileageLocations() {
    return this.form.controls.mileageLocations as UntypedFormArray;
  }

  addMileageLocation() {
    this.mileageLocations.push(
      new UntypedFormControl(null, this.mileageConfig.location_mandatory && Validators.required)
    );
  }

  removeMileageLocation(index: number) {
    this.mileageLocations.removeAt(index);
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

  ngOnInit() {
    this.distance = this.value.distance;
    if (this.value?.mileageLocations?.length > 0) {
      this.value.mileageLocations.forEach((location) => {
        this.mileageLocations.push(
          new UntypedFormControl(location, this.mileageConfig.location_mandatory && Validators.required)
        );
      });
    } else {
      this.mileageLocations.push(
        new UntypedFormControl(null, this.mileageConfig.location_mandatory && Validators.required)
      );
      this.mileageLocations.push(
        new UntypedFormControl(null, this.mileageConfig.location_mandatory && Validators.required)
      );
    }

    this.form.patchValue({
      roundTrip: this.value.roundTrip,
    });

    this.form.controls.roundTrip.valueChanges.subscribe((roundTrip) => {
      if (this.distance) {
        if (roundTrip) {
          this.distance = (+this.distance * 2).toFixed(2);
        } else {
          this.distance = (+this.distance / 2).toFixed(2);
        }
      }
    });

    this.form.controls.mileageLocations.valueChanges
      .pipe(switchMap((mileageLocations) => this.mileageService.getDistance(mileageLocations)))
      .subscribe((distance) => {
        if (distance === null) {
          this.distance = null;
        } else {
          const distanceInKm = distance / 1000;
          const finalDistance = this.unit === 'MILES' ? distanceInKm * 0.6213 : distanceInKm;
          if (finalDistance === 0) {
            this.distance = '0';
          } else {
            if (this.form.controls.roundTrip.value) {
              this.distance = (finalDistance * 2).toFixed(2);
            } else {
              this.distance = finalDistance.toFixed(2);
            }
          }
        }
      });
  }

  save() {
    if (this.form.valid) {
      this.modalController.dismiss({
        ...this.form.value,
        distance: this.distance,
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  close() {
    this.modalController.dismiss();
  }
}
