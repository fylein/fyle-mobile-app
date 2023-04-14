import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { RouteSelectorComponent } from './route-selector.component';
import { Injector } from '@angular/core';
import { FormArray, FormBuilder, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { MileageLocation } from '../route-visualizer/mileage-locations';
import { RouteSelectorModalComponent } from './route-selector-modal/route-selector-modal.component';
import { expenseFieldsMapResponse3 } from 'src/app/core/mock-data/expense-fields-map.data';

export const mileageLocationData1: MileageLocation[] = [
  {
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    display: 'Kolkata',
    formatted_address: 'Moore Avenue',
    latitude: 22.4860708,
    longitude: 88.3506995,
  },
  {
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    display: 'Kolkata',
    formatted_address: 'Bhawanipur',
    latitude: 22.532432,
    longitude: 88.3445775,
  },
];

export const mileageLocationData2: MileageLocation[] = [
  {
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    display: 'Kolkata',
    formatted_address: 'Moore Avenue',
    latitude: 22.4860708,
    longitude: 88.3506995,
  },
];

fdescribe('RouteSelectorComponent', () => {
  let component: RouteSelectorComponent;
  let fixture: ComponentFixture<RouteSelectorComponent>;
  let fb: jasmine.SpyObj<FormBuilder>;
  let modalController: jasmine.SpyObj<ModalController>;
  let injector: jasmine.SpyObj<Injector>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const injectorSpy = jasmine.createSpyObj('Injector', ['get']);
    TestBed.configureTestingModule({
      declarations: [RouteSelectorComponent],
      imports: [IonicModule.forRoot(), MatCheckboxModule, ReactiveFormsModule],
      providers: [
        NgControl,
        FormBuilder,
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: Injector,
          useValue: injectorSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(RouteSelectorComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder) as jasmine.SpyObj<FormBuilder>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    injector = TestBed.inject(Injector) as jasmine.SpyObj<Injector>;
    component.mileageConfig = orgSettingsRes.mileage;
    component.skipRoundTripUpdate = false;
    component.formInitialized = true;
    component.form = fb.group({
      mileageLocations: new FormArray([]),
      distance: [, Validators.required],
      roundTrip: [],
    });
    component.form.controls.distance.setValue(10);
    component.form.controls.roundTrip.setValue(10);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('customDistanceValidator(): should validate distance form control', () => {
    component.form.controls.distance.setValue(10);
    fixture.detectChanges();
    const result = component.customDistanceValidator(component.form.controls.distance);
    expect(result).toBeNull();
  });

  it('writeValue(): should write value to the form group', () => {
    component.writeValue({
      mileageLocations: mileageLocationData1,
      distance: 10,
      roundTrip: true,
    });
    expect(component.mileageLocations.length).toEqual(mileageLocationData1.length);
  });

  it('registerOnTouched(): should register changed value', async () => {
    const changeTestCallback = jasmine.createSpyObj('changeTested', ['test']);
    component.registerOnChange(changeTestCallback.test);

    component.form.controls.distance.setValue(10);

    fixture.whenStable();

    expect(changeTestCallback.test).toHaveBeenCalled();
  });

  it('registerOnTouched(): should registered onTouched property', () => {
    const touchFn = () => {
      component.form.markAsDirty();
    };
    component.registerOnTouched(touchFn);

    fixture.whenStable();

    expect(component.onTouched).toEqual(touchFn);
  });

  describe('setDisabledState():', () => {
    it(' should disable the form', () => {
      component.setDisabledState(true);
      expect(component.form.disabled).toBeTrue();
    });

    it('should enable the form', () => {
      component.setDisabledState(false);
      expect(component.form.disabled).toBeFalse();
    });
  });

  it('openModal(): should open the modal', async () => {
    modalController.create.and.returnValue(
      new Promise((resolve) => {
        const selectionModalSpy = jasmine.createSpyObj('selectionModal', ['present', 'onWillDismiss']);

        selectionModalSpy.onWillDismiss.and.returnValue(
          new Promise((resInt) => {
            resInt({
              data: {
                mileageLocations: mileageLocationData1,
                distance: 20,
              },
            });
          })
        );
        resolve(selectionModalSpy);
      })
    );

    fixture.detectChanges();

    component.openModal();
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: RouteSelectorModalComponent,
      componentProps: {
        unit: component.unit,
        mileageConfig: component.mileageConfig,
        isDistanceMandatory: component.isDistanceMandatory,
        isAmountDisabled: component.isAmountDisabled,
        txnFields: component.txnFields,
        value: component.form.value,
        recentlyUsedMileageLocations: component.recentlyUsedMileageLocations,
      },
    });
  });

  it('onMileageConfigChange(): should update form group if mileage config changes', () => {
    component.onMileageConfigChange();

    expect(component.form.controls.mileageLocations.hasValidator(Validators.required)).toBeTrue();
  });

  it('onTxnFieldsChange():', () => {
    component.txnFields = expenseFieldsMapResponse3;
    component.onTxnFieldsChange();
  });
});
