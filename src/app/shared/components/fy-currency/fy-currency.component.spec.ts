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

fdescribe('FyCurrencyComponent', () => {
  let component: FyCurrencyComponent;
  let fixture: ComponentFixture<FyCurrencyComponent>;
  let fb: FormBuilder;
  let modalController: jasmine.SpyObj<ModalController>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let modalPropertiesService: jasmine.SpyObj<ModalPropertiesService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
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
});
