import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { FyCurrencyExchangeRateComponent } from './fy-currency-exchange-rate.component';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('FyCurrencyExchangeRateComponent', () => {
  let component: FyCurrencyExchangeRateComponent;
  let fixture: ComponentFixture<FyCurrencyExchangeRateComponent>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let formBuilder: UntypedFormBuilder;

  beforeEach(waitForAsync(() => {
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', [
      'getExchangeRate',
      'getAmountWithCurrencyFraction',
    ]);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);

    TestBed.configureTestingModule({
      declarations: [FyCurrencyExchangeRateComponent],
      imports: [IonicModule.forRoot(), FormsModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: CurrencyService,
          useValue: currencyServiceSpy,
        },
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FyCurrencyExchangeRateComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(UntypedFormBuilder);
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    component.txnDt = new Date();
    component.amount = 100;
    component.currentCurrency = 'USD';
    component.newCurrency = 'EUR';
    currencyService.getExchangeRate.and.returnValue(of(1.5));
    currencyService.getAmountWithCurrencyFraction.and.returnValue(1.5);
    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo();
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

  describe('ngOnInit():', () => {
    it('should set form values', fakeAsync(() => {
      component.txnDt = new Date('2023-01-01');
      spyOn(component, 'toFixed');
      component.ngOnInit();
      tick(100);
      expect(component.fg.value).toEqual({
        newCurrencyAmount: 100,
        exchangeRate: undefined,
        homeCurrencyAmount: 1.5,
      });
    }));

    it('should set form values if txnDt is not defined', fakeAsync(() => {
      spyOn(component, 'toFixed');
      component.txnDt = undefined;

      const date = new Date();

      component.ngOnInit();
      tick(100);
      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(currencyService.getExchangeRate).toHaveBeenCalledOnceWith('EUR', 'USD', date);
      expect(currencyService.getAmountWithCurrencyFraction).toHaveBeenCalledWith(150, 'USD');
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(component.fg.value).toEqual({
        newCurrencyAmount: 100,
        exchangeRate: undefined,
        homeCurrencyAmount: 1.5,
      });
    }));

    it('should set homeCurrencyAmount if newCurrencyAmount and exchangeRate value changes', fakeAsync(() => {
      spyOn(component, 'toFixed');
      currencyService.getAmountWithCurrencyFraction.and.returnValue(56);
      component.currentCurrency = 'USD';
      component.ngOnInit();
      tick(100);
      component.fg.controls.exchangeRate.setValue(1.5);
      component.fg.controls.newCurrencyAmount.setValue(200);
      expect(component.fg.value).toEqual({
        newCurrencyAmount: 200,
        exchangeRate: 1.5,
        homeCurrencyAmount: 56,
      });
      expect(currencyService.getAmountWithCurrencyFraction).toHaveBeenCalledTimes(3);
      expect(currencyService.getAmountWithCurrencyFraction).toHaveBeenCalledWith(150, 'USD');
      expect(currencyService.getAmountWithCurrencyFraction).toHaveBeenCalledWith(300, 'USD');
    }));

    it('should set homeCurrencyAmount to zero if exchangeRate value changes and amount is zero', fakeAsync(() => {
      spyOn(component, 'toFixed');
      currencyService.getAmountWithCurrencyFraction.and.returnValue(56);
      component.currentCurrency = 'USD';
      component.ngOnInit();
      tick(100);
      component.fg.controls.newCurrencyAmount.setValue(0);
      component.fg.controls.exchangeRate.setValue(1.8);
      expect(component.fg.value).toEqual({
        newCurrencyAmount: 0,
        exchangeRate: 1.8,
        homeCurrencyAmount: 0,
      });
      expect(currencyService.getAmountWithCurrencyFraction).toHaveBeenCalledTimes(2);
      expect(currencyService.getAmountWithCurrencyFraction).toHaveBeenCalledWith(150, 'USD');
    }));
  });

  it('save(): should dismiss the modal with params as amount and homeCurrencyAmount', () => {
    component.fg = formBuilder.group({
      newCurrencyAmount: [100],
      exchangeRate: [1.5],
      homeCurrencyAmount: [1.5],
    });
    component.save();
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({
      amount: 100,
      homeCurrencyAmount: 1.5,
    });
  });

  it('onDoneClick(): should dismiss the modal', () => {
    component.onDoneClick();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });
});
