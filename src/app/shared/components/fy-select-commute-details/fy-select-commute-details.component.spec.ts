import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule, ModalController } from '@ionic/angular';

import { FySelectCommuteDetailsComponent } from './fy-select-commute-details.component';
import { UntypedFormBuilder, Validators } from '@angular/forms';
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
import { orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { of, throwError } from 'rxjs';
import { cloneDeep } from 'lodash';
import { locationData1, locationData2 } from 'src/app/core/mock-data/location.data';
import { commuteDetailsResponseData } from 'src/app/core/mock-data/commute-details-response.data';
import { Location } from 'src/app/core/models/location.model';
import { HttpErrorResponse } from '@angular/common/http';

describe('FySelectCommuteDetailsComponent', () => {
  let component: FySelectCommuteDetailsComponent;
  let fixture: ComponentFixture<FySelectCommuteDetailsComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let formBuilder: jasmine.SpyObj<UntypedFormBuilder>;
  let locationService: jasmine.SpyObj<LocationService>;
  let employeesService: jasmine.SpyObj<EmployeesService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
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
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), TranslocoModule, FySelectCommuteDetailsComponent],
      providers: [
        UntypedFormBuilder,
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: LocationService, useValue: locationServiceSpy },
        { provide: EmployeesService, useValue: employeesServiceSpy },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        { provide: SnackbarPropertiesService, useValue: snackbarPropertiesSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: TranslocoService, useValue: translocoServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FySelectCommuteDetailsComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    formBuilder = TestBed.inject(UntypedFormBuilder) as jasmine.SpyObj<UntypedFormBuilder>;
    locationService = TestBed.inject(LocationService) as jasmine.SpyObj<LocationService>;
    employeesService = TestBed.inject(EmployeesService) as jasmine.SpyObj<EmployeesService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fySelectCommuteDetails.saving': 'Saving',
        'fySelectCommuteDetails.save': 'Save',
        'fySelectCommuteDetails.title': 'Commute details',
        'fySelectCommuteDetails.homeLabel': 'Home',
        'fySelectCommuteDetails.enterLocation': 'Enter location',
        'fySelectCommuteDetails.errorSelectHome': 'Please select home location',
        'fySelectCommuteDetails.workLabel': 'Work',
        'fySelectCommuteDetails.errorSelectWork': 'Please select work location',
        'fySelectCommuteDetails.saveError':
          'We were unable to save your commute details. Please enter correct home and work location.',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });
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

      expect(distance).toBe(13.05);
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

  describe('save():', () => {
    let homeLocation: Location;
    let workLocation: Location;
    let homeLocationWithoutDisplay: Location;
    let workLocationWithoutDisplay: Location;

    beforeEach(() => {
      homeLocation = cloneDeep(locationData1);
      workLocation = cloneDeep(locationData2);
      homeLocationWithoutDisplay = cloneDeep(locationData1);
      workLocationWithoutDisplay = cloneDeep(locationData2);

      delete homeLocationWithoutDisplay.display;
      delete workLocationWithoutDisplay.display;

      component.commuteDetails = formBuilder.group({
        homeLocation: [homeLocation, Validators.required],
        workLocation: [workLocation, Validators.required],
      });
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      locationService.getDistance.and.returnValue(of(21000));
      spyOn(component, 'getCalculatedDistance').and.returnValue(21);
      employeesService.postCommuteDetails.and.returnValue(of({ data: commuteDetailsResponseData.data[0] }));
    });

    it('should mark all fields as touched if form is invalid', () => {
      component.commuteDetails = formBuilder.group({
        homeLocation: [null, Validators.required],
        workLocation: [null, Validators.required],
      });

      component.save();

      expect(component.commuteDetails.controls.homeLocation.touched).toBeTrue();
      expect(component.commuteDetails.controls.workLocation.touched).toBeTrue();
    });

    it('should save commute details if form is valid', fakeAsync(() => {
      component.save();
      tick(100);

      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      expect(locationService.getDistance).toHaveBeenCalledOnceWith(homeLocation, workLocation);
      expect(component.getCalculatedDistance).toHaveBeenCalledOnceWith(21000, 'MILES');
      expect(employeesService.postCommuteDetails).toHaveBeenCalledOnceWith({
        distance: 21,
        distance_unit: 'MILES',
        home_location: homeLocationWithoutDisplay,
        work_location: workLocationWithoutDisplay,
      });
      expect(modalController.dismiss).toHaveBeenCalledOnceWith({
        action: 'save',
        commuteDetails: commuteDetailsResponseData.data[0],
      });
    }));

    it('should show error toast message and track event if postCommuteDetails API throws error', fakeAsync(() => {
      const errorResponse = new HttpErrorResponse({ error: 'API ERROR', status: 400 });
      employeesService.postCommuteDetails.and.throwError(errorResponse);
      spyOn(component, 'showToastMessage');

      try {
        component.save();
        tick(100);
      } catch (err) {
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(locationService.getDistance).toHaveBeenCalledOnceWith(homeLocation, workLocation);
        expect(component.getCalculatedDistance).toHaveBeenCalledOnceWith(21000, 'MILES');
        expect(employeesService.postCommuteDetails).toHaveBeenCalledOnceWith({
          distance: 21,
          distance_unit: 'MILES',
          home_location: homeLocationWithoutDisplay,
          work_location: workLocationWithoutDisplay,
        });
        expect(modalController.dismiss).not.toHaveBeenCalled();
        expect(trackingService.commuteDeductionDetailsError).toHaveBeenCalledOnceWith(errorResponse);
        expect(component.showToastMessage).toHaveBeenCalledOnceWith(
          'We were unable to save your commute details. Please enter correct home and work location.',
          ToastType.FAILURE,
          'msb-failure',
        );
      }
    }));
  });

  it('close(): should dismiss modal with action as cancel', () => {
    component.close();

    expect(modalController.dismiss).toHaveBeenCalledOnceWith({ action: 'cancel' });
  });
});
