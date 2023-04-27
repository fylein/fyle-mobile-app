import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
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
import { MatFormField, MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { CdkScrollableModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

fdescribe('FySelectVendorModalComponent', () => {
  let component: FySelectVendorModalComponent;
  let fixture: ComponentFixture<FySelectVendorModalComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let cdr: ChangeDetectorRef;
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
        ChangeDetectorRef,
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
    cdr = TestBed.inject(ChangeDetectorRef);

    vendorService.get.and.returnValue(of(vendors));
    recentLocalStorageItemsService.get.and.returnValue(Promise.resolve(vendorsList));
    component.filteredOptions$ = of(vendorsList);

    component.currentSelection = vendorsList;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('clearValue', () => {});

  xit('getRecentlyUsedVendors', () => {});

  xit('onDoneClick', () => {});

  xit('onElementSelect', () => {});

  xit('onNewSelect', () => {});
});
