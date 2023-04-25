import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FyCurrencyChooseCurrencyComponent } from './fy-currency-choose-currency.component';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Currency } from 'src/app/core/models/currency.model';
import * as rxjs from 'rxjs';
import { fromEvent as realFromEvent } from 'rxjs';

fdescribe('FyCurrencyChooseCurrencyComponent', () => {
  let component: FyCurrencyChooseCurrencyComponent;
  let fixture: ComponentFixture<FyCurrencyChooseCurrencyComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let recentLocalStorageItemsService: jasmine.SpyObj<RecentLocalStorageItemsService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getAll']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const recentLocalStorageItemsServiceSpy = jasmine.createSpyObj('RecentLocalStorageItemsService', ['post']);

    TestBed.configureTestingModule({
      declarations: [FyCurrencyChooseCurrencyComponent],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: RecentLocalStorageItemsService, useValue: recentLocalStorageItemsServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FyCurrencyChooseCurrencyComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    recentLocalStorageItemsService = TestBed.inject(
      RecentLocalStorageItemsService
    ) as jasmine.SpyObj<RecentLocalStorageItemsService>;
    // component.currentSelection = 'USD';
    // component.recentlyUsed = [{label: 'United States', value: 'USD'}];
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('clearValue(): should clear the value and trigger a keyup event', () => {
    const mockCurrencies = { USD: 'US Dollar', EUR: 'Euro', JPY: 'Japanese Yen' };
    currencyService.getAll.and.returnValue(of(mockCurrencies));
    loaderService.showLoader.and.returnValue(Promise.resolve());
    loaderService.hideLoader.and.returnValue(Promise.resolve());
    component.value = 'USD';
    const searchBarRefSpy = {
      nativeElement: jasmine.createSpyObj('nativeElement', ['dispatchEvent']),
    };
    searchBarRefSpy.nativeElement.value = 'example';
    component.searchBarRef = searchBarRefSpy;
    component.clearValue();

    expect(component.value).toBe('');
    expect(searchBarRefSpy.nativeElement.value).toBe('');
    expect(searchBarRefSpy.nativeElement.dispatchEvent).toHaveBeenCalledOnceWith(new Event('keyup'));
  });

  it('should load currencies on initialization', fakeAsync(() => {
    const mockCurrencies = { USD: 'US Dollar', EUR: 'Euro', JPY: 'Japanese Yen' };
    currencyService.getAll.and.returnValue(of(mockCurrencies));
    loaderService.showLoader.and.returnValue(Promise.resolve());
    loaderService.hideLoader.and.returnValue(Promise.resolve());

    fixture.detectChanges();
    component.ngOnInit();
    tick();
    expect(loaderService.showLoader).toHaveBeenCalled();
    expect(currencyService.getAll).toHaveBeenCalled();
    expect(loaderService.hideLoader).toHaveBeenCalled();
    expect(component.currencies$).toBeDefined();
  }));

  it('should load currencies on initialization even if value is empty', fakeAsync(() => {
    const mockCurrencies = { USD: 'US Dollar', EUR: 'Euro', JPY: '' };
    currencyService.getAll.and.returnValue(of(mockCurrencies));
    loaderService.showLoader.and.returnValue(Promise.resolve());
    loaderService.hideLoader.and.returnValue(Promise.resolve());

    fixture.detectChanges();
    component.ngOnInit();
    tick();
    expect(loaderService.showLoader).toHaveBeenCalled();
    expect(currencyService.getAll).toHaveBeenCalled();
    expect(loaderService.hideLoader).toHaveBeenCalled();
    expect(component.currencies$).toBeDefined();
  }));

  it('should return recently used items if present, or an empty array if not', () => {
    const mockRecentlyUsed = [
      { label: 'USD - US Dollar', value: 'USD' },
      { label: 'EUR - Euro', value: 'EUR' },
    ];
    component.recentlyUsed = mockRecentlyUsed;

    component.getRecentlyUsedItems().subscribe((result) => {
      expect(result).toEqual(mockRecentlyUsed);
    });

    component.recentlyUsed = null;

    component.getRecentlyUsedItems().subscribe((result) => {
      expect(result).toEqual([]);
    });
  });

  it('onDoneClick(): should dismiss the modal', () => {
    component.onDoneClick();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('should dismiss the modal when the Done button is clicked', () => {
    const mockCurrency = { shortCode: 'USD', longName: 'US Dollar' };
    component.onCurrencySelect(mockCurrency);

    expect(recentLocalStorageItemsService.post).toHaveBeenCalledWith('recent-currency-cache', mockCurrency, 'label');
    expect(modalController.dismiss).toHaveBeenCalledWith({ currency: mockCurrency });
  });
});
