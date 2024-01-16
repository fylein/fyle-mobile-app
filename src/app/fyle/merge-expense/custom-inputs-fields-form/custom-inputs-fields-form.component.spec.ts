import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CustomInputsFieldsFormComponent } from './custom-inputs-fields-form.component';
import { FormArray, UntypedFormBuilder, FormControl } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  customInputsFieldData1,
  expectedCustomInputsFieldControlValues,
  expectedCustomInputsFieldWithoutControl,
} from 'src/app/core/mock-data/custom-inputs-field.data';

describe('CustomInputsFieldsFormComponent', () => {
  let component: CustomInputsFieldsFormComponent;
  let fixture: ComponentFixture<CustomInputsFieldsFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CustomInputsFieldsFormComponent],
      imports: [IonicModule.forRoot()],
      providers: [UntypedFormBuilder],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomInputsFieldsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(): should initialize formValues correctly', () => {
    component.ngOnInit();
    expect(component.customFieldsForm.value).toEqual({
      fields: [],
    });
  });

  it('generateCustomForm(): should generate form correctly', () => {
    component.customInputs = customInputsFieldData1;
    component.ngOnInit();
    component.generateCustomForm();
    expect(component.customFieldsForm.value).toEqual({
      fields: [
        {
          name: 'Merchant',
          value: 'Jio',
        },
      ],
    });

    const customInputsFieldWithoutControl = component.customFields.map(({ control, ...otherProps }) => ({
      ...otherProps,
    }));
    expect(customInputsFieldWithoutControl).toEqual(expectedCustomInputsFieldWithoutControl);

    const customInputsFieldControlValues = component.customFields.map(({ control }) => control.value);
    expect(customInputsFieldControlValues).toEqual(expectedCustomInputsFieldControlValues);
  });

  it('ngOnDestroy(): should unsubscribe from onChangeSub', () => {
    component.onChangeSub = jasmine.createSpyObj('onChangeSub', ['unsubscribe']);
    component.ngOnDestroy();
    expect(component.onChangeSub.unsubscribe).toHaveBeenCalledTimes(1);
  });

  describe('ngOnChanges():', () => {
    beforeEach(() => {
      spyOn(component, 'generateCustomForm');
    });

    it('should call generateCustomForm() when customFieldsForm is defined', () => {
      component.ngOnChanges();
      expect(component.generateCustomForm).toHaveBeenCalledTimes(1);
    });

    it('should not call generateCustomForm() when customFieldsForm is undefined', () => {
      component.customFieldsForm = undefined;
      component.ngOnChanges();
      expect(component.generateCustomForm).not.toHaveBeenCalled();
    });
  });

  it('writeValue(): should patch value to form control', () => {
    component.customFieldsForm.patchValue({
      fields: [[]],
    });
    const newValue = new UntypedFormBuilder().group({
      name: 'Merchant',
      value: 'Jio',
    });
    spyOn(component.customFieldsForm.controls.fields, 'patchValue');
    component.writeValue(newValue);
    expect(component.customFieldsForm.controls.fields.patchValue).toHaveBeenCalledOnceWith(newValue);
  });

  it('registerOnChange(): should subscribe to value changes', () => {
    const onChange = (): void => {};
    spyOn(component.customFieldsForm.valueChanges, 'subscribe');
    component.registerOnChange(onChange);
    expect(component.customFieldsForm.valueChanges.subscribe).toHaveBeenCalledOnceWith(onChange);
  });

  it('registerOnTouched(): should set onTouched', () => {
    const onTouched = (): void => {};
    component.registerOnTouched(onTouched);
    expect(component.onTouched).toEqual(onTouched);
  });
});
