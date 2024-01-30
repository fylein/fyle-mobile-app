import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { RouteSelectorComponent } from './route-selector.component';
import { Injector, NO_ERRORS_SCHEMA, SimpleChanges } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { RouteSelectorModalComponent } from './route-selector-modal/route-selector-modal.component';
import { expenseFieldsMapResponse3 } from 'src/app/core/mock-data/expense-fields-map.data';
import { mileageLocationData1, mileageLocationData4 } from '../../../core/mock-data/mileage-location.data';
import { of } from 'rxjs';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatIconModule } from '@angular/material/icon';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { By } from '@angular/platform-browser';

describe('RouteSelectorComponent', () => {
  let component: RouteSelectorComponent;
  let fixture: ComponentFixture<RouteSelectorComponent>;
  let fb: jasmine.SpyObj<UntypedFormBuilder>;
  let modalController: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const injectorSpy = jasmine.createSpyObj('Injector', ['get']);
    TestBed.configureTestingModule({
      declarations: [RouteSelectorComponent],
      imports: [IonicModule.forRoot(), MatCheckboxModule, ReactiveFormsModule, MatIconTestingModule, MatIconModule],
      providers: [
        UntypedFormBuilder,
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
    fb = TestBed.inject(UntypedFormBuilder) as jasmine.SpyObj<UntypedFormBuilder>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    component.mileageConfig = orgSettingsRes.mileage;
    component.skipRoundTripUpdate = false;
    component.formInitialized = true;
    component.onChangeSub = of(null).subscribe();
    component.form = fb.group({
      mileageLocations: new UntypedFormArray([]),
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

  describe('customDistanceValidator(): ', () => {
    it('should validate distance form control', () => {
      component.form.controls.distance.setValue(10);
      fixture.detectChanges();
      const result = component.customDistanceValidator(component.form.controls.distance);
      expect(result).toBeNull();
    });

    it('should return invalid distance if value not present', () => {
      component.form.controls.distance.setValue(0);
      fixture.detectChanges();
      const result = component.customDistanceValidator(component.form.controls.distance);
      expect(result).toEqual({ invalidDistance: true });
    });
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

    expect(changeTestCallback.test).toHaveBeenCalledOnceWith({ mileageLocations: [], distance: 10, roundTrip: 10 });
  });

  it('registerOnTouched(): should registered onTouched property', async () => {
    const onTouchTested = jasmine.createSpyObj('touchedTested', ['touchedTested']);

    expect(onTouchTested.touchedTested).not.toHaveBeenCalled();

    component.registerOnTouched(onTouchTested.touchedTested);

    const input = fixture.debugElement.query(By.css('.route-selector--input'));
    input.triggerEventHandler('blur', null);

    await fixture.whenStable();
    fixture.detectChanges();
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

  describe('openModal():', () => {
    let selectionModalSpy: jasmine.SpyObj<HTMLIonModalElement>;
    beforeEach(() => {
      selectionModalSpy = jasmine.createSpyObj('selectionModal', ['present', 'onWillDismiss']);
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
      modalController.create.and.resolveTo(selectionModalSpy);
    });

    it('should open the modal', async () => {
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

    it('should open modal and should not update mileageLocations if "data.mileageLocations" is null', async () => {
      selectionModalSpy.onWillDismiss.and.returnValue(
        new Promise((resInt) => {
          resInt({
            data: {
              mileageLocations: null,
              distance: 20,
            },
          });
        })
      );
      modalController.create.and.resolveTo(selectionModalSpy);

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

  describe('onTxnFieldsChange():', () => {
    beforeEach(() => {
      spyOn(component, 'ngOnChanges');
      component.txnFields = expenseFieldsMapResponse3;
    });

    it('should update form validators', () => {
      component.onTxnFieldsChange();
      expect(component.form.controls.distance.hasValidator(Validators.required)).toBeFalse();
      expect(component.form.controls.mileageLocations.hasValidator(Validators.required)).toBeFalse();
    });

    it('should update distance field validator if it distance is mandatory', () => {
      spyOn(component.form, 'updateValueAndValidity');
      spyOn(component.form.controls.distance, 'updateValueAndValidity');
      component.isConnected = true;
      component.txnFields.distance.is_mandatory = true;
      component.onTxnFieldsChange();
      expect(component.form.controls.distance.validator).toBeDefined();
    });

    it('should update distance field validator as null if it is mandatory but isConnected is false', () => {
      component.txnFields.distance.is_mandatory = true;
      component.onTxnFieldsChange();
      expect(component.form.controls.mileageLocations.hasValidator(Validators.required)).toBeFalse();
      expect(component.form.controls.distance.validator).toBeNull();
    });
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
