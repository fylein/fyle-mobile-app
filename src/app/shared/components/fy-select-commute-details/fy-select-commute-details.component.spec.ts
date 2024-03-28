import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { FySelectCommuteDetailsComponent } from './fy-select-commute-details.component';
import { FormBuilder, Validators } from '@angular/forms';
import { LocationService } from 'src/app/core/services/location.service';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { commuteDetailsData } from 'src/app/core/mock-data/commute-details.data';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ToastType } from 'src/app/core/enums/toast-type.enum';
import { ToastMessageComponent } from '../toast-message/toast-message.component';
import { snackbarPropertiesRes2 } from 'src/app/core/mock-data/snackbar-properties.data';

describe('FySelectCommuteDetailsComponent', () => {
  let component: FySelectCommuteDetailsComponent;
  let fixture: ComponentFixture<FySelectCommuteDetailsComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let formBuilder: jasmine.SpyObj<FormBuilder>;
  let locationService: jasmine.SpyObj<LocationService>;
  let employeesService: jasmine.SpyObj<EmployeesService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let trackingService: jasmine.SpyObj<TrackingService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const formBuilderSpy = jasmine.createSpyObj('FormBuilder', ['group']);
    const locationServiceSpy = jasmine.createSpyObj('LocationService', ['getDistance']);
    const employeesServiceSpy = jasmine.createSpyObj('EmployeesService', ['postCommuteDetails']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'showToastMessage',
      'commuteDeductionDetailsError',
    ]);

    TestBed.configureTestingModule({
      declarations: [FySelectCommuteDetailsComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        FormBuilder,
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: LocationService, useValue: locationServiceSpy },
        { provide: EmployeesService, useValue: employeesServiceSpy },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        { provide: SnackbarPropertiesService, useValue: snackbarPropertiesSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FySelectCommuteDetailsComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    formBuilder = TestBed.inject(FormBuilder) as jasmine.SpyObj<FormBuilder>;
    locationService = TestBed.inject(LocationService) as jasmine.SpyObj<LocationService>;
    employeesService = TestBed.inject(EmployeesService) as jasmine.SpyObj<EmployeesService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit():', () => {
    it('should patch values to form controls if existing commute details are present', () => {
      component.existingCommuteDetails = commuteDetailsData;

      component.ngOnInit();

      const homeLocationWithDisplay = {
        ...commuteDetailsData.home_location,
        display: commuteDetailsData.home_location.formatted_address,
      };

      const workLocationWithDisplay = {
        ...commuteDetailsData.work_location,
        display: commuteDetailsData.work_location.formatted_address,
      };

      expect(component.commuteDetails.value).toEqual({
        homeLocation: homeLocationWithDisplay,
        workLocation: workLocationWithDisplay,
      });
    });

    it('should set empty form if existing commute details are not present', () => {
      component.ngOnInit();

      expect(component.commuteDetails.value).toEqual({
        homeLocation: null,
        workLocation: null,
      });
    });
  });

  describe('getCalculatedDistance()', () => {
    it('should return distance in KM if distance unit is KM', () => {
      const distanceInMeters = 21000;
      const distanceUnit = 'KM';

      const distance = component.getCalculatedDistance(distanceInMeters, distanceUnit);

      expect(distance).toBe(21);
    });

    it('should return distance in Miles if distance unit is MILES', () => {
      const distanceInMeters = 21000;
      const distanceUnit = 'MILES';

      const distance = component.getCalculatedDistance(distanceInMeters, distanceUnit);

      expect(distance).toBe(13.0473);
    });
  });

  it('formatLocation(): should return location without display', () => {
    const location = {
      formatted_address: 'Home',
      display: 'Home',
      latitude: 12.9715987,
      longitude: 77.5945667,
      country: 'India',
      state: 'Karnataka',
      city: 'Bangalore',
    };

    const formattedLocation = component.formatLocation(location);

    expect(formattedLocation).toEqual({
      formatted_address: 'Home',
      latitude: 12.9715987,
      longitude: 77.5945667,
      country: 'India',
      state: 'Karnataka',
      city: 'Bangalore',
    });
  });

  it('showToastMessage(): should show toast message', () => {
    const message = 'Commute Details updated successfully!';
    snackbarProperties.setSnackbarProperties.and.returnValue(snackbarPropertiesRes2);
    component.showToastMessage(message, ToastType.SUCCESS, 'msb-success');

    expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      ...snackbarPropertiesRes2,
      panelClass: ['msb-success'],
    });
    expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('success', { message });
    expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({ ToastContent: message });
  });
});
