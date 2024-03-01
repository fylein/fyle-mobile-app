import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { switchMap } from 'rxjs';
import { Location } from 'src/app/core/models/location.model';
import { CommuteDetails } from 'src/app/core/models/platform/v1/commute-details.model';
import { LocationService } from 'src/app/core/services/location.service';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';

@Component({
  selector: 'app-fy-select-commute-details',
  templateUrl: './fy-select-commute-details.component.html',
  styleUrls: ['./fy-select-commute-details.component.scss'],
})
export class FySelectCommuteDetailsComponent implements OnInit {
  @Input() distanceUnit: string;

  @Input() existingCommuteDetails: CommuteDetails;

  commuteDetails: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private locationService: LocationService,
    private employeesService: EmployeesService
  ) {}

  ngOnInit(): void {
    this.commuteDetails = this.formBuilder.group({
      homeLocation: [, Validators.required],
      workLocation: [, Validators.required],
    });

    // In case if spender tries to edit the commute details, prefill form with existing details
    if (this.existingCommuteDetails) {
      const homeLocation = {
        ...this.existingCommuteDetails.home_location,
        display: this.existingCommuteDetails.home_location.formatted_address,
      };
      const workLocation = {
        ...this.existingCommuteDetails.work_location,
        display: this.existingCommuteDetails.work_location.formatted_address,
      };

      this.commuteDetails.controls.homeLocation.patchValue(homeLocation);
      this.commuteDetails.controls.workLocation.patchValue(workLocation);
    }
  }

  getCalculatedDistance(distanceResponse: number): number {
    const distanceInKM = distanceResponse / 1000;
    const finalDistance = this.distanceUnit === 'Miles' ? distanceInKM * 0.6213 : distanceInKM;
    return finalDistance;
  }

  formatLocation(location: Location): Omit<Location, 'display'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { display, ...formattedLocation } = location;
    return formattedLocation;
  }

  save(): void {
    if (this.commuteDetails.valid) {
      const commuteDetailsFormValue = this.commuteDetails.value as { homeLocation: Location; workLocation: Location };

      this.locationService
        .getDistance(commuteDetailsFormValue.homeLocation, commuteDetailsFormValue.workLocation)
        .pipe(
          switchMap((distanceResponse) => {
            const distance = this.getCalculatedDistance(distanceResponse);
            const commuteDetails = {
              home_location: this.formatLocation(commuteDetailsFormValue.homeLocation),
              work_location: this.formatLocation(commuteDetailsFormValue.workLocation),
              distance,
              distance_unit: this.distanceUnit.toUpperCase(),
            };

            return this.employeesService.postCommuteDetails(commuteDetails);
          })
        )
        .subscribe(() => {
          this.modalController.dismiss({ action: 'save' });
        });
    } else {
      this.commuteDetails.markAllAsTouched();
    }
  }

  close(): void {
    this.modalController.dismiss({ action: 'cancel' });
  }
}
