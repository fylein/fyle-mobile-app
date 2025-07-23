import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { MileageService } from 'src/app/core/services/mileage.service';
import { RouteSelectorModalComponent } from './route-selector-modal.component';
import { UntypedFormArray, UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { mileageLocationData1, mileageLocationData2 } from 'src/app/core/mock-data/mileage-location.data';
import { FyLocationComponent } from '../../fy-location/fy-location.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { of } from 'rxjs';

describe('RouteSelectorModalComponent', () => {
  let component: RouteSelectorModalComponent;
  let fixture: ComponentFixture<RouteSelectorModalComponent>;
  let fb: jasmine.SpyObj<UntypedFormBuilder>;
  let modalController: jasmine.SpyObj<ModalController>;
  let mileageService: jasmine.SpyObj<MileageService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const mileageServiceSpy = jasmine.createSpyObj('MileageService', ['getDistance']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
    imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule,
        FormsModule,
        MatIconTestingModule,
        MatIconModule,
        MatCheckboxModule,
        TranslocoModule,
        RouteSelectorModalComponent, FyLocationComponent,
    ],
    providers: [
        UntypedFormBuilder,
        {
            provide: ModalController,
            useValue: modalControllerSpy,
        },
        {
            provide: MileageService,
            useValue: mileageServiceSpy,
        },
        {
            provide: TranslocoService,
            useValue: translocoServiceSpy,
        },
    ],
    schemas: [NO_ERRORS_SCHEMA],
}).compileComponents();
    fixture = TestBed.createComponent(RouteSelectorModalComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    mileageService = TestBed.inject(MileageService) as jasmine.SpyObj<MileageService>;
    fb = TestBed.inject(UntypedFormBuilder) as jasmine.SpyObj<UntypedFormBuilder>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'routeSelector.roundTrip': 'Round Trip',
        'routeSelector.oneWay': 'One Way',
        'routeSelector.distance': 'Distance',
        'routeSelector.routeLabel': 'Route',
        'routeSelector.startLabel': 'Start',
        'routeSelector.selectLocationError': 'Please select location',
        'routeSelector.intermediateStop': 'Stop',
        'routeSelector.stopLabel': 'Stop',
        'routeSelector.enterRoute': 'Enter route',
        'routeSelector.roundTripLabel': 'Round trip',
        'routeSelector.distanceLabel': 'Distance',
        'routeSelector.enterDistance': 'Enter distance',
        'routeSelector.invalidDistance': 'Please enter valid distance',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });
    mileageService.getDistance.and.returnValue(of(20));
    component.mileageConfig = orgSettingsRes.mileage;
    component.formInitialized = true;
    component.form = fb.group({
      mileageLocations: new UntypedFormArray([]),
      roundTrip: [],
    });
    component.value = {
      mileageLocations: mileageLocationData1,
      distance: 10,
      roundTrip: 10,
    };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set distance if roundTrip is null', () => {
    component.value = {
      distance: 10,
      roundTrip: null,
    };
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.mileageLocations.length).toEqual(4);
    expect(component.distance).toEqual('0.02');
  });

  it('add form control to mileage locations if empty', () => {
    component.value = {
      distance: 10,
      roundTrip: 10,
    };
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.mileageLocations.length).toEqual(4);
    expect(component.distance).toEqual('0.08');
  });

  it('should reset distance if mileageLocations is changed and distance is null', () => {
    mileageService.getDistance.and.returnValue(of(null));
    component.value = {
      mileageLocations: mileageLocationData2,
      distance: null,
      roundTrip: 10,
    };

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.mileageLocations.length).toEqual(4);
    expect(component.distance).toBeNull();
    expect(mileageService.getDistance).toHaveBeenCalledTimes(4);
  });

  it('should reset distance if mileageLocations is changed if distance is 0', () => {
    mileageService.getDistance.and.returnValue(of(0));
    component.value = {
      mileageLocations: [mileageLocationData1[0]],
      distance: null,
      roundTrip: 10,
    };

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.mileageLocations.length).toEqual(3);
    expect(component.distance).toEqual('0.00');
    expect(mileageService.getDistance).toHaveBeenCalledTimes(2);
  });

  it('should reset distance if mileageLocations is changed if distance is received but round trip is false', () => {
    mileageService.getDistance.and.returnValue(of(10));
    component.value = {
      mileageLocations: mileageLocationData2,
      distance: null,
      roundTrip: null,
    };
    component.unit = 'MILES';
    component.form.controls.roundTrip.setValue(false);

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.mileageLocations.length).toEqual(4);
    expect(component.distance).toEqual('0.01');
    expect(mileageService.getDistance).toHaveBeenCalledTimes(4);
  });

  it('addMileageLocation(): should add mileage location', () => {
    const prevVal = component.mileageLocations.length;
    component.addMileageLocation();
    expect(component.mileageLocations.length).toEqual(prevVal + 1);
  });

  it('removeMileageLocation(): should remove mileage location', () => {
    const prevVal = component.mileageLocations.length;
    component.removeMileageLocation(1);
    expect(component.mileageLocations.length).toEqual(prevVal - 1);
  });

  describe('customDistanceValidator():', () => {
    it('create custom validator if distance is valid', () => {
      const result = component.customDistanceValidator(component.form.controls.roundTrip);
      expect(result).toBeNull();
    });

    it('return null if distance is null', () => {
      const result = component.customDistanceValidator(component.form.controls.mileageLocations);
      expect(result).toEqual({ invalidDistance: true });
    });
  });

  describe('save():', () => {
    it('should save changes and close modal if form is valid ', () => {
      modalController.dismiss.and.returnValue(new Promise(null));

      component.save();
      expect(modalController.dismiss).toHaveBeenCalledOnceWith({
        ...component.form.value,
        distance: component.distance,
      });
    });

    it('should mark all fields as touched if form is invalid', () => {
      spyOn(component.form, 'markAllAsTouched');
      component.form.controls.mileageLocations.setErrors({ require: true });

      component.save();
      expect(component.form.markAllAsTouched).toHaveBeenCalledTimes(1);
    });
  });

  it('close(): should close modal', () => {
    modalController.dismiss.and.returnValue(new Promise(null));
    component.close();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });
});
