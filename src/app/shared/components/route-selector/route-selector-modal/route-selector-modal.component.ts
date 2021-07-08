import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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

  distance: string;

  form: FormGroup = this.fb.group({
    mileage_locations: new FormArray([]),
    round_trip: [],
  })

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private mileageService: MileageService
  ) { }

  get mileage_locations() {
    return this.form.controls.mileage_locations as FormArray;
  }

  addMileageLocation() {
    this.mileage_locations.push(
      new FormControl(null, this.mileageConfig.location_mandatory && Validators.required)
    );
  }

  removeMileageLocation(index: number) {
    this.mileage_locations.removeAt(index);
  }

  customDistanceValidator(control: AbstractControl) {
    const passedInDistance = control.value && +control.value;
    if (passedInDistance !== null) {
      return (passedInDistance > 0) ? null : {
        invalidDistance: true
      };
    }
  }

  ngOnInit() {
    this.distance = this.value.distance;
    if (this.value?.mileage_locations?.length > 0) {
      this.value.mileage_locations.forEach(location => {
        this.mileage_locations.push(new FormControl(location, this.mileageConfig.location_mandatory && Validators.required));
      });
    } else {
      this.mileage_locations.push(new FormControl(null, this.mileageConfig.location_mandatory && Validators.required));
      this.mileage_locations.push(new FormControl(null, this.mileageConfig.location_mandatory && Validators.required));
    }

    this.form.patchValue({
      round_trip: this.value.round_trip
    });


    this.form.controls.round_trip.valueChanges.subscribe(roundTrip => {
      if (this.distance) {
        if (roundTrip) {
          this.distance = ((+this.distance * 2).toFixed(2));
        } else {
          this.distance = ((+this.distance / 2).toFixed(2));
        }
      }
    });

    this.form.controls.mileage_locations.valueChanges.pipe(
      switchMap((mileage_locations) => {
        return this.mileageService.getDistance(mileage_locations);
      })
    ).subscribe(distance => {
      if (distance === null) {
        this.distance = null;
      } else {
        const distanceInKm = distance / 1000;
        const finalDistance = (this.unit === 'MILES') ? (distanceInKm * 0.6213) : distanceInKm;
        if (finalDistance === 0) {
          this.distance = '0';
        } else {
          if (this.form.controls.round_trip.value) {
            this.distance = ((finalDistance * 2).toFixed(2));
          } else {
            this.distance = (finalDistance.toFixed(2));
          }
        }
      }
    });
  }

  save() {
    if (this.form.valid) {
      this.modalController.dismiss({
        ...this.form.value,
        distance: this.distance
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  close() {
    this.modalController.dismiss();
  }

}
