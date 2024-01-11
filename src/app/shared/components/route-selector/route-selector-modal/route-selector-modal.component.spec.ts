import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
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
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { of } from 'rxjs';

describe('RouteSelectorModalComponent', () => {
  let component: RouteSelectorModalComponent;
  let fixture: ComponentFixture<RouteSelectorModalComponent>;
  let fb: jasmine.SpyObj<UntypedFormBuilder>;
  let modalController: jasmine.SpyObj<ModalController>;
  let mileageService: jasmine.SpyObj<MileageService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const mileageServiceSpy = jasmine.createSpyObj('MileageService', ['getDistance']);
    TestBed.configureTestingModule({
      declarations: [RouteSelectorModalComponent, FyLocationComponent],
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule,
        FormsModule,
        MatIconTestingModule,
        MatIconModule,
        MatCheckboxModule,
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
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(RouteSelectorModalComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    mileageService = TestBed.inject(MileageService) as jasmine.SpyObj<MileageService>;
    fb = TestBed.inject(UntypedFormBuilder) as jasmine.SpyObj<UntypedFormBuilder>;

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
    expect(component.distance).toEqual(null);
    expect(mileageService.getDistance).toHaveBeenCalledTimes(2);
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
    expect(mileageService.getDistance).toHaveBeenCalledTimes(1);
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
    expect(mileageService.getDistance).toHaveBeenCalledTimes(2);
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
