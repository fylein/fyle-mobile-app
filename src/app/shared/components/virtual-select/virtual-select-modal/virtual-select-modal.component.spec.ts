import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, take } from 'rxjs';
import { VirtualSelectModalComponent } from './virtual-select-modal.component';
import {
  expectedFilteredOptionsData,
  expectedSelectableOptionsData,
  expectedVirtualSelectOptionData,
  virtualSelectOptionData,
  virtualSelectOptionData3,
  virtualSelectOptionData4,
  virtualSelectOptionData5,
} from 'src/app/core/mock-data/virtual-select-option.data';
import { cloneDeep } from 'lodash';
import { getElementRef } from 'src/app/core/dom-helpers';

describe('VirtualSelectModalComponent', () => {
  let component: VirtualSelectModalComponent;
  let fixture: ComponentFixture<VirtualSelectModalComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let recentLocalStorageItemsService: jasmine.SpyObj<RecentLocalStorageItemsService>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let inputElement: HTMLInputElement;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const recentLocalStorageItemsServiceSpy = jasmine.createSpyObj('RecentLocalStorageItemsService', ['get', 'post']);
    const utilityServiceSpy = jasmine.createSpyObj('UtilityService', ['searchArrayStream']);

    TestBed.configureTestingModule({
      declarations: [VirtualSelectModalComponent],
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

    fixture = TestBed.createComponent(VirtualSelectModalComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    recentLocalStorageItemsService = TestBed.inject(
      RecentLocalStorageItemsService
    ) as jasmine.SpyObj<RecentLocalStorageItemsService>;
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
    component.enableSearch = true;
    component.searchBarRef = getElementRef(fixture, '.selection-modal--search-input');
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngAfterViewInit():', () => {
    beforeEach(() => {
      spyOn(component, 'setSelectableOptions');
      spyOn(component, 'setFilteredOptions');
      fixture.detectChanges();
      inputElement = component.searchBarRef.nativeElement;
      component.currentSelection = cloneDeep(virtualSelectOptionData);
      component.defaultLabelProp = 'label';
      component.options = cloneDeep(virtualSelectOptionData4);
    });

    it('should set filteredOptions$ equals to value returned by setFilteredOptions whenever input changes', fakeAsync(() => {
      component.setFilteredOptions = jasmine
        .createSpy()
        .and.returnValues(virtualSelectOptionData4, expectedVirtualSelectOptionData);
      component.nullOption = true;
      component.ngAfterViewInit();
      inputElement.value = '';
      inputElement.dispatchEvent(new Event('keyup'));
      tick(100);
      component.filteredOptions$.pipe(take(1)).subscribe((res) => {
        expect(res).toEqual(virtualSelectOptionData4);
      });
      inputElement.value = 'ail';
      inputElement.dispatchEvent(new Event('keyup'));

      tick(100);
      component.filteredOptions$.pipe(take(1)).subscribe((res) => {
        expect(res).toEqual(expectedVirtualSelectOptionData);
      });
    }));

    it('should update recentlyUsedItems$', fakeAsync(() => {
      spyOn(component, 'getRecentlyUsedItems').and.returnValue(of(virtualSelectOptionData5));
      utilityService.searchArrayStream.and.returnValues(
        () => of(virtualSelectOptionData5),
        () => of([virtualSelectOptionData5[1]])
      );
      component.ngAfterViewInit();
      inputElement.value = '';
      inputElement.dispatchEvent(new Event('keyup'));

      tick(100);
      component.recentlyUsedItems$.pipe(take(1)).subscribe((res) => {
        expect(utilityService.searchArrayStream).toHaveBeenCalledWith('');
        expect(res).toEqual(virtualSelectOptionData5);
      });

      inputElement.value = 'tra';
      inputElement.dispatchEvent(new Event('keyup'));

      tick(100);
      component.recentlyUsedItems$.pipe(take(1)).subscribe((res) => {
        expect(utilityService.searchArrayStream).toHaveBeenCalledWith('tra');
        expect(res).toEqual([virtualSelectOptionData5[1]]);
      });
      expect(utilityService.searchArrayStream).toHaveBeenCalledTimes(2);
      expect(component.getRecentlyUsedItems).toHaveBeenCalledTimes(2);
    }));

    it('should update the filteredOptions$ if searchBarRef is not defined', (done) => {
      component.enableSearch = false;
      component.nullOption = true;
      component.currentSelection = virtualSelectOptionData;
      fixture.detectChanges();

      component.ngAfterViewInit();
      expect(component.searchBarRef).toBeUndefined();

      component.filteredOptions$.subscribe((res) => {
        expect(res).toEqual([{ label: 'None', value: null }, ...virtualSelectOptionData4]);
        done();
      });
    });
  });

  it('onDoneClick(): should dismiss the modal', () => {
    component.onDoneClick();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('clearValue(): should clear the value and trigger a keyup event', () => {
    spyOn(component, 'setSelectableOptions');
    spyOn(component, 'setFilteredOptions');
    fixture.detectChanges();
    inputElement = component.searchBarRef.nativeElement;
    inputElement.value = 'example';
    spyOn(inputElement, 'dispatchEvent');
    fixture.detectChanges();
    component.clearValue();

    expect(component.value).toBe('');
    expect(inputElement.value).toBe('');
    expect(inputElement.dispatchEvent).toHaveBeenCalledOnceWith(new Event('keyup'));
  });

  describe('getRecentlyUsedItems(): ', () => {
    const mockOptions = cloneDeep(virtualSelectOptionData4);
    const options = mockOptions;
    const mockRecentlyUsedItems = cloneDeep(virtualSelectOptionData5);
    const recentlyUsed = mockRecentlyUsedItems;
    const mockLocalStorageItems = cloneDeep(virtualSelectOptionData5);
    const localStorageItems = mockLocalStorageItems;
    const filteredItems = [mockOptions[1]];

    it('should return recently used items from API if available', (done) => {
      component.recentlyUsed = recentlyUsed;
      component.options = [];
      component.getRecentlyUsedItems().subscribe((result) => {
        expect(recentLocalStorageItemsService.get).not.toHaveBeenCalled();
        expect(result).toEqual(recentlyUsed);
        done();
      });
    });

    it('should return recently used items from local storage if not available from API', (done) => {
      const getSpy = recentLocalStorageItemsService.get.and.resolveTo(localStorageItems);
      component.options = options;
      component.recentlyUsed = null;
      component.currentSelection = virtualSelectOptionData;

      component.getRecentlyUsedItems().subscribe((result) => {
        expect(getSpy).toHaveBeenCalledOnceWith(component.cacheName);
        expect(result).toEqual(filteredItems);
        done();
      });
    });
  });

  it('onElementSelect(): should call recentlocalstorage service and dismiss the modal', () => {
    component.cacheName = 'cache1';
    const option = virtualSelectOptionData4[1];
    component.onElementSelect(option);
    expect(recentLocalStorageItemsService.post).toHaveBeenCalledOnceWith('cache1', option, 'label');
    expect(modalController.dismiss).toHaveBeenCalledOnceWith(option);
  });

  it('saveToCacheAndUse(): should call onElementSelect', () => {
    spyOn(component, 'setSelectableOptions');
    spyOn(component, 'setFilteredOptions');
    fixture.detectChanges();
    inputElement = component.searchBarRef.nativeElement;
    inputElement.value = 'example';
    fixture.detectChanges();
    spyOn(component, 'onElementSelect');
    component.saveToCacheAndUse();
    expect(component.onElementSelect).toHaveBeenCalledOnceWith({
      label: 'example',
      value: 'example',
      selected: false,
    });
  });

  it('setSelectableOptions(): should update selectableOptions correctly', fakeAsync(() => {
    const mockFilteredOptions = virtualSelectOptionData4;
    const mockRecentlyUsedItems = virtualSelectOptionData5;
    component.filteredOptions$ = of(mockFilteredOptions);
    component.recentlyUsedItems$ = of(mockRecentlyUsedItems);
    component.setSelectableOptions();
    tick(100);

    expect(component.selectableOptions).toEqual(expectedSelectableOptionsData);
  }));

  it('setFilteredOptions(): should update filteredOptions correctly', fakeAsync(() => {
    component.nullOption = true;
    component.currentSelection = cloneDeep(virtualSelectOptionData3);
    component.defaultLabelProp = 'label';
    component.options = cloneDeep(virtualSelectOptionData4);

    const res = component.setFilteredOptions('ai');
    tick(100);

    expect(res).toEqual(expectedFilteredOptionsData);
  }));
});
