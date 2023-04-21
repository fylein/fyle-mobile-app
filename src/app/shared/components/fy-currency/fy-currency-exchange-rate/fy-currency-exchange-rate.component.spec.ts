import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, tick, waitForAsync } from '@angular/core/testing';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { of } from 'rxjs';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { FyNumberComponent } from '../../fy-number/fy-number.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FyCurrencyExchangeRateComponent } from './fy-currency-exchange-rate.component';

fdescribe('FyCurrencyExchangeRateComponent', () => {
  let component: FyCurrencyExchangeRateComponent;
  let fixture: ComponentFixture<FyCurrencyExchangeRateComponent>;
  let fb: FormBuilder;
  let modalController: jasmine.SpyObj<ModalController>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let loaderService: jasmine.SpyObj<LoaderService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', [
      'getExchangeRate',
      'getAmountWithCurrencyFraction',
    ]);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['hideLoader', 'showLoader']);

    TestBed.configureTestingModule({
      declarations: [FyCurrencyExchangeRateComponent, FyNumberComponent],
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
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
        FormBuilder,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FyCurrencyExchangeRateComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    component.txnDt = new Date();
    component.amount = 100;
    component.currentCurrency = 'USD';
    component.newCurrency = 'EUR';
    component.exchangeRate = 1.15;
    currencyService.getExchangeRate.and.returnValue(of(1.5));
    currencyService.getAmountWithCurrencyFraction.and.returnValue(1.5);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toFixed(): should return a string with the specified number of decimal places', () => {
    expect(component.toFixed(1.234567, 2)).toEqual('1.23');
    expect(component.toFixed(1234.567, 1)).toEqual('1234.5');
    expect(component.toFixed(0.123, 3)).toEqual('0.123');
    expect(component.toFixed(10, 2)).toEqual('10');
    expect(component.toFixed(10, 0)).toEqual('10');
    expect(component.toFixed(1.15, 7)).toEqual('1.15');
  });

  it('ngOnInit(): should set form values if exchangeRate is defined', fakeAsync(() => {
    spyOn(component, 'toFixed');
    spyOn(component, 'ngOnInit');
    component.ngOnInit();
    tick(1000);
    expect(component.fg.value).toEqual({
      newCurrencyAmount: 100,
      exchangeRate: '1.15',
      homeCurrencyAmount: 1.5,
    });
  }));

  it('ngOnInit(): should set form values if exchangeRate is not defined and txnDt is not defined', fakeAsync(() => {
    loaderService.showLoader.and.returnValue(Promise.resolve());
    loaderService.hideLoader.and.returnValue(Promise.resolve());
    currencyService.getExchangeRate.and.returnValue(of(1.5));
    component.exchangeRate = null;
    component.txnDt = undefined;
    fixture.detectChanges();
    spyOn(component, 'toFixed');
    component.ngOnInit();
    tick();
    expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
    expect(currencyService.getExchangeRate).toHaveBeenCalledOnceWith('EUR', 'USD', new Date());
    expect(currencyService.getAmountWithCurrencyFraction).toHaveBeenCalledWith(114.99999999999999, 'USD');
    expect(currencyService.getAmountWithCurrencyFraction).toHaveBeenCalledWith(150, 'USD');
    expect(currencyService.getAmountWithCurrencyFraction).toHaveBeenCalledWith(150, 'USD');
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    expect(component.fg.value).toEqual({
      newCurrencyAmount: 100,
      exchangeRate: undefined,
      homeCurrencyAmount: 1.5,
    });
  }));

  it('ngOnInit(): should set form values if exchangeRate is not defined', fakeAsync(() => {
    loaderService.showLoader.and.returnValue(Promise.resolve());
    loaderService.hideLoader.and.returnValue(Promise.resolve());
    currencyService.getExchangeRate.and.returnValue(of(1.5));
    component.exchangeRate = null;
    fixture.detectChanges();
    spyOn(component, 'toFixed');
    component.ngOnInit();
    tick();
    expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
    expect(currencyService.getExchangeRate).toHaveBeenCalledOnceWith('EUR', 'USD', component.txnDt);
    expect(currencyService.getAmountWithCurrencyFraction).toHaveBeenCalledWith(114.99999999999999, 'USD');
    expect(currencyService.getAmountWithCurrencyFraction).toHaveBeenCalledWith(150, 'USD');
    expect(currencyService.getAmountWithCurrencyFraction).toHaveBeenCalledWith(150, 'USD');
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    expect(component.fg.value).toEqual({
      newCurrencyAmount: 100,
      exchangeRate: undefined,
      homeCurrencyAmount: 1.5,
    });
  }));

  it('ngOnInit(): should set form values if exchangeRate is defined and newCurrencyAmount changes', fakeAsync(() => {
    spyOn(component, 'toFixed');
    spyOn(component, 'ngOnInit');
    component.ngOnInit();
    tick();
    component.fg.controls.newCurrencyAmount.setValue(2);
    component.fg.controls.exchangeRate.setValue(0);
    fixture.detectChanges();
    expect(component.fg.value).toEqual({
      newCurrencyAmount: 2,
      exchangeRate: 0,
      homeCurrencyAmount: 0,
    });
  }));

  it('save(): should dismiss the modal', () => {
    component.save();
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({
      amount: 100,
      homeCurrencyAmount: 1.5,
    });
  });

  it('onDoneClick(): should dismiss the modal', () => {
    component.onDoneClick();
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({
      amount: 100,
      homeCurrencyAmount: 1.5,
    });
  });
});
