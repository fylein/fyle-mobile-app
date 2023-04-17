import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { MileageService } from 'src/app/core/services/mileage.service';
import { RouteSelectorModalComponent } from './route-selector-modal.component';
import { FormArray, FormBuilder, FormsModule, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { mileageLocationData1 } from 'src/app/core/mock-data/mileage-location.data';
import { FyLocationComponent } from '../../fy-location/fy-location.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { of } from 'rxjs';

fdescribe('RouteSelectorModalComponent', () => {
  let component: RouteSelectorModalComponent;
  let fixture: ComponentFixture<RouteSelectorModalComponent>;
  let fb: jasmine.SpyObj<FormBuilder>;
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
        FormBuilder,
        NgControl,
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
    fb = TestBed.inject(FormBuilder) as jasmine.SpyObj<FormBuilder>;

    mileageService.getDistance.and.returnValue(of(20));
    component.mileageConfig = orgSettingsRes.mileage;
    component.formInitialized = true;
    component.form = fb.group({
      mileageLocations: new FormArray([]),
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
