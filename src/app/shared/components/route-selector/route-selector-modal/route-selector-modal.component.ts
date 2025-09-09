import { Component, Input, OnInit, inject, input } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { switchMap } from 'rxjs/operators';
import { MileageDetails } from 'src/app/core/models/mileage.model';
import { MileageService } from 'src/app/core/services/mileage.service';
import { MileageLocation } from '../../route-visualizer/mileage-locations.interface';
import { NgClass, TitleCasePipe } from '@angular/common';
import { FyLocationComponent } from '../../fy-location/fy-location.component';
import { MatIcon } from '@angular/material/icon';
import { FyAlertInfoComponent } from '../../fy-alert-info/fy-alert-info.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-route-selector-modal',
    templateUrl: './route-selector-modal.component.html',
    styleUrls: ['./route-selector-modal.component.scss'],
    imports: [
        IonicModule,
        FormsModule,
        ReactiveFormsModule,
        NgClass,
        FyLocationComponent,
        MatIcon,
        FyAlertInfoComponent,
        MatCheckbox,
        TitleCasePipe,
        TranslocoPipe,
    ],
})
export class RouteSelectorModalComponent implements OnInit {
  private fb = inject(UntypedFormBuilder);

  private modalController = inject(ModalController);

  private mileageService = inject(MileageService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() unit: 'KM' | 'MILES';

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() mileageConfig: MileageDetails;

  readonly isDistanceMandatory = input(undefined);

  readonly isAmountDisabled = input(undefined);

  readonly txnFields = input(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() formInitialized;

  readonly isConnected = input(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() value: {
    distance: number;
    mileageLocations?: MileageLocation[];
    roundTrip: number;
  };

  readonly recentlyUsedMileageLocations = input<{
    start_locations?: string[];
    end_locations?: string[];
    locations?: string[];
  }>(undefined);

  distance: string;

  form: UntypedFormGroup = this.fb.group({
    mileageLocations: new UntypedFormArray([]),
    roundTrip: [],
  });

  calculatedLocationDistance: number;

  get mileageLocations(): UntypedFormArray {
    return this.form.controls.mileageLocations as UntypedFormArray;
  }

  addMileageLocation(): void {
    this.mileageLocations.push(
      new UntypedFormControl(null, this.mileageConfig.location_mandatory && Validators.required),
    );
  }

  removeMileageLocation(index: number): void {
    this.mileageLocations.removeAt(index);
  }

  customDistanceValidator(control: AbstractControl): { invalidDistance: boolean } {
    const passedInDistance = control.value && +control.value;
    if (passedInDistance !== null) {
      return passedInDistance > 0
        ? null
        : {
            invalidDistance: true,
          };
    }
  }

  ngOnInit(): void {
    this.distance = String(this.value.distance);

    if (this.value?.mileageLocations?.length > 1) {
      this.mileageService.getDistance(this.value?.mileageLocations).subscribe((distance) => {
        if (distance === null) {
          this.calculatedLocationDistance = null;
        } else {
          const distanceInKm = parseFloat((distance / 1000).toFixed(2));
          const finalDistance = this.unit === 'MILES' ? parseFloat((distanceInKm * 0.6213).toFixed(2)) : distanceInKm;
          //value comes as an Input in this component, if roundTrip is already set double the value during initialization
          if (this.value?.roundTrip) {
            this.calculatedLocationDistance = parseFloat((finalDistance * 2).toFixed(2));
          } else {
            this.calculatedLocationDistance = parseFloat(finalDistance.toFixed(2));
          }
        }
      });
    }

    if (this.value?.mileageLocations?.length > 0) {
      this.value.mileageLocations.forEach((location) => {
        this.mileageLocations.push(
          new UntypedFormControl(location, this.mileageConfig.location_mandatory && Validators.required),
        );
      });
    } else {
      this.mileageLocations.push(
        new UntypedFormControl({}, this.mileageConfig.location_mandatory && Validators.required),
      );
      this.mileageLocations.push(
        new UntypedFormControl({}, this.mileageConfig.location_mandatory && Validators.required),
      );
    }

    this.form.patchValue({
      roundTrip: this.value.roundTrip,
    });

    this.form.controls.roundTrip.valueChanges.subscribe((roundTrip) => {
      if (this.distance) {
        if (roundTrip) {
          this.distance = (+this.distance * 2).toFixed(2);
          this.calculatedLocationDistance = this.calculatedLocationDistance
            ? parseFloat((this.calculatedLocationDistance * 2).toFixed(2))
            : null;
        } else {
          this.distance = (+this.distance / 2).toFixed(2);
          this.calculatedLocationDistance = this.calculatedLocationDistance
            ? parseFloat((this.calculatedLocationDistance / 2).toFixed(2))
            : null;
        }
      }
    });

    this.form.controls.mileageLocations.valueChanges
      .pipe(switchMap((mileageLocations: MileageLocation[]) => this.mileageService.getDistance(mileageLocations)))
      .subscribe((distance) => {
        if (distance === null) {
          this.distance = null;
          this.calculatedLocationDistance = null;
        } else {
          const distanceInKm = parseFloat((distance / 1000).toFixed(2));
          const finalDistance = this.unit === 'MILES' ? parseFloat((distanceInKm * 0.6213).toFixed(2)) : distanceInKm;
          if (finalDistance === 0) {
            this.distance = '0';
            this.calculatedLocationDistance = 0;
          } else {
            if (this.form.controls.roundTrip.value) {
              this.distance = (finalDistance * 2).toFixed(2);
            } else {
              this.distance = finalDistance.toFixed(2);
            }
            this.calculatedLocationDistance = parseFloat(this.distance);
          }
        }
      });
  }

  save(): void {
    if (this.form.valid) {
      this.modalController.dismiss({
        ...this.form.value,
        distance: this.distance,
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  close(): void {
    this.modalController.dismiss();
  }
}
