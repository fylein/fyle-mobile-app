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
import { CUSTOM_ELEMENTS_SCHEMA, forwardRef } from '@angular/core';
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
});
