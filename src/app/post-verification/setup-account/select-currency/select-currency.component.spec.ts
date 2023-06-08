import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { SelectCurrencyComponent } from './select-currency.component';
import { LoaderService } from 'src/app/core/services/loader.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { of, take } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { By } from '@angular/platform-browser';
import { selectedCurrencies } from 'src/app/core/mock-data/currency.data';

describe('SelectCurrencyComponent', () => {
  let component: SelectCurrencyComponent;
  let fixture: ComponentFixture<SelectCurrencyComponent>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let loaderService: jasmine.SpyObj<LoaderService>;

  beforeEach(waitForAsync(() => {
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getAll']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);

    TestBed.configureTestingModule({
      declarations: [SelectCurrencyComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectCurrencyComponent);
    component = fixture.componentInstance;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(): should load currencies on initialization', fakeAsync(() => {
    const mockCurrencies = { USD: 'US Dollar', EUR: 'Euro', JPY: '' };
    currencyService.getAll.and.returnValue(of(mockCurrencies));
    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo();

    fixture.detectChanges();
    tick(500);
    expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
    expect(currencyService.getAll).toHaveBeenCalledTimes(1);
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    component.currencies$.subscribe((currencies) => {
      expect(currencies).toEqual(selectedCurrencies);
    });
  }));

  it('ngAfterViewInit(): should update the filteredCurrencies$', fakeAsync(() => {
    component.searchBarRef = fixture.debugElement.query(By.css('.select-currency-modal--search-input'));
    const inputElement = component.searchBarRef.nativeElement as HTMLInputElement;
    const mockCurrencies = [
      { shortCode: 'USD', longName: 'US Dollar' },
      { shortCode: 'INR', longName: 'Indian National Rupees' },
    ];
    component.currencies$ = of(mockCurrencies);
    component.ngAfterViewInit();

    inputElement.value = '';
    inputElement.dispatchEvent(new Event('keyup'));
    component.filteredCurrencies$.pipe(take(1)).subscribe((currencies) => {
      expect(currencies).toEqual(mockCurrencies);
    });
    tick(500);

    inputElement.value = 'US';
    inputElement.dispatchEvent(new Event('keyup'));
    component.filteredCurrencies$.pipe(take(1)).subscribe((currencies) => {
      expect(currencies).toEqual([{ shortCode: 'USD', longName: 'US Dollar' }]);
    });
    tick(500);
  }));

  it('onDoneClick(): should dismiss the modal', () => {
    const doneBtn = getElementBySelector(fixture, 'ion-button') as HTMLButtonElement;
    doneBtn.click();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('onCurrencySelect(): should call modalController.dismiss with the selected currency', () => {
    const currency = { shortCode: 'USD', longName: 'US Dollar' };
    component.onCurrencySelect(currency);
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({
      currency,
    });
  });
});
