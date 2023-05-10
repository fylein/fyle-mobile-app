import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { FySelectModalComponent } from './fy-select-modal.component';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, take } from 'rxjs';
import { By } from '@angular/platform-browser';
import { getElementBySelector } from 'src/app/core/dom-helpers';

fdescribe('FySelectModalComponent', () => {
  let component: FySelectModalComponent;
  let fixture: ComponentFixture<FySelectModalComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let recentLocalStorageItemsService: jasmine.SpyObj<RecentLocalStorageItemsService>;
  let utilityService: jasmine.SpyObj<UtilityService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const recentLocalStorageItemsServiceSpy = jasmine.createSpyObj('RecentLocalStorageItemsService', ['get', 'post']);
    const utilityServiceSpy = jasmine.createSpyObj('UtilityService', ['searchArrayStream']);

    TestBed.configureTestingModule({
      declarations: [FySelectModalComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: RecentLocalStorageItemsService,
          useValue: recentLocalStorageItemsServiceSpy,
        },
        {
          provide: UtilityService,
          useValue: utilityServiceSpy,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FySelectModalComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    recentLocalStorageItemsService = TestBed.inject(
      RecentLocalStorageItemsService
    ) as jasmine.SpyObj<RecentLocalStorageItemsService>;
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngAfterViewInit(): should update filteredOptions$', fakeAsync(() => {
    const dummyHtmlInputElement = document.createElement('input');
    component.searchBarRef = {
      nativeElement: dummyHtmlInputElement,
    };
    component.currentSelection = 'ECONOMY';
    component.nullOption = true;
    component.customInput = true;
    component.defaultLabelProp = 'economy';
    component.options = [
      { label: 'economy', value: 'ECONOMY' },
      { label: 'business', value: 'BUSINESS' },
    ];
    component.ngAfterViewInit();
    dummyHtmlInputElement.value = 'econo';
    dummyHtmlInputElement.dispatchEvent(new Event('keyup'));

    component.filteredOptions$.pipe(take(1)).subscribe((res) => {
      expect(res).toEqual([
        { label: 'None', value: null },
        { label: 'econo', value: 'econo', selected: false },
        { label: 'economy', value: 'ECONOMY', selected: true },
      ]);
    });
    tick(1000);
  }));

  it('ngAfterViewInit(): should update filteredOptions$ if currentSelection is not equal to any options value', () => {
    const dummyHtmlInputElement = document.createElement('input');
    component.searchBarRef = {
      nativeElement: dummyHtmlInputElement,
    };
    component.currentSelection = { travel_class: 'ECONOMY', vendor: 'asdf' };
    component.nullOption = true;
    component.customInput = true;
    component.defaultLabelProp = 'travel_class';
    component.options = [
      { label: 'business', value: 'BUSINESS' },
      { label: 'first class', value: 'FIRST_CLASS' },
    ];
    component.ngAfterViewInit();
    dummyHtmlInputElement.value = 'eco';
    dummyHtmlInputElement.dispatchEvent(new Event('keyup'));

    component.filteredOptions$.pipe(take(1)).subscribe((res) => {
      expect(res).toEqual([
        { label: 'None', value: null },
        { label: 'eco', value: 'eco', selected: false },
        { label: 'ECONOMY', value: { travel_class: 'ECONOMY', vendor: 'asdf' }, selected: true },
      ]);
    });
  });

  it('ngAfterViewInit(): should update recentrecentlyUsedItems$', () => {
    const dummyHtmlInputElement = document.createElement('input');
    component.searchBarRef = {
      nativeElement: dummyHtmlInputElement,
    };
    // const inputElement = fixture.debugElement.query(By.css('.selection-modal--search-input')).nativeElement;
    // inputElement.value = 'busi';
    // inputElement.dispatchEvent(new Event('keyup'));
    // const input = getElementBySelector(fixture, '.selection-modal--search-input.smartlook-show') as HTMLInputElement;
    spyOn(component, 'getRecentlyUsedItems').and.returnValue(
      of([
        { label: 'business', value: 'BUSINESS' },
        { label: 'economy', value: 'ECONOMY' },
      ])
    );
    utilityService.searchArrayStream.and.returnValue(() => of([{ label: 'business', value: 'BUSINESS' }]));
    // component.searchBarRef = {
    //   nativeElement: input
    // };
    component.ngAfterViewInit();
    dummyHtmlInputElement.value = '';
    dummyHtmlInputElement.dispatchEvent(new Event('keyup'));
    component.recentrecentlyUsedItems$.pipe(take(1)).subscribe((res) => {
      expect(utilityService.searchArrayStream).toHaveBeenCalledWith('');
      expect(res).toEqual([{ label: 'business', value: 'BUSINESS' }]);
    });
    dummyHtmlInputElement.value = 'busi';
    dummyHtmlInputElement.dispatchEvent(new Event('keyup'));
    component.recentrecentlyUsedItems$.pipe(take(1)).subscribe((res) => {
      expect(utilityService.searchArrayStream).toHaveBeenCalledWith('busi');
      expect(res).toEqual([{ label: 'business', value: 'BUSINESS' }]);
    });
    expect(utilityService.searchArrayStream).toHaveBeenCalledTimes(2);
    expect(component.getRecentlyUsedItems).toHaveBeenCalledTimes(2);
  });

  it('ngAfterViewInit(): should update the filteredOptions$ if searchBarRef is not defined', fakeAsync(() => {
    component.nullOption = true;
    component.currentSelection = 'ECONOMY';
    component.options = [
      { label: 'business', value: 'BUSINESS' },
      { label: 'economy', value: 'ECONOMY' },
    ];

    component.ngAfterViewInit();

    component.filteredOptions$.subscribe((res) => {
      expect(res).toEqual([
        { label: 'None', value: null },
        { label: 'business', value: 'BUSINESS', selected: false },
        { label: 'economy', value: 'ECONOMY', selected: true },
      ]);
    });
    tick(1000);
  }));

  it('onDoneClick(): should dismiss the modal', () => {
    component.onDoneClick();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('clearValue(): should clear the value and trigger a keyup event', () => {
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

  describe('getRecentlyUsedItems(): ', () => {
    const options = [
      { label: 'business', value: 'BUSINESS' },
      { label: 'economy', value: 'ECONOMY' },
      { label: 'first class', value: 'FIRST_CLASS' },
    ];
    const recentlyUsed = [
      { label: 'business', value: 'BUSINESS' },
      { label: 'economy', value: 'ECONOMY' },
    ];
    const localStorageItems = [
      { label: 'business', value: 'BUSINESS', selected: true },
      { label: 'second class', value: 'SECOND_CLASS', selected: false },
    ];
    const filteredItems = [{ label: 'business', value: 'BUSINESS', selected: true }];

    it('should return recently used items from API if available', () => {
      component.recentlyUsed = recentlyUsed;
      component.options = [];
      component.getRecentlyUsedItems().subscribe((result) => {
        expect(recentLocalStorageItemsService.get).not.toHaveBeenCalled();
        expect(result).toEqual(recentlyUsed);
      });
    });

    it('should return recently used items from local storage if not available from API', fakeAsync(() => {
      const getSpy = recentLocalStorageItemsService.get.and.returnValue(Promise.resolve(localStorageItems));
      component.options = options;
      component.recentlyUsed = null;
      component.currentSelection = 'BUSINESS';

      component.getRecentlyUsedItems().subscribe((result) => {
        expect(getSpy).toHaveBeenCalledOnceWith(component.cacheName);
        expect(result).toEqual(filteredItems);
      });
      tick(1000);
    }));
  });

  it('onElementSelect(): should call recentlocalstorage service and dismiss the modal', () => {
    component.cacheName = 'cache1';
    component.options = [
      { label: 'business', value: 'BUSINESS' },
      { label: 'economy', value: 'ECONOMY' },
    ];
    const option = { label: 'business', value: 'BUSINESS' };
    component.onElementSelect(option);
    expect(recentLocalStorageItemsService.post).toHaveBeenCalledOnceWith('cache1', option, 'label');
    expect(modalController.dismiss).toHaveBeenCalledOnceWith(option);
  });

  it('saveToCacheAndUse(): should call onElementSelect', () => {
    const searchBarRefSpy = {
      nativeElement: jasmine.createSpyObj('nativeElement', ['dispatchEvent']),
    };
    searchBarRefSpy.nativeElement.value = 'example';
    component.searchBarRef = searchBarRefSpy;
    spyOn(component, 'onElementSelect');
    component.saveToCacheAndUse();
    expect(component.onElementSelect).toHaveBeenCalledOnceWith({
      label: 'example',
      value: 'example',
      selected: false,
    });
  });
});
