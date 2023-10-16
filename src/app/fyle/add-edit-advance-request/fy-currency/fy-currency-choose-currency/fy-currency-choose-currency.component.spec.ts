import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { FyCurrencyChooseCurrencyComponent } from './fy-currency-choose-currency.component';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  apiAllCurrencies,
  selectedCurrencies,
  selectedCurrencies2,
  selectedCurrencyNames,
} from 'src/app/core/mock-data/currency.data';
import { finalize, of, take } from 'rxjs';
import { currencies } from 'src/app/core/mock-data/recently-used.data';
import { getElementRef } from 'src/app/core/dom-helpers';

describe('FyCurrencyChooseCurrencyComponent', () => {
  let component: FyCurrencyChooseCurrencyComponent;
  let fixture: ComponentFixture<FyCurrencyChooseCurrencyComponent>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let inputElement: HTMLInputElement;

  beforeEach(waitForAsync(() => {
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getAll']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);

    TestBed.configureTestingModule({
      declarations: [FyCurrencyChooseCurrencyComponent],
      imports: [IonicModule.forRoot()],
      providers: [
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
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FyCurrencyChooseCurrencyComponent);
    component = fixture.componentInstance;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit():', () => {
    beforeEach(() => {
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();
      currencyService.getAll.and.returnValue(of(selectedCurrencyNames));
    });

    it('should set currencies$ properly', fakeAsync(() => {
      component.ngOnInit();
      tick(100);
      component.currencies$
        .pipe(
          finalize(() => {
            expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
          })
        )
        .subscribe((currencies) => {
          expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
          expect(currencyService.getAll).toHaveBeenCalledTimes(1);
          expect(currencies).toEqual(selectedCurrencies2);
        });
    }));

    it('should set currencies$ properly if longName is undefined', fakeAsync(() => {
      currencyService.getAll.and.returnValue(of({ USD: undefined }));
      component.ngOnInit();
      tick(100);
      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(currencyService.getAll).toHaveBeenCalledTimes(1);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      component.currencies$.subscribe((currencies) => {
        expect(currencies).toEqual([
          {
            shortCode: 'USD',
            longName: 'USD',
          },
        ]);
      });
    }));
  });

  it('ngAfterViewInit(): should update the filteredCurrencies$', fakeAsync(() => {
    component.searchBarRef = getElementRef(fixture, '.selection-modal--search-input');
    const inputElement = component.searchBarRef.nativeElement as HTMLInputElement;
    const mockCurrencies = [
      { shortCode: 'IRR', longName: 'Iranian Rial' },
      { shortCode: 'INR', longName: 'Indian National Rupees' },
    ];
    component.currencies$ = of(mockCurrencies);
    component.ngAfterViewInit();
    inputElement.value = 'r';
    inputElement.dispatchEvent(new Event('keyup'));
    tick(100);
    component.filteredCurrencies$.pipe(take(1)).subscribe((currencies) => {
      expect(currencies).toEqual(mockCurrencies);
    });

    inputElement.value = 'rial';
    inputElement.dispatchEvent(new Event('keyup'));
    tick(100);
    component.filteredCurrencies$.pipe(take(1)).subscribe((currencies) => {
      expect(currencies).toEqual([mockCurrencies[0]]);
    });
  }));

  it('clearValue(): should clear value', () => {
    component.searchBarRef = getElementRef(fixture, '.selection-modal--search-input');
    component.clearValue();

    expect(component.value).toEqual('');
    expect(component.searchBarRef.nativeElement.value).toEqual('');
  });

  it('onDoneClick(): should dismiss the modal', () => {
    component.onDoneClick();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('onCurrencySelect(): should select currency', () => {
    component.onCurrencySelect(selectedCurrencies[0]);

    expect(modalController.dismiss).toHaveBeenCalledOnceWith({
      currency: selectedCurrencies[0],
    });
  });
});
