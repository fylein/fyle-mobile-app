import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
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
import {
  advanceRequestFileUrlData,
  advanceRequestFileUrlData2,
  expectedFileData1,
  fileObject10,
  fileObject4,
} from 'src/app/core/mock-data/file-object.data';
import { of } from 'rxjs';
import { transformedResponse2 } from 'src/app/core/mock-data/expense-field.data';
import { extendedAdvReqDraft } from 'src/app/core/mock-data/extended-advance-request.data';
import { apiAdvanceRequestAction } from 'src/app/core/mock-data/advance-request-actions.data';
import { advanceReqApprovals } from 'src/app/core/mock-data/approval.data';
import { advanceRequestCustomFieldData2 } from 'src/app/core/mock-data/advance-requests-custom-fields.data';
import { customFields } from 'src/app/core/mock-data/custom-field.data';
import { advanceRequests } from 'src/app/core/mock-data/advance-requests.data';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { properties } from 'src/app/core/mock-data/modal-properties.data';
import { modalControllerParams8, modalControllerParams9 } from 'src/app/core/mock-data/modal-controller.data';

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
      'pullBackAdvanceRequest',
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
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);

    TestBed.configureTestingModule({
      declarations: [MyViewAdvanceRequestPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AdvanceRequestService, useValue: advanceRequestServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: PopoverController, useValue: popoverControllerSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
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

  it('statisticTypes(): should return statistic types', () => {
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

  describe('ionViewWillEnter():', () => {
    beforeEach(() => {
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();
      advanceRequestService.getAdvanceRequest.and.returnValue(of(extendedAdvReqDraft));
      advanceRequestService.getInternalStateAndDisplayName.and.returnValue({
        state: 'DRAFT',
        name: 'Draft',
      });
      advanceRequestService.getActions.and.returnValue(of(apiAdvanceRequestAction));
      advanceRequestService.getActiveApproversByAdvanceRequestId.and.returnValue(of(advanceReqApprovals));
      const mockFileObject = cloneDeep(advanceRequestFileUrlData[0]);
      spyOn(component, 'getReceiptDetails').and.returnValue({
        type: 'pdf',
        thumbnail: 'img/fy-pdf.svg',
      });
      fileService.downloadUrl.and.returnValue(of('mockdownloadurl.png'));
      fileService.findByAdvanceRequestId.and.returnValue(of([mockFileObject]));
      const mockAdvRequestCustomFields = cloneDeep(advanceRequestCustomFieldData2);
      advanceRequestsCustomFieldsService.getAll.and.returnValue(of(mockAdvRequestCustomFields));
      spyOn(component, 'getAndUpdateProjectName');
      advanceRequestService.modifyAdvanceRequestCustomFields.and.returnValue(customFields);
    });

    it('should set advanceRequest$, internal state and currency symbol to $', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(100);

      component.advanceRequest$.subscribe((res) => {
        expect(advanceRequestService.getAdvanceRequest).toHaveBeenCalledOnceWith('areqR1cyLgXdND');
        expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(res).toEqual(extendedAdvReqDraft);
      });
      expect(advanceRequestService.getInternalStateAndDisplayName).toHaveBeenCalledOnceWith(extendedAdvReqDraft);
      expect(component.internalState).toEqual({
        state: 'DRAFT',
        name: 'Draft',
      });
      expect(component.currencySymbol).toEqual('$');
    }));

    it('should set currency symbol to undefined if advance request is undefined', fakeAsync(() => {
      advanceRequestService.getAdvanceRequest.and.returnValue(of(undefined));
      component.ionViewWillEnter();
      tick(100);

      expect(component.internalState).toEqual({
        state: 'DRAFT',
        name: 'Draft',
      });
      expect(component.currencySymbol).toEqual(undefined);
    }));

    it('should set actions$ to actions', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(100);

      component.actions$.subscribe((res) => {
        expect(res).toEqual(apiAdvanceRequestAction);
      });
      expect(advanceRequestService.getActions).toHaveBeenCalledOnceWith('areqR1cyLgXdND');
    }));

    it('should set activeApprovals$ to active approvals', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(100);

      component.activeApprovals$.subscribe((res) => {
        expect(res).toEqual(advanceReqApprovals);
      });
      expect(advanceRequestService.getActiveApproversByAdvanceRequestId).toHaveBeenCalledOnceWith('areqR1cyLgXdND');
    }));

    it('should set attachedFiles$ to attached files', fakeAsync(() => {
      const mockFileObject = cloneDeep(expectedFileData1[0]);
      fileService.findByAdvanceRequestId.and.returnValue(of([mockFileObject]));
      component.ionViewWillEnter();
      tick(100);

      component.attachedFiles$.subscribe((res) => {
        expect(fileService.findByAdvanceRequestId).toHaveBeenCalledOnceWith('areqR1cyLgXdND');
        expect(fileService.downloadUrl).toHaveBeenCalledOnceWith('fiV1gXpyCcbU');
        expect(res).toEqual([mockFileObject]);
      });
    }));

    it('should call advanceRequestService.modifyAdvanceRequestCustomFields and getAndUpdateProjectName once', fakeAsync(() => {
      const mockAdvRequestCustomFields = cloneDeep(advanceRequestCustomFieldData2);
      advanceRequestsCustomFieldsService.getAll.and.returnValue(of(mockAdvRequestCustomFields));

      component.ionViewWillEnter();
      tick(100);

      component.advanceRequestCustomFields$.subscribe(() => {
        expect(advanceRequestService.modifyAdvanceRequestCustomFields).toHaveBeenCalledOnceWith(
          JSON.parse(extendedAdvReqDraft.areq_custom_field_values)
        );
        expect(advanceRequestsCustomFieldsService.getAll).toHaveBeenCalledTimes(1);
      });
      expect(component.getAndUpdateProjectName).toHaveBeenCalledTimes(1);
    }));
  });

  it('pullBack(): should pull back advance request and navigate to my_advances page', fakeAsync(() => {
    advanceRequestService.pullBackadvanceRequest.and.returnValue(of(advanceRequests));
    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo();
    const pullBackPopoverSpy = jasmine.createSpyObj('pullBackPopover', ['present', 'onWillDismiss']);
    pullBackPopoverSpy.onWillDismiss.and.resolveTo({ data: { comment: 'test comment' } });
    popoverController.create.and.resolveTo(pullBackPopoverSpy);
    component.pullBack();
    tick(100);

    expect(advanceRequestService.pullBackadvanceRequest).toHaveBeenCalledOnceWith('areqR1cyLgXdND', {
      status: {
        comment: 'test comment',
      },
      notify: false,
    });
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_advances']);
    expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
  }));

  it('edit(): should navigate to add-edit-advance-request page', () => {
    component.edit();
    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'add_edit_advance_request',
      { id: 'areqR1cyLgXdND' },
    ]);
  });

  it('delete(): should show delete advance request popover and navigate to my_advances page', fakeAsync(() => {
    const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);
    deletePopoverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });
    popoverController.create.and.resolveTo(deletePopoverSpy);
    advanceRequestService.delete.and.returnValue(of(advanceRequests));

    component.delete();
    tick(100);

    expect(deletePopoverSpy.present).toHaveBeenCalledTimes(1);
    expect(deletePopoverSpy.onDidDismiss).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_advances']);
  }));

  describe('openCommentsModal():', () => {
    let commentsModalSpy: jasmine.SpyObj<HTMLIonModalElement>;
    beforeEach(() => {
      component.advanceRequest$ = of(extendedAdvReqDraft);
      modalProperties.getModalDefaultProperties.and.returnValue(properties);
      commentsModalSpy = jasmine.createSpyObj('modal', ['present', 'onDidDismiss']);
      commentsModalSpy.onDidDismiss.and.resolveTo({ data: { updated: true } });
      modalController.create.and.resolveTo(commentsModalSpy);
    });

    it('should open comments modal and track addComment event if updated is true', fakeAsync(() => {
      component.openCommentsModal();
      tick(100);

      expect(modalController.create).toHaveBeenCalledOnceWith(modalControllerParams8);
      expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
      expect(commentsModalSpy.present).toHaveBeenCalledTimes(1);
      expect(commentsModalSpy.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(trackingService.addComment).toHaveBeenCalledTimes(1);
      expect(trackingService.viewComment).not.toHaveBeenCalled();
    }));

    it('should open comments modal and track viewComment event if updated is false', fakeAsync(() => {
      commentsModalSpy.onDidDismiss.and.resolveTo({ data: { updated: false } });
      modalController.create.and.resolveTo(commentsModalSpy);

      component.openCommentsModal();
      tick(100);

      expect(modalController.create).toHaveBeenCalledOnceWith(modalControllerParams8);
      expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
      expect(commentsModalSpy.present).toHaveBeenCalledTimes(1);
      expect(commentsModalSpy.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(trackingService.viewComment).toHaveBeenCalledTimes(1);
      expect(trackingService.addComment).not.toHaveBeenCalled();
    }));
  });

  it('viewAttachments(): should open attachments modal', fakeAsync(() => {
    const attachmentsModalSpy = jasmine.createSpyObj('attachmentsModal', ['present']);
    modalController.create.and.resolveTo(attachmentsModalSpy);
    modalProperties.getModalDefaultProperties.and.returnValue(properties);
    component.viewAttachments(fileObject4[0]);
    tick(100);

    expect(modalController.create).toHaveBeenCalledOnceWith(modalControllerParams9);
    expect(attachmentsModalSpy.present).toHaveBeenCalledTimes(1);
    expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
  }));
});
