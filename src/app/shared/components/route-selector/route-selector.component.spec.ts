import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { RouteSelectorComponent } from './route-selector.component';
import { Injector, NO_ERRORS_SCHEMA, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { RouteSelectorModalComponent } from './route-selector-modal/route-selector-modal.component';
import { expenseFieldsMapResponse3 } from 'src/app/core/mock-data/expense-fields-map.data';
import { mileageLocationData1, mileageLocationData4 } from '../../../core/mock-data/mileage-location.data';
import { of } from 'rxjs';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatIconModule } from '@angular/material/icon';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

describe('RouteSelectorComponent', () => {
  let component: RouteSelectorComponent;
  let fixture: ComponentFixture<RouteSelectorComponent>;
  let fb: jasmine.SpyObj<FormBuilder>;
  let modalController: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const injectorSpy = jasmine.createSpyObj('Injector', ['get']);
    TestBed.configureTestingModule({
      declarations: [RouteSelectorComponent],
      imports: [IonicModule.forRoot(), MatCheckboxModule, ReactiveFormsModule, MatIconTestingModule, MatIconModule],
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
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(RouteSelectorComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder) as jasmine.SpyObj<FormBuilder>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    component.mileageConfig = orgSettingsRes.mileage;
    component.skipRoundTripUpdate = false;
    component.formInitialized = true;
    component.onChangeSub = of(null).subscribe();
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
    expect(component.form.controls.distance.value).toEqual('20.00');
    expect(component.form.controls.roundTrip.value).toEqual(true);
  });

  it('writeValue(): should write value to the form group', () => {
    component.writeValue({
      mileageLocations: mileageLocationData4,
    });
    expect(component.mileageLocations.length).toEqual(2);
  });

  it('registerOnChange(): should register changed value', async () => {
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

  it('ngDoCheck(): should check if parent is touched', () => {
    component.touchedInParent = true;
    component.ngDoCheck();
    fixture.detectChanges();

    expect(component.form.controls.distance.touched).toBeTrue();
    expect(component.form.controls.mileageLocations.touched).toBeTrue();
    expect(component.form.controls.roundTrip.touched).toBeTrue();
  });

  it('ngOnChanges(): should call config change methods if input changes', () => {
    spyOn(component, 'onMileageConfigChange');
    spyOn(component, 'onTxnFieldsChange');

    const changes: SimpleChanges = {
      mileageConfig: {
        firstChange: false,
        isFirstChange: () => false,
        previousValue: orgSettingsRes.mileage,
        currentValue: {},
      },
      txnFields: {
        firstChange: false,
        isFirstChange: () => false,
        previousValue: orgSettingsRes.mileage,
        currentValue: {},
      },
    };

    component.ngOnChanges(changes);
    expect(component.onMileageConfigChange).toHaveBeenCalledTimes(1);
    expect(component.onTxnFieldsChange).toHaveBeenCalledTimes(1);
  });

  describe('validate():', () => {
    it('should return null of the form is valid', () => {
      const result = component.validate(component.mileageConfig);
      expect(result).toBeNull();
    });

    it('should validate form control', () => {
      component.form.controls.distance.setValue(null);
      const result = component.validate(component.mileageConfig);
      expect(result).toEqual({
        required: true,
      });
    });
  });

  it('onTxnFieldsChange():', () => {
    spyOn(component, 'ngOnChanges');
    component.txnFields = expenseFieldsMapResponse3;
    component.onTxnFieldsChange();

    expect(component.form.controls.distance.hasValidator(Validators.required)).toBeFalse();
    expect(component.form.controls.mileageLocations.hasValidator(Validators.required)).toBeFalse();
  });

  it('should show mandatory symbol if location is required', () => {
    component.mileageConfig.location_mandatory = true;
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.route-selector--mandatory'))).toEqual('*');
  });

  it('should open modal if clicked on location', () => {
    spyOn(component, 'openModal');

    const locationCard = getElementBySelector(fixture, '.route-selector--input') as HTMLElement;
    click(locationCard);
    expect(component.openModal).toHaveBeenCalledTimes(1);
  });
});
