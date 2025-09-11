import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FyCurrencyChooseCurrencyComponent } from './fy-currency-choose-currency.component';
import { ModalController } from '@ionic/angular/standalone';
import { BehaviorSubject, Subject, fromEvent, of, take } from 'rxjs';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, ElementRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('FyCurrencyChooseCurrencyComponent', () => {
  let component: FyCurrencyChooseCurrencyComponent;
  let fixture: ComponentFixture<FyCurrencyChooseCurrencyComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let recentLocalStorageItemsService: jasmine.SpyObj<RecentLocalStorageItemsService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getAll']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const recentLocalStorageItemsServiceSpy = jasmine.createSpyObj('RecentLocalStorageItemsService', ['post']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, TranslocoModule, FyCurrencyChooseCurrencyComponent,
        MatIconTestingModule],
      providers: [
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: RecentLocalStorageItemsService, useValue: recentLocalStorageItemsServiceSpy },
        { provide: TranslocoService, useValue: translocoServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FyCurrencyChooseCurrencyComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    recentLocalStorageItemsService = TestBed.inject(
      RecentLocalStorageItemsService,
    ) as jasmine.SpyObj<RecentLocalStorageItemsService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyCurrencyChooseCurrency.title': 'Select currency',
        'fyCurrencyChooseCurrency.searchPlaceholder': 'Search',
        'fyCurrencyChooseCurrency.clear': 'Clear',
        'fyCurrencyChooseCurrency.allCurrencies': 'All currencies',
        'fyCurrencyChooseCurrency.selectCurrency': 'Select currency',
        'fyCurrencyChooseCurrency.search': 'Search',
        'fyCurrencyChooseCurrency.indianRupee': 'Indian Rupee',
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
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('clearValue(): should clear the value and trigger a keyup event', () => {
    const mockCurrencies = { USD: 'US Dollar', EUR: 'Euro', JPY: 'Japanese Yen' };
    currencyService.getAll.and.returnValue(of(mockCurrencies));
    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo();
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
    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo();

    fixture.detectChanges();
    component.ngOnInit();
    tick(1000);
    expect(loaderService.showLoader).toHaveBeenCalled();
    expect(currencyService.getAll).toHaveBeenCalled();
    expect(loaderService.hideLoader).toHaveBeenCalled();
    expect(component.currencies$).toBeDefined();
  }));

  it('should load currencies on initialization even if value is empty', fakeAsync(() => {
    const mockCurrencies = { USD: 'US Dollar', EUR: 'Euro', JPY: '' };
    currencyService.getAll.and.returnValue(of(mockCurrencies));
    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo();

    fixture.detectChanges();
    component.ngOnInit();
    tick(1000);
    expect(loaderService.showLoader).toHaveBeenCalled();
    expect(currencyService.getAll).toHaveBeenCalled();
    expect(loaderService.hideLoader).toHaveBeenCalled();
    expect(component.currencies$).toBeDefined();
  }));

  it('should return recently used items if present, or an empty array if not', () => {
    const mockRecentlyUsed = [
      { shortCode: 'USD', longName: ' US Dollar' },
      { shortCode: 'EUR', longName: 'Euro' },
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

  it('ngAfterViewInit(): should update filteredCurrencies$ and recentlyUsedCurrencies$', fakeAsync(() => {
    const mockCurrencies = [
      { shortCode: 'USD', longName: 'US Dollar' },
      { shortCode: 'INR', longName: 'Indian National Rupees' },
    ];
    component.currencies$ = of(mockCurrencies);
    const dummyHtmlInputElement = document.createElement('input');
    component.searchBarRef = {
      nativeElement: dummyHtmlInputElement,
    };
    spyOn(component, 'getRecentlyUsedItems').and.returnValue(of(mockCurrencies));
    component.ngAfterViewInit();
    component.filteredCurrencies$.pipe(take(1)).subscribe((currencies) => {
      expect(currencies).toEqual(mockCurrencies);
    });
    component.recentlyUsedCurrencies$.pipe(take(1)).subscribe((currencies) => {
      expect(currencies).toEqual(mockCurrencies);
    });
    tick(500);
    dummyHtmlInputElement.value = 'US';
    dummyHtmlInputElement.dispatchEvent(new Event('keyup'));
    component.filteredCurrencies$.pipe(take(1)).subscribe((currencies) => {
      expect(currencies).toEqual([{ shortCode: 'USD', longName: 'US Dollar' }]);
    });
    component.recentlyUsedCurrencies$.pipe(take(1)).subscribe((currencies) => {
      expect(currencies).toEqual([{ shortCode: 'USD', longName: 'US Dollar' }]);
    });
    expect(component.getRecentlyUsedItems).toHaveBeenCalledTimes(2);
    tick(500);
  }));

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
