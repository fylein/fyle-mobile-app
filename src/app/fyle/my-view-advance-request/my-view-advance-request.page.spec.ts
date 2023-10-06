import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, NavController, PopoverController } from '@ionic/angular';

import { MyViewAdvanceRequestPage } from './my-view-advance-request.page';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { FileService } from 'src/app/core/services/file.service';
import { ActivatedRoute, Router, UrlSerializer } from '@angular/router';
import { AdvanceRequestsCustomFieldsService } from 'src/app/core/services/advance-requests-custom-fields.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { MIN_SCREEN_WIDTH } from 'src/app/app.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { StatisticTypes } from 'src/app/shared/components/fy-statistic/statistic-type.enum';
import { cloneDeep } from 'lodash';
import { advanceRequestFileUrlData2 } from 'src/app/core/mock-data/file-object.data';
import { of } from 'rxjs';
import { transformedResponse2 } from 'src/app/core/mock-data/expense-field.data';

describe('MyViewAdvanceRequestPage', () => {
  let component: MyViewAdvanceRequestPage;
  let fixture: ComponentFixture<MyViewAdvanceRequestPage>;
  let advanceRequestService: jasmine.SpyObj<AdvanceRequestService>;
  let fileService: jasmine.SpyObj<FileService>;
  let router: jasmine.SpyObj<Router>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let advanceRequestsCustomFieldsService: jasmine.SpyObj<AdvanceRequestsCustomFieldsService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;

  beforeEach(waitForAsync(() => {
    const advanceRequestServiceSpy = jasmine.createSpyObj('AdvanceRequestService', [
      'getAdvanceRequest',
      'getActions',
      'getInternalStateAndDisplayName',
      'getActiveApproversByAdvanceRequestId',
      'modifyAdvanceRequestCustomFields',
      'pullBackadvanceRequest',
      'delete',
    ]);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['findByAdvanceRequestId', 'downloadUrl']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create', 'getTop']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const advanceRequestsCustomFieldsServiceSpy = jasmine.createSpyObj('AdvanceRequestsCustomFieldsService', [
      'getAll',
    ]);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['addComment', 'viewComment']);
    const expenseFieldsServiceSpy = jasmine.createSpyObj('ExpenseFieldsService', ['getAllEnabled']);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['navigateForward']);

    TestBed.configureTestingModule({
      declarations: [MyViewAdvanceRequestPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AdvanceRequestService, useValue: advanceRequestServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: PopoverController, useValue: popoverControllerSpy },
        { provide: LoaderService, useValue: loaderService },
        { provide: AdvanceRequestsCustomFieldsService, useValue: advanceRequestsCustomFieldsServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: ModalPropertiesService, useValue: modalPropertiesSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                id: 'areqR1cyLgXdND',
              },
            },
          },
        },
        { provide: ExpenseFieldsService, useValue: expenseFieldsServiceSpy },
        {
          provide: MIN_SCREEN_WIDTH,
          useValue: 230,
        },
        UrlSerializer,
        { provide: NavController, useValue: navControllerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MyViewAdvanceRequestPage);
    component = fixture.componentInstance;
    advanceRequestService = TestBed.inject(AdvanceRequestService) as jasmine.SpyObj<AdvanceRequestService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    advanceRequestsCustomFieldsService = TestBed.inject(
      AdvanceRequestsCustomFieldsService
    ) as jasmine.SpyObj<AdvanceRequestsCustomFieldsService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('StatisticTypes(): should return statistic types', () => {
    expect(component.StatisticTypes).toEqual(StatisticTypes);
  });

  it('getReceiptExtension(): should return the extension of the receipt', () => {
    const mockFileObject = cloneDeep(advanceRequestFileUrlData2[0]);
    const result = component.getReceiptExtension(mockFileObject.name);
    expect(result).toEqual('pdf');
  });

  describe('getReceiptDetails():', () => {
    it('should return the receipt details with thumbnail as fy-receipt.svg if extension is pdf', () => {
      spyOn(component, 'getReceiptExtension').and.returnValue('pdf');
      const mockFileObject = cloneDeep(advanceRequestFileUrlData2[0]);
      const result = component.getReceiptDetails(mockFileObject);
      expect(component.getReceiptExtension).toHaveBeenCalledOnceWith(mockFileObject.name);
      expect(result).toEqual({
        type: 'pdf',
        thumbnail: 'img/fy-pdf.svg',
      });
    });

    it('should return the receipt details with type as image and thumbnail as file url if extension is png', () => {
      spyOn(component, 'getReceiptExtension').and.returnValue('png');
      const mockFileObject = cloneDeep(advanceRequestFileUrlData2[0]);
      const result = component.getReceiptDetails(mockFileObject);
      expect(component.getReceiptExtension).toHaveBeenCalledOnceWith(mockFileObject.name);
      expect(result).toEqual({
        type: 'image',
        thumbnail:
          'https://fyle-storage-mumbai-3.s3.amazonaws.com/2023-02-23/orrjqbDbeP9p/receipts/fiSSsy2Bf4Se.000.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230223T151537Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=AKIA54Z3LIXTX6CFH4VG%2F20230223%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=d79c2711892e7cb3f072e223b7b416408c252da38e7df0995e3d256cd8509fee',
      });
    });
  });

  it('getAndUpdateProjectName(): should set project field name equal to field name having column name as project_id', () => {
    expenseFieldsService.getAllEnabled.and.returnValue(of(transformedResponse2));

    component.getAndUpdateProjectName();

    expect(component.projectFieldName).toEqual('Purpose');
  });
});
