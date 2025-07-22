import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalController, IonicModule } from '@ionic/angular';
import { catchError, forkJoin, map, switchMap, throwError } from 'rxjs';
import { ToastType } from 'src/app/core/enums/toast-type.enum';
import { Location } from 'src/app/core/models/location.model';
import { CommuteDetails } from 'src/app/core/models/platform/v1/commute-details.model';
import { LocationService } from 'src/app/core/services/location.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';
import { ToastMessageComponent } from '../toast-message/toast-message.component';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { FormButtonValidationDirective } from '../../directive/form-button-validation.directive';
import { FyLocationComponent } from '../fy-location/fy-location.component';

@Component({
  selector: 'app-fy-select-commute-details',
  templateUrl: './fy-select-commute-details.component.html',
  styleUrls: ['./fy-select-commute-details.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    MatIcon,
    FormButtonValidationDirective,
    FyLocationComponent,
    FormsModule,
    ReactiveFormsModule,
    TranslocoPipe,
  ],
})
export class FySelectCommuteDetailsComponent implements OnInit {
  @Input() existingCommuteDetails?: CommuteDetails;

  commuteDetails: UntypedFormGroup;

  saveCommuteDetailsLoading = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private modalController: ModalController,
    private locationService: LocationService,
    private employeesService: EmployeesService,
    private orgSettingsService: OrgSettingsService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private trackingService: TrackingService,
    private translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    this.commuteDetails = this.formBuilder.group({
      homeLocation: [, Validators.required],
      workLocation: [, Validators.required],
    });

    // In case if spender tries to edit the commute details, prefill form with existing details
    if (this.existingCommuteDetails?.home_location) {
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

  getCalculatedDistance(distanceResponse: number, distanceUnit: string): number {
    const distanceInKM = distanceResponse / 1000;
    const finalDistance = distanceUnit === 'MILES' ? distanceInKM * 0.6213 : distanceInKM;
    return finalDistance;
  }

  formatLocation(location: Location): Omit<Location, 'display'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { display, ...formattedLocation } = location;
    return formattedLocation;
  }

  showToastMessage(toastMessage: string, toastType: ToastType, panelClass: string): void {
    const message = toastMessage;

    this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties(toastType, { message }),
      panelClass: [panelClass],
    });
    this.trackingService.showToastMessage({ ToastContent: message });
  }

  save(): void {
    if (this.commuteDetails.valid) {
      this.saveCommuteDetailsLoading = true;

      const commuteDetailsFormValue = this.commuteDetails.value as { homeLocation: Location; workLocation: Location };

      const getMileageUnit$ = this.orgSettingsService.get().pipe(map((orgSettings) => orgSettings.mileage?.unit));

      forkJoin({
        getMileageUnit: getMileageUnit$,
        distanceResponse: this.locationService.getDistance(
          commuteDetailsFormValue.homeLocation,
          commuteDetailsFormValue.workLocation
        ),
      })
        .pipe(
          switchMap(({ getMileageUnit, distanceResponse }) => {
            const distance = this.getCalculatedDistance(distanceResponse, getMileageUnit);
            const commuteDetails = {
              home_location: this.formatLocation(commuteDetailsFormValue.homeLocation),
              work_location: this.formatLocation(commuteDetailsFormValue.workLocation),
              distance,
              distance_unit: getMileageUnit.toUpperCase(),
            };

            return this.employeesService.postCommuteDetails(commuteDetails);
          }),
          catchError((err: HttpErrorResponse) => {
            this.saveCommuteDetailsLoading = false;
            this.trackingService.commuteDeductionDetailsError(err);
            const message = this.translocoService.translate('fySelectCommuteDetails.saveError');
            this.showToastMessage(message, ToastType.FAILURE, 'msb-failure');
            return throwError(err);
          })
        )
        .subscribe((commuteDetailsResponse) => {
          this.saveCommuteDetailsLoading = false;
          this.modalController.dismiss({ action: 'save', commuteDetails: commuteDetailsResponse.data });
        });
    } else {
      this.commuteDetails.markAllAsTouched();
    }
  }

  close(): void {
    this.modalController.dismiss({ action: 'cancel' });
  }
}
