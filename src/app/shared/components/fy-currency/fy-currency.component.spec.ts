import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, tick, waitForAsync } from '@angular/core/testing';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { of } from 'rxjs';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { FyCurrencyChooseCurrencyComponent } from './fy-currency-choose-currency/fy-currency-choose-currency.component';
import { FyCurrencyExchangeRateComponent } from './fy-currency-exchange-rate/fy-currency-exchange-rate.component';
import { FyCurrencyComponent } from './fy-currency.component';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange, SimpleChanges, forwardRef } from '@angular/core';
import { FyNumberComponent } from '../fy-number/fy-number.component';

describe('FyCurrencyComponent', () => {
  let component: FyCurrencyComponent;
  let fixture: ComponentFixture<FyCurrencyComponent>;
  let fb: FormBuilder;
  let modalController: jasmine.SpyObj<ModalController>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let modalPropertiesService: jasmine.SpyObj<ModalPropertiesService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getExchangeRate']);
    const modalPropertiesServiceSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);

    TestBed.configureTestingModule({
      declarations: [
        FyCurrencyComponent,
        FyCurrencyChooseCurrencyComponent,
        FyCurrencyExchangeRateComponent,
        FyNumberComponent,
      ],
      imports: [IonicModule.forRoot(), FormsModule, ReactiveFormsModule],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: CurrencyService,
          useValue: currencyServiceSpy,
        },
        {
          provide: ModalPropertiesService,
          useValue: modalPropertiesServiceSpy,
        },
        FormBuilder,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FyCurrencyComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    modalPropertiesService = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    component.txnDt = new Date();
    component.recentlyUsed = [];
    component.expanded = true;
    component.touchedInParent = false;
    component.validInParent = true;
    fixture.detectChanges();
  }));
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(): should update the form', fakeAsync(() => {
    currencyService.getExchangeRate.and.returnValue(of(1.5));
    component.homeCurrency = 'USD';
    component.fg.controls.currency.setValue('EUR');
    component.fg.controls.amount.setValue(null);
    component.fg.controls.homeCurrencyAmount.setValue(null);
    component.ngOnInit();
    component.fg.controls.currency.setValue('GBP');
    flushMicrotasks();
    expect(currencyService.getExchangeRate).toHaveBeenCalledWith('GBP', 'USD', component.txnDt);
    expect(component.exchangeRate).toEqual(1.5);
  }));

  it('ngOnInit(): should update the form with new date if txnDt is undefined', fakeAsync(() => {
    currencyService.getExchangeRate.and.returnValue(of(1.5));
    component.homeCurrency = 'USD';
    component.txnDt = undefined;
    component.fg.controls.currency.setValue('EUR');
    component.fg.controls.amount.setValue(null);
    component.fg.controls.homeCurrencyAmount.setValue(null);
    component.ngOnInit();
    component.fg.controls.currency.setValue('GBP');
    flushMicrotasks();
    expect(currencyService.getExchangeRate).toHaveBeenCalledWith('GBP', 'USD', new Date());
    expect(component.exchangeRate).toEqual(1.5);
  }));

  it('should not call getExchangeRate if formValue does not meet certain conditions', () => {
    component.homeCurrency = 'USD';
    component.fg.controls.currency.setValue('USD');
    component.fg.controls.amount.setValue(100);
    component.fg.controls.homeCurrencyAmount.setValue(null);
    component.ngOnInit();
    expect(currencyService.getExchangeRate).not.toHaveBeenCalled();
  });

  it('should update exchangeRate if currency is not equal to homeCurrency', fakeAsync(() => {
    component.homeCurrency = 'USD';
    component.fg.controls.currency.setValue('USD');
    component.fg.controls.amount.setValue(100);
    component.fg.controls.homeCurrencyAmount.setValue(300);
    spyOn(component, 'ngOnInit');
    component.ngOnInit();
    component.fg.controls.currency.setValue('GBP');
    flushMicrotasks();
    expect(currencyService.getExchangeRate).not.toHaveBeenCalled();
    expect(component.value).toEqual({
      amount: 300,
      currency: 'USD',
      orig_amount: 100,
      orig_currency: 'GBP',
    });
    expect(component.exchangeRate).toBe(3);
  }));

  it('ngOnChanges(): should update the exchange rate and inner value if txnDt changes', fakeAsync(() => {
    const previousTxnDt = new Date('2022-01-01');
    const currentTxnDt = new Date('2022-02-01');
    const exchangeRate = 1.5;
    currencyService.getExchangeRate.and.returnValue(of(exchangeRate));

    component.fg = new FormGroup({
      currency: new FormControl('EUR'),
      amount: new FormControl(null),
      homeCurrencyAmount: new FormControl(null),
    });
    component.homeCurrency = 'USD';
    //@ts-ignore
    component.innerValue = {
      currency: 'EUR',
      orig_currency: 'EUR',
      amount: null,
      orig_amount: null,
    };
    component.txnDt = previousTxnDt;

    component.ngOnChanges({
      txnDt: new SimpleChange(previousTxnDt, currentTxnDt, false),
    });

    flushMicrotasks();

    expect(currencyService.getExchangeRate).toHaveBeenCalledWith('EUR', 'USD', previousTxnDt);
    expect(component.exchangeRate).toEqual(exchangeRate);
    //@ts-ignore
    expect(component.innerValue.amount).toEqual(null);
  }));

  it('ngOnChanges(): should update the exchange rate and inner value even if txnDt is undefined', fakeAsync(() => {
    const previousTxnDt = new Date('2022-01-01');
    const currentTxnDt = new Date('2022-02-01');
    const exchangeRate = 1.5;
    currencyService.getExchangeRate.and.returnValue(of(exchangeRate));

    component.fg = new FormGroup({
      currency: new FormControl('EUR'),
      amount: new FormControl(300),
      homeCurrencyAmount: new FormControl(300),
    });
    component.homeCurrency = 'USD';
    //@ts-ignore
    component.innerValue = {
      currency: 'EUR',
      orig_currency: 'EUR',
      amount: 100,
      orig_amount: 200,
    };
    component.txnDt = undefined;

    component.ngOnChanges({
      txnDt: new SimpleChange(previousTxnDt, currentTxnDt, false),
    });

    flushMicrotasks();

    expect(currencyService.getExchangeRate).toHaveBeenCalledWith('EUR', 'USD', new Date());
    expect(component.exchangeRate).toEqual(exchangeRate);
    //@ts-ignore
    expect(component.innerValue.amount).toEqual(300);
    expect(component.fg.value.amount).toBe(200);
    expect(component.fg.value.homeCurrencyAmount).toBe(300);
  }));

  it('should convert inner value to form value correctly', () => {
    component.homeCurrency = 'USD';

    // Test case 1: inner value with different currency
    const innerValue1 = {
      orig_amount: 100,
      orig_currency: 'EUR',
      amount: 120,
      currency: 'GBP',
    };
    const formValue1 = component.convertInnerValueToFormValue(innerValue1);
    expect(formValue1.amount).toBe(100);
    expect(formValue1.currency).toBe('EUR');
    expect(formValue1.homeCurrencyAmount).toBe(120);

    // Test case 2: inner value with same currency
    const innerValue2 = {
      amount: 50,
      currency: 'USD',
    };
    const formValue2 = component.convertInnerValueToFormValue(innerValue2);
    expect(formValue2.amount).toBe(50);
    expect(formValue2.currency).toBe('USD');
    expect(formValue2.homeCurrencyAmount).toBeNull();

    // Test case 3: null inner value
    const innerValue3 = null;
    const formValue3 = component.convertInnerValueToFormValue(innerValue3);
    expect(formValue3.amount).toBeNull();
    expect(formValue3.currency).toBe('USD');
    expect(formValue3.homeCurrencyAmount).toBeNull();
  });

  it('onBlur(): should call onTouchedCallback', () => {
    //@ts-ignore
    spyOn(component, 'onTouchedCallback');
    component.onBlur();
    //@ts-ignore
    expect(component.onTouchedCallback).toHaveBeenCalledTimes(1);
  });

  it('writeValue(): should patch form value with inner value', () => {
    spyOn(component.fg, 'patchValue');
    const mockInnerValue = {
      amount: 100,
      currency: 'USD',
      orig_amount: 80,
      orig_currency: 'EUR',
    };
    component.writeValue(mockInnerValue);
    //@ts-ignore
    expect(component.innerValue).toEqual(mockInnerValue);
    expect(component.fg.patchValue).toHaveBeenCalledWith({
      amount: 80,
      currency: 'EUR',
      homeCurrencyAmount: 100,
    });
  });

  it('registerOnChange(): should set onChangeCallback function', () => {
    const mockCallback = () => {};
    component.registerOnChange(mockCallback);
    //@ts-ignore
    expect(component.onChangeCallback).toEqual(mockCallback);
  });

  it('registerOnTouched(): should set onTouchedCallback function', () => {
    const mockCallback = () => {};
    component.registerOnTouched(mockCallback);
    //@ts-ignore
    expect(component.onTouchedCallback).toEqual(mockCallback);
  });

  it('should set exchange Rate correctly', fakeAsync(() => {
    component.fg = new FormGroup({
      currency: new FormControl('USD'),
      amount: new FormControl(50),
      homeCurrencyAmount: new FormControl(50),
    });
    component.homeCurrency = 'EUR';
    component.value = {
      currency: 'EUR',
      orig_amount: 20,
      orig_currency: 'USD',
      amount: 100,
    };
    component.txnDt = new Date();
    fixture.detectChanges();
    modalController.create.and.returnValue(
      Promise.resolve({
        present: () => {},
        onWillDismiss: () => Promise.resolve({ data: { amount: 100, homeCurrencyAmount: 500 } }),
      } as any)
    );
    component.setExchangeRate('USD');
    tick(1000);
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: FyCurrencyExchangeRateComponent,
      componentProps: {
        amount: 20,
        currentCurrency: 'EUR',
        newCurrency: 'USD',
        txnDt: component.txnDt,
        exchangeRate: 5,
      },
      mode: 'ios',
      ...modalPropertiesService.getModalDefaultProperties('fy-modal stack-modal'),
    });
    expect(component.fg.value).toEqual({
      currency: 'USD',
      amount: 100,
      homeCurrencyAmount: 500,
    });
  }));

  it('should set exchange Rate correctly', fakeAsync(() => {
    component.fg = new FormGroup({
      currency: new FormControl('USD'),
      amount: new FormControl(50),
      homeCurrencyAmount: new FormControl(50),
    });
    component.homeCurrency = 'EUR';
    component.value = {
      currency: 'EUR',
      orig_amount: 20,
      orig_currency: 'USD',
      amount: 100,
    };
    component.txnDt = new Date();
    fixture.detectChanges();
    modalController.create.and.returnValue(
      Promise.resolve({
        present: () => {},
        onWillDismiss: () => Promise.resolve({ data: { amount: 100, homeCurrencyAmount: 500 } }),
      } as any)
    );
    component.setExchangeRate();
    tick(1000);
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: FyCurrencyExchangeRateComponent,
      componentProps: {
        amount: 20,
        currentCurrency: 'EUR',
        newCurrency: 'USD',
        txnDt: component.txnDt,
        exchangeRate: 5,
      },
      mode: 'ios',
      ...modalPropertiesService.getModalDefaultProperties('fy-modal stack-modal'),
    });
    expect(component.fg.value).toEqual({
      currency: 'USD',
      amount: 100,
      homeCurrencyAmount: 500,
    });
    expect(component.value).toEqual({
      currency: 'EUR',
      orig_amount: 100,
      orig_currency: 'USD',
      amount: 500,
    });
  }));

  it('should set exchange Rate correctly', fakeAsync(() => {
    component.fg = new FormGroup({
      currency: new FormControl('USD'),
      amount: new FormControl(50),
      homeCurrencyAmount: new FormControl(50),
    });
    component.homeCurrency = 'EUR';
    component.value = {
      currency: 'EUR',
      orig_amount: 20,
      orig_currency: 'USD',
      amount: 100,
    };
    component.txnDt = new Date();
    fixture.detectChanges();
    modalController.create.and.returnValue(
      Promise.resolve({
        present: () => {},
        onWillDismiss: () => Promise.resolve({ data: { amount: 100, homeCurrencyAmount: 500 } }),
      } as any)
    );
    component.setExchangeRate('EUR');
    tick(1000);
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: FyCurrencyExchangeRateComponent,
      componentProps: {
        amount: 20,
        currentCurrency: 'EUR',
        newCurrency: 'EUR',
        txnDt: component.txnDt,
        exchangeRate: null,
      },
      mode: 'ios',
      ...modalPropertiesService.getModalDefaultProperties('fy-modal stack-modal'),
    });
    expect(component.fg.value).toEqual({
      currency: 'EUR',
      amount: 100,
      homeCurrencyAmount: 500,
    });
  }));

  it('should open the currency modal and should set ExchangeRate without passing currency Code', fakeAsync(() => {
    component.fg = new FormGroup({
      currency: new FormControl('USD'),
      amount: new FormControl(50),
      homeCurrencyAmount: new FormControl(50),
    });
    spyOn(component, 'setExchangeRate');
    modalController.create.and.returnValue(
      Promise.resolve({
        present: () => {},
        onWillDismiss: () => Promise.resolve({ data: { currency: { shortCode: 'USD' } } }),
      } as any)
    );
    component.homeCurrency = 'EUR';
    component.value = {
      currency: 'EUR',
      orig_amount: 20,
      orig_currency: 'USD',
      amount: 100,
    };
    component.openCurrencyModal();
    tick(1000);

    expect(modalController.create).toHaveBeenCalledWith({
      component: FyCurrencyChooseCurrencyComponent,
      componentProps: {
        currentSelection: component.fg.controls.currency.value,
        recentlyUsed: component.recentlyUsed,
      },
      mode: 'ios',
      ...modalPropertiesService.getModalDefaultProperties(),
    });

    expect(component.fg.controls.currency.value).toBe('USD');
    expect(component.setExchangeRate).toHaveBeenCalled();
  }));

  it('should open the currency modal and should set exchange Rate', fakeAsync(() => {
    component.fg = new FormGroup({
      currency: new FormControl('USD'),
      amount: new FormControl(50),
      homeCurrencyAmount: new FormControl(50),
    });
    spyOn(component, 'setExchangeRate');
    modalController.create.and.returnValue(
      Promise.resolve({
        present: () => {},
        onWillDismiss: () => Promise.resolve({ data: { currency: { shortCode: 'USD' } } }),
      } as any)
    );
    component.homeCurrency = 'EUR';
    component.value = {
      currency: 'EUR',
      orig_amount: 20,
      orig_currency: 'EUR',
      amount: 100,
    };
    component.openCurrencyModal();
    tick(1000);

    expect(modalController.create).toHaveBeenCalledWith({
      component: FyCurrencyChooseCurrencyComponent,
      componentProps: {
        currentSelection: component.fg.controls.currency.value,
        recentlyUsed: component.recentlyUsed,
      },
      mode: 'ios',
      ...modalPropertiesService.getModalDefaultProperties(),
    });
    expect(component.setExchangeRate).toHaveBeenCalledOnceWith('USD');
  }));

  it('should open the currency modal and should set form currency value', fakeAsync(() => {
    component.fg = new FormGroup({
      currency: new FormControl('USD'),
      amount: new FormControl(50),
      homeCurrencyAmount: new FormControl(50),
    });
    spyOn(component, 'setExchangeRate');
    modalController.create.and.returnValue(
      Promise.resolve({
        present: () => {},
        onWillDismiss: () => Promise.resolve({ data: { currency: { shortCode: 'USD' } } }),
      } as any)
    );
    component.homeCurrency = 'USD';
    component.openCurrencyModal();
    tick(1000);

    expect(modalController.create).toHaveBeenCalledWith({
      component: FyCurrencyChooseCurrencyComponent,
      componentProps: {
        currentSelection: component.fg.controls.currency.value,
        recentlyUsed: component.recentlyUsed,
      },
      mode: 'ios',
      ...modalPropertiesService.getModalDefaultProperties(),
    });
    expect(component.fg.value.currency).toEqual('USD');
  }));

  it('getValid(): should return true if touchedInParent is true', () => {
    component.touchedInParent = true;
    fixture.detectChanges();
    expect(component.valid).toBe(true);
  });
});
