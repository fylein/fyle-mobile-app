import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { of } from 'rxjs';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { FyCurrencyChooseCurrencyComponent } from './fy-currency-choose-currency/fy-currency-choose-currency.component';
import { FyCurrencyExchangeRateComponent } from './fy-currency-exchange-rate/fy-currency-exchange-rate.component';
import { FyCurrencyComponent } from './fy-currency.component';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { FyNumberComponent } from '../fy-number/fy-number.component';

describe('FyCurrencyComponent', () => {
  let component: FyCurrencyComponent;
  let fixture: ComponentFixture<FyCurrencyComponent>;
  let fb: UntypedFormBuilder;
  let modalController: jasmine.SpyObj<ModalController>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let modalPropertiesService: jasmine.SpyObj<ModalPropertiesService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getExchangeRate']);
    const modalPropertiesServiceSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), FormsModule, ReactiveFormsModule, TranslocoModule, FyCurrencyComponent,
        FyCurrencyChooseCurrencyComponent,
        FyCurrencyExchangeRateComponent,
        FyNumberComponent],
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
        UntypedFormBuilder,
        {
            provide: TranslocoService,
            useValue: translocoServiceSpy,
        },
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
}).compileComponents();

    fixture = TestBed.createComponent(FyCurrencyComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(UntypedFormBuilder);
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    modalPropertiesService = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyCurrency.currencyAutoCoded': 'Currency is auto coded.',
        'fyCurrency.amountAutoCoded': 'Amount is auto coded.',
        'fyCurrency.currency': 'Currency',
        'fyCurrency.amount': 'Amount',
        'fyCurrency.amountPlaceholder': '00.00',
        'fyCurrency.exchangeRateInfo': 'at {{exchangeRate}} {{currency}} / {{origCurrency}}',
        'fyCurrency.modifyButton': 'Modify',
      };
      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && typeof translation === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const placeholder = `{{${paramKey}}}`;
          translation = translation.replace(placeholder, params[paramKey]);
        });
      }

      return translation;
    });
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
    tick(1000);
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
    tick();
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
    tick(1000);
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

    component.fg = new UntypedFormGroup({
      currency: new UntypedFormControl('EUR'),
      amount: new UntypedFormControl(null),
      homeCurrencyAmount: new UntypedFormControl(null),
    });
    component.homeCurrency = 'USD';
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

    tick();

    expect(currencyService.getExchangeRate).toHaveBeenCalledWith('EUR', 'USD', previousTxnDt);
    expect(component.exchangeRate).toEqual(exchangeRate);
    expect(component.innerValue.amount).toBeNull();
  }));

  it('ngOnChanges(): should update the exchange rate and inner value even if txnDt is undefined', fakeAsync(() => {
    const previousTxnDt = new Date('2022-01-01');
    const currentTxnDt = new Date('2022-02-01');
    const exchangeRate = 1.5;
    currencyService.getExchangeRate.and.returnValue(of(exchangeRate));

    component.fg = new UntypedFormGroup({
      currency: new UntypedFormControl('EUR'),
      amount: new UntypedFormControl(300),
      homeCurrencyAmount: new UntypedFormControl(300),
    });
    component.homeCurrency = 'USD';
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

    tick();

    expect(currencyService.getExchangeRate).toHaveBeenCalledWith('EUR', 'USD', new Date());
    expect(component.exchangeRate).toEqual(exchangeRate);
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
      orig_amount: null,
      orig_currency: null,
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
    spyOn(component, 'onTouchedCallback');
    component.onBlur();
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
    expect(component.onChangeCallback).toEqual(mockCallback);
  });

  it('registerOnTouched(): should set onTouchedCallback function', () => {
    const mockCallback = () => {};
    component.registerOnTouched(mockCallback);
    expect(component.onTouchedCallback).toEqual(mockCallback);
  });

  it('should set exchange Rate correctly', fakeAsync(() => {
    component.fg = new UntypedFormGroup({
      currency: new UntypedFormControl('USD'),
      amount: new UntypedFormControl(50),
      homeCurrencyAmount: new UntypedFormControl(50),
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
    modalController.create.and.resolveTo({
      present: () => {},
      onWillDismiss: () => Promise.resolve({ data: { amount: 100, homeCurrencyAmount: 500 } }),
    } as HTMLIonModalElement);
    component.setExchangeRate('USD');
    tick();
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
    component.fg = new UntypedFormGroup({
      currency: new UntypedFormControl('USD'),
      amount: new UntypedFormControl(50),
      homeCurrencyAmount: new UntypedFormControl(50),
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
    modalController.create.and.resolveTo({
      present: () => {},
      onWillDismiss: () => Promise.resolve({ data: { amount: 100, homeCurrencyAmount: 500 } }),
    } as HTMLIonModalElement);
    component.setExchangeRate();
    tick();
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
    component.fg = new UntypedFormGroup({
      currency: new UntypedFormControl('USD'),
      amount: new UntypedFormControl(50),
      homeCurrencyAmount: new UntypedFormControl(50),
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
    modalController.create.and.resolveTo({
      present: () => {},
      onWillDismiss: () => Promise.resolve({ data: { amount: 100, homeCurrencyAmount: 500 } }),
    } as HTMLIonModalElement);
    component.setExchangeRate('EUR');
    tick();
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
    component.fg = new UntypedFormGroup({
      currency: new UntypedFormControl('USD'),
      amount: new UntypedFormControl(50),
      homeCurrencyAmount: new UntypedFormControl(50),
    });
    spyOn(component, 'setExchangeRate');
    modalController.create.and.resolveTo({
      present: () => {},
      onWillDismiss: () => Promise.resolve({ data: { currency: { shortCode: 'USD' } } }),
    } as HTMLIonModalElement);
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
    component.fg = new UntypedFormGroup({
      currency: new UntypedFormControl('USD'),
      amount: new UntypedFormControl(50),
      homeCurrencyAmount: new UntypedFormControl(50),
    });
    spyOn(component, 'setExchangeRate');
    modalController.create.and.resolveTo({
      present: () => {},
      onWillDismiss: () => Promise.resolve({ data: { currency: { shortCode: 'USD' } } }),
    } as HTMLIonModalElement);
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
    component.fg = new UntypedFormGroup({
      currency: new UntypedFormControl('USD'),
      amount: new UntypedFormControl(50),
      homeCurrencyAmount: new UntypedFormControl(50),
    });
    spyOn(component, 'setExchangeRate');
    modalController.create.and.resolveTo({
      present: () => {},
      onWillDismiss: () => Promise.resolve({ data: { currency: { shortCode: 'USD' } } }),
    } as HTMLIonModalElement);
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
    expect(component.valid).toBeTrue();
  });

  it('should set currencyAutoCodeMessage to "Currency is auto coded." and amountAutoCodeMessage to "Amount is auto coded." when both are auto coded', () => {
    component.autoCodedData = { currency: 'USD', amount: 100 };
    component.fg = new UntypedFormGroup({
      currency: new UntypedFormControl('USD'),
      amount: new UntypedFormControl(100),
      homeCurrencyAmount: new UntypedFormControl(null),
    });
    component.showAutoCodeMessage();
    expect(component.currencyAutoCodeMessage).toBe('Currency is auto coded.');
    expect(component.amountAutoCodeMessage).toBe('Amount is auto coded.');
  });

  it('should set currencyAutoCodeMessage to "Currency is auto coded." when only currency is auto coded', () => {
    component.autoCodedData = { currency: 'USD', amount: 100 };
    component.fg = new UntypedFormGroup({
      currency: new UntypedFormControl('USD'),
      amount: new UntypedFormControl(200),
      homeCurrencyAmount: new UntypedFormControl(null),
    });
    component.showAutoCodeMessage();
    expect(component.currencyAutoCodeMessage).toBe('Currency is auto coded.');
  });

  it('should set amountAutoCodeMessage to "Amount is auto coded." when only amount is auto coded', () => {
    component.autoCodedData = { currency: 'USD', amount: 100 };
    component.fg = new UntypedFormGroup({
      currency: new UntypedFormControl('EUR'),
      amount: new UntypedFormControl(100),
      homeCurrencyAmount: new UntypedFormControl(null),
    });
    component.showAutoCodeMessage();
    expect(component.amountAutoCodeMessage).toBe('Amount is auto coded.');
  });

  it('should set currencyAutoCodeMessage and amountAutoCodeMessage to "" when neither currency nor amount is auto coded', () => {
    component.autoCodedData = { currency: 'USD', amount: 100 };
    component.fg = new UntypedFormGroup({
      currency: new UntypedFormControl('EUR'),
      amount: new UntypedFormControl(200),
      homeCurrencyAmount: new UntypedFormControl(null),
    });
    component.showAutoCodeMessage();
    expect(component.currencyAutoCodeMessage).toBe('');
    expect(component.amountAutoCodeMessage).toBe('');
  });
});
