import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GenericFieldsFormComponent } from './generic-fields-form.component';
import { NG_VALUE_ACCESSOR, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { dependentCustomProperties } from 'src/app/core/mock-data/custom-property.data';
import { AllowedPaymentModes } from 'src/app/core/models/allowed-payment-modes.enum';
import { getTranslocoTestingModule } from 'src/app/core/testing/transloco-testing.utils';
import { FySelectComponent } from 'src/app/shared/components/fy-select/fy-select.component';

// app-fy-select
@Component({
  selector: 'app-fy-select',
  template: '<div></div>',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: MockFySelectComponent, multi: true }],
})
export class MockFySelectComponent {
  writeValue(value: any): void {}
  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}
  setDisabledState(isDisabled: boolean): void {}
}

describe('GenericFieldsFormComponent', () => {
  let component: GenericFieldsFormComponent;
  let fixture: ComponentFixture<GenericFieldsFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ getTranslocoTestingModule(), GenericFieldsFormComponent],
      providers: [
        UntypedFormBuilder,
      ],
    })
    .overrideComponent(GenericFieldsFormComponent, {
      remove: {
        imports: [FySelectComponent],
      },
      add: {
        imports: [MockFySelectComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      },
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericFieldsFormComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit():', () => {
    it('should emit categoryChanged event if category option changes', () => {
      spyOn(component.categoryChanged, 'emit');
      component.ngOnInit();
      component.genericFieldsFormGroup.controls.category.setValue(32108);
      expect(component.categoryChanged.emit).toHaveBeenCalledOnceWith(32108);
    });

    it('should assign projectDependentFields to projectDependentFieldsMapping.projectId if project option changes', () => {
      component.projectDependentFieldsMapping = {
        3943: dependentCustomProperties,
      };
      component.ngOnInit();
      expect(component.projectDependentFields).toEqual([]);
      component.genericFieldsFormGroup.controls.project.setValue(3943);
      expect(component.projectDependentFields).toEqual(dependentCustomProperties);
    });

    it('should assign costCenterDependentFields to costCenterDependentFieldsMapping.costCenterId if cost center option changes', () => {
      component.costCenterDependentFieldsMapping = {
        13795: dependentCustomProperties,
      };
      component.ngOnInit();
      expect(component.costCenterDependentFields).toEqual([]);
      component.genericFieldsFormGroup.controls.costCenter.setValue(13795);
      expect(component.costCenterDependentFields).toEqual(dependentCustomProperties);
    });

    it('should emit paymentModeChanged event if payment mode option changes', () => {
      spyOn(component.paymentModeChanged, 'emit');
      component.ngOnInit();
      component.genericFieldsFormGroup.controls.paymentMode.setValue(AllowedPaymentModes.PERSONAL_CASH_ACCOUNT);
      expect(component.paymentModeChanged.emit).toHaveBeenCalledOnceWith(AllowedPaymentModes.PERSONAL_CASH_ACCOUNT);
    });

    it('should emit receiptChanged event if receipt option changes', () => {
      spyOn(component.receiptChanged, 'emit');
      component.ngOnInit();
      component.genericFieldsFormGroup.controls.receipts_from.setValue('txErhlkzewZF');
      expect(component.receiptChanged.emit).toHaveBeenCalledOnceWith('txErhlkzewZF');
    });

    it('should emit fieldsTouched event if any field is touched', () => {
      spyOn(component.fieldsTouched, 'emit');
      spyOn(component, 'isFieldTouched').and.returnValues(true);
      component.ngOnInit();
      component.genericFieldsFormGroup.controls.amount.setValue(100);
      expect(component.fieldsTouched.emit).toHaveBeenCalledOnceWith(['amount']);
    });
  });

  it('ngOnDestroy(): should unsubscribe from onChangeSub', () => {
    component.onChangeSub = jasmine.createSpyObj('onChangeSub', ['unsubscribe']);
    component.ngOnDestroy();
    expect(component.onChangeSub.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('writeValue(): should patch value to form control', () => {
    component.genericFieldsFormGroup = new UntypedFormBuilder().group({
      location_1: new UntypedFormControl(),
    });
    const newValue = new UntypedFormBuilder().group({
      location_1: new UntypedFormControl(200),
    });
    spyOn(component.genericFieldsFormGroup, 'patchValue');
    component.writeValue(newValue);
    expect(component.genericFieldsFormGroup.patchValue).toHaveBeenCalledOnceWith(newValue);
  });

  it('registerOnChange(): should subscribe to value changes', () => {
    const onChange = (): void => {};
    spyOn(component.genericFieldsFormGroup.valueChanges, 'subscribe');
    component.registerOnChange(onChange);
    expect(component.genericFieldsFormGroup.valueChanges.subscribe).toHaveBeenCalledOnceWith(onChange);
  });

  it('registerOnTouched(): should set onTouched', () => {
    const onTouched = (): void => {};
    component.registerOnTouched(onTouched);
    expect(component.onTouched).toEqual(onTouched);
  });
});
