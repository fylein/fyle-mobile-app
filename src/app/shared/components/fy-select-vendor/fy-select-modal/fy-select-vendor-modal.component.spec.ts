import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { VendorService } from 'src/app/core/services/vendor.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { FySelectVendorModalComponent } from './fy-select-vendor-modal.component';
import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { of } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { click, getElementBySelector } from 'src/app/core/dom-helpers';

describe('FySelectVendorModalComponent', () => {
  let component: FySelectVendorModalComponent;
  let fixture: ComponentFixture<FySelectVendorModalComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;
  let vendorService: jasmine.SpyObj<VendorService>;
  let recentLocalStorageItemsService: jasmine.SpyObj<RecentLocalStorageItemsService>;
  let utilityService: jasmine.SpyObj<UtilityService>;

  const vendors = [
    {
      id: 309,
      cin: null,
      tin: null,
      display_name: 'Fuel',
      other_names: null,
      creator_id: 'SYSTEM',
      created_at: new Date('2017-06-18T15:52:26.857075Z'),
      updated_at: new Date('2020-06-09T19:16:44.618140Z'),
      default_category: null,
      verified: true,
    },
    {
      id: 437,
      cin: null,
      tin: null,
      display_name: 'Fedex',
      other_names: null,
      creator_id: 'SYSTEM',
      created_at: new Date('2017-06-18T15:52:26.857075Z'),
      updated_at: new Date('2019-07-10T12:07:59.158939Z'),
      default_category: null,
      verified: true,
    },
    {
      id: 314,
      cin: null,
      tin: null,
      display_name: 'Fastrak',
      other_names: null,
      creator_id: 'SYSTEM',
      created_at: new Date('2017-06-18T15:52:26.857075Z'),
      updated_at: new Date('2020-10-14T07:19:18.958436Z'),
      default_category: null,
      verified: true,
    },
    {
      id: 101,
      cin: null,
      tin: null,
      display_name: 'fyle.in',
      other_names: null,
      creator_id: 'ouD8bcoymzv3',
      created_at: new Date('2017-01-30T08:09:24.393267Z'),
      updated_at: new Date('2020-11-03T17:12:50.250702Z'),
      default_category: 'Unspecified',
      verified: true,
    },
  ];

  const vendorsList = [
    {
      label: 'vendor 1',
      value: vendors[0],
    },
    {
      label: 'vendor 2',
      value: vendors[1],
    },
  ];

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const vendorServiceSpy = jasmine.createSpyObj('VendorService', ['get']);
    const recentLocalStorageItemsServiceSpy = jasmine.createSpyObj('RecentLocalStorageItemsService', ['get', 'post']);
    const utilityServiceSpy = jasmine.createSpyObj('UtilityService', ['searchArrayStream']);
    const changeDetectionRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    TestBed.configureTestingModule({
      declarations: [FySelectVendorModalComponent],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        MatIconModule,
        MatIconTestingModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: ChangeDetectorRef,
          useValue: changeDetectionRefSpy,
        },
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: VendorService,
          useValue: vendorServiceSpy,
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
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(FySelectVendorModalComponent);
    component = fixture.componentInstance;

    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    vendorService = TestBed.inject(VendorService) as jasmine.SpyObj<VendorService>;
    recentLocalStorageItemsService = TestBed.inject(
      RecentLocalStorageItemsService
    ) as jasmine.SpyObj<RecentLocalStorageItemsService>;
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
    cdr = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;

    vendorService.get.and.returnValue(of(vendors));
    recentLocalStorageItemsService.get.and.returnValue(Promise.resolve(vendorsList));
    utilityService.searchArrayStream.and.returnValue(() => of([{ label: '', value: '' }]));
    component.filteredOptions$ = of(vendorsList);

    component.currentSelection = vendorsList;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('clearValue(): ', () => {
    component.value = 'value';
    const dummyHtmlInputElement = document.createElement('input');
    component.searchBarRef = {
      nativeElement: dummyHtmlInputElement,
    };
    fixture.detectChanges();

    component.clearValue();
    expect(component.value).toEqual('');
    expect(component.searchBarRef.nativeElement.value).toEqual('');
  });

  it('getRecentlyUsedVendors(): should get recently used vendors', (done) => {
    recentLocalStorageItemsService.get.and.returnValue(Promise.resolve(vendorsList));

    component.getRecentlyUsedVendors().subscribe((res) => {
      expect(recentLocalStorageItemsService.get).toHaveBeenCalledWith('recentVendorList');
      done();
    });
  });

  it('onDoneClick(): should dismiss the modal when clicking on done CTA', () => {
    modalController.dismiss.and.returnValue(Promise.resolve(true));

    component.onDoneClick();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('onElementSelect(): should dismiss modal with the selected vendor', () => {
    recentLocalStorageItemsService.post.and.callThrough();
    modalController.dismiss.and.returnValue(Promise.resolve(true));

    component.onElementSelect(vendorsList[0]);
    expect(modalController.dismiss).toHaveBeenCalledOnceWith(vendorsList[0]);
    expect(recentLocalStorageItemsService.post).toHaveBeenCalledOnceWith('recentVendorList', vendorsList[0], 'label');
  });

  it('onNewSelect(): should dismiss the modal with new option selected', () => {
    modalController.dismiss.and.returnValue(Promise.resolve(true));
    recentLocalStorageItemsService.post.and.callThrough();
    component.value = 'value  ';
    fixture.detectChanges();

    component.onNewSelect();
    const newOption = {
      label: component.value,
      value: { display_name: component.value },
    };
    expect(modalController.dismiss).toHaveBeenCalledOnceWith(newOption);
    expect(recentLocalStorageItemsService.post).toHaveBeenCalledOnceWith('recentVendorList', newOption, 'label');
  });

  it('ngAfterViewInit(): should get vendors if search text is available', fakeAsync(() => {
    vendorService.get.and.returnValue(of(vendors));
    const dummyHtmlInputElement = document.createElement('input');
    component.searchBarRef = {
      nativeElement: dummyHtmlInputElement,
    };

    component.ngAfterViewInit();

    dummyHtmlInputElement.value = 'US';
    dummyHtmlInputElement.dispatchEvent(new Event('keyup'));

    tick(500);
    component.filteredOptions$.subscribe(() => {
      expect(vendorService.get).toHaveBeenCalledOnceWith('US');
      expect(component.isLoading).toBeFalse();
    });
  }));

  it('should close modal when clicked on', () => {
    spyOn(component, 'onDoneClick').and.callThrough();

    const closeButton = getElementBySelector(fixture, '.fy-icon-close') as HTMLElement;
    click(closeButton);

    expect(component.onDoneClick).toHaveBeenCalledTimes(1);
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('should clear value when clicked on', () => {
    component.value = 'value';
    spyOn(component, 'clearValue').and.callThrough();
    fixture.detectChanges();

    const clearButton = getElementBySelector(fixture, '[data-testid="clear"]') as HTMLElement;
    click(clearButton);

    expect(component.clearValue).toHaveBeenCalledTimes(1);
    expect(component.value).toEqual('');
  });

  it('should add a new entry when selected', () => {
    spyOn(component, 'onNewSelect').and.callThrough();
    component.value = 'value1';
    fixture.detectChanges();

    const addNewButton = getElementBySelector(fixture, '.selection-modal--list-element') as HTMLElement;
    click(addNewButton);

    const option = {
      label: 'value1',
      value: { display_name: 'value1' },
    };

    expect(component.onNewSelect).toHaveBeenCalledTimes(1);
    expect(modalController.dismiss).toHaveBeenCalledOnceWith(option);
    expect(component.value).toEqual('value1');
    expect(recentLocalStorageItemsService.post).toHaveBeenCalledOnceWith('recentVendorList', option, 'label');
  });
});
