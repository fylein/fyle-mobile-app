import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { By } from '@angular/platform-browser';
import { of, take } from 'rxjs';
import { apiAllCurrencies2, selectedCurrencies } from 'src/app/core/mock-data/currency.data';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { SelectCurrencyComponent } from './select-currency.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

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
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
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

  it('ngOnInit(): should setup currencies', fakeAsync(() => {
    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo();
    currencyService.getAll.and.returnValue(of(apiAllCurrencies2));

    component.ngOnInit();
    tick(500);

    expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    expect(currencyService.getAll).toHaveBeenCalledTimes(1);
  }));

  it('ngAfterViewInit(): should update the filteredCurrencies$', fakeAsync(() => {
    component.searchBarRef = fixture.debugElement.query(By.css('.selection-modal--search-input'));
    const inputElement = component.searchBarRef.nativeElement as HTMLInputElement;
    const mockCurrencies = [
      { shortCode: 'USD', longName: 'US Dollar' },
      { shortCode: 'INR', longName: 'Indian National Rupees' },
    ];
    component.currencies$ = of(mockCurrencies);
    component.ngAfterViewInit();
    tick(500);

    inputElement.value = '';
    inputElement.dispatchEvent(new Event('keyup'));
    component.filteredCurrencies$.pipe(take(1)).subscribe((currencies) => {
      expect(currencies).toEqual(mockCurrencies);
    });
    tick(500);

    inputElement.value = 'US';
    inputElement.dispatchEvent(new Event('keyup'));
    component.filteredCurrencies$.pipe(take(1)).subscribe((currencies) => {
      expect(currencies).toEqual(mockCurrencies);
    });
    tick(500);
  }));

  it('closeModal(): should close modal', () => {
    component.closeModal();

    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('onCurrencySelect(): should select currency', () => {
    component.onCurrencySelect(selectedCurrencies[0]);

    expect(modalController.dismiss).toHaveBeenCalledOnceWith({
      selectedCurrency: selectedCurrencies[0],
    });
  });

  it('clearValue(): should clear value', () => {
    component.searchBarRef = fixture.debugElement.query(By.css('.selection-modal--search-input'));
    component.clearValue();

    expect(component.value).toEqual('');
    expect(component.searchBarRef.nativeElement.value).toEqual('');
  });
});
