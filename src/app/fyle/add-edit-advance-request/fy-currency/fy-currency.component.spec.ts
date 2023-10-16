import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { FyCurrencyComponent } from './fy-currency.component';
import { FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { Injector, NO_ERRORS_SCHEMA } from '@angular/core';
import { FyCurrencyChooseCurrencyComponent } from './fy-currency-choose-currency/fy-currency-choose-currency.component';
import { properties } from 'src/app/core/mock-data/modal-properties.data';

describe('FyCurrencyComponent', () => {
  let component: FyCurrencyComponent;
  let fixture: ComponentFixture<FyCurrencyComponent>;
  let formBuilder: FormBuilder;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;

  const mockCurrency = {
    amount: 100,
    currency: 'USD',
  };

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const injectorSpy = jasmine.createSpyObj('Injector', ['get']);

    TestBed.configureTestingModule({
      declarations: [FyCurrencyComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        FormBuilder,
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: ModalPropertiesService, useValue: modalPropertiesSpy },
        { provide: Injector, useValue: injectorSpy },
        {
          provide: NgControl,
          useValue: {
            control: new FormControl(),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FyCurrencyComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    fixture.debugElement.injector.get(NG_VALUE_ACCESSOR);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set value if form value changes', () => {
    component.fg.setValue(mockCurrency);
    expect(component.value).toEqual(mockCurrency);
  });

  describe('get valid():', () => {
    it('should return true if control is touched and valid', () => {
      //@ts-ignore
      component.ngControl.touched = true;
      //@ts-ignore
      component.ngControl.valid = true;
      expect(component.valid).toBeTrue();
    });

    it('should return false if control is touched and invalid', () => {
      //@ts-ignore
      component.ngControl.touched = true;
      //@ts-ignore
      component.ngControl.valid = false;
      expect(component.valid).toBeFalse();
    });

    it('should return true if control is untouched', () => {
      //@ts-ignore
      component.ngControl.touched = false;
      //@ts-ignore
      component.ngControl.valid = false;
      expect(component.valid).toBeTrue();
    });
  });

  it('get value(): should return innerValue', () => {
    //@ts-ignore
    component.innerValue = mockCurrency;
    expect(component.value).toEqual(mockCurrency);
  });

  it('set value(): should set innerValue and call onChangeCallback', () => {
    const formValueSpy = spyOn(component, 'convertInnerValueToFormValue').and.returnValue(mockCurrency);
    //@ts-ignore
    const onChangeCallbackSpy = spyOn(component, 'onChangeCallback');
    component.value = mockCurrency;
    expect(component.value).toEqual(mockCurrency);
    expect(formValueSpy).toHaveBeenCalledOnceWith(mockCurrency);
    expect(onChangeCallbackSpy).toHaveBeenCalledTimes(1);
  });

  it('convertInnerValueToFormValue(): should return amount as null and currency as homeCurrency if inner value is not defined', () => {
    component.homeCurrency = 'INR';
    expect(component.convertInnerValueToFormValue(undefined)).toEqual({
      amount: null,
      currency: 'INR',
    });
  });

  it('onBlur(): should call onTouchedCallback', () => {
    //@ts-ignore
    const onTouchedCallbackSpy = spyOn(component, 'onTouchedCallback');
    component.onBlur();
    expect(onTouchedCallbackSpy).toHaveBeenCalledTimes(1);
  });

  it('writeValue(): should set innerValue and form value', () => {
    const formValueSpy = spyOn(component, 'convertInnerValueToFormValue').and.returnValue(mockCurrency);
    component.writeValue(mockCurrency);
    expect(formValueSpy).toHaveBeenCalledOnceWith(mockCurrency);
    expect(component.fg.value).toEqual(mockCurrency);
  });

  it('registerOnChange(): should set onChangeCallback', () => {
    const mockFn = () => {};
    component.registerOnChange(mockFn);
    //@ts-ignore
    expect(component.onChangeCallback).toEqual(mockFn);
  });

  it('registerOnTouched(): should set onTouchedCallback', () => {
    const mockFn = () => {};
    component.registerOnTouched(mockFn);
    //@ts-ignore
    expect(component.onTouchedCallback).toEqual(mockFn);
  });

  it('openCurrencyModal(): should open currency modal', fakeAsync(() => {
    const currencyModalSpy = jasmine.createSpyObj('currencyModal', ['present', 'onWillDismiss']);
    currencyModalSpy.onWillDismiss.and.resolveTo({
      data: { currency: { shortCode: 'USD', longName: 'United States Dollar' } },
    });
    modalController.create.and.resolveTo(currencyModalSpy);
    modalProperties.getModalDefaultProperties.and.returnValue(properties);
    component.openCurrencyModal();
    tick(100);
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: FyCurrencyChooseCurrencyComponent,
      componentProps: {
        currentSelection: null,
      },
      mode: 'ios',
      ...properties,
    });
    expect(currencyModalSpy.present).toHaveBeenCalledTimes(1);
    expect(currencyModalSpy.onWillDismiss).toHaveBeenCalledTimes(1);
  }));
});
