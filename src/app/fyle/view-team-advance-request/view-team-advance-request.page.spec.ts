import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ActionSheetController, IonicModule, ModalController, NavController, PopoverController } from '@ionic/angular';

import { ViewTeamAdvanceRequestPage } from './view-team-advance-request.page';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { FileService } from 'src/app/core/services/file.service';
import { ActivatedRoute, Router, UrlSerializer } from '@angular/router';
import { PopupService } from 'src/app/core/services/popup.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AdvanceRequestsCustomFieldsService } from 'src/app/core/services/advance-requests-custom-fields.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { MIN_SCREEN_WIDTH } from 'src/app/app.module';
import { StatisticTypes } from 'src/app/shared/components/fy-statistic/statistic-type.enum';
import { transformedResponse2 } from 'src/app/core/mock-data/expense-field.data';
import { Subject, finalize, of } from 'rxjs';
import { singleExtendedAdvancesData } from 'src/app/core/mock-data/extended-advance.data';
import { extendedAdvReqDraft, myAdvanceRequestsData2 } from 'src/app/core/mock-data/extended-advance-request.data';
import { apiAdvanceRequestAction } from 'src/app/core/mock-data/advance-request-actions.data';
import { advanceReqApprovals } from 'src/app/core/mock-data/approval.data';
import { advanceRequestFileUrlData, fileObject10, fileObject4 } from 'src/app/core/mock-data/file-object.data';
import { advanceRequestCustomFieldData2 } from 'src/app/core/mock-data/advance-requests-custom-fields.data';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { customFields } from 'src/app/core/mock-data/custom-field.data';
import { cloneDeep } from 'lodash';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { popupConfigData3 } from 'src/app/core/mock-data/popup.data';
import { advanceRequests } from 'src/app/core/mock-data/advance-requests.data';
import {
  modalControllerParams6,
  modalControllerParams7,
  popoverControllerParams5,
  popoverControllerParams6,
  popoverControllerParams7,
} from 'src/app/core/mock-data/modal-controller.data';
import { properties } from 'src/app/core/mock-data/modal-properties.data';

describe('ViewTeamAdvanceRequestPage', () => {
  let component: ViewTeamAdvanceRequestPage;
  let fixture: ComponentFixture<ViewTeamAdvanceRequestPage>;
  let advanceRequestService: jasmine.SpyObj<AdvanceRequestService>;
  let fileService: jasmine.SpyObj<FileService>;
  let router: jasmine.SpyObj<Router>;
  let popupService: jasmine.SpyObj<PopupService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let actionSheetController: jasmine.SpyObj<ActionSheetController>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let advanceRequestsCustomFieldsService: jasmine.SpyObj<AdvanceRequestsCustomFieldsService>;
  let authService: jasmine.SpyObj<AuthService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;
  let humanizeCurrency: jasmine.SpyObj<HumanizeCurrencyPipe>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(waitForAsync(() => {
    const advanceRequestServiceSpy = jasmine.createSpyObj('AdvanceRequestService', [
      'getAdvanceRequest',
      'getActions',
      'getActiveApproversByAdvanceRequestId',
      'modifyAdvanceRequestCustomFields',
      'delete',
      'approve',
      'sendBack',
      'reject',
    ]);
    const fileServiceSpy = jasmine.createSpyObj('FileService', [
      'findByAdvanceRequestId',
      'downloadUrl',
      'getReceiptsDetails',
      '',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const actionSheetControllerSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const advanceRequestsCustomFieldsServiceSpy = jasmine.createSpyObj('AdvanceRequestsCustomFieldsService', [
      'getAll',
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create', 'getTop']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'sendBackAdvance',
      'rejectAdvance',
      'addComment',
      'viewComment',
    ]);
    const expenseFieldsServiceSpy = jasmine.createSpyObj('ExpenseFieldsService', ['getAllEnabled']);
    const humanizeCurrencySpy = jasmine.createSpyObj('HumanizeCurrencyPipe', ['transform']);

    TestBed.configureTestingModule({
      declarations: [ViewTeamAdvanceRequestPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AdvanceRequestService, useValue: advanceRequestServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: PopupService, useValue: popupServiceSpy },
        { provide: PopoverController, useValue: popoverControllerSpy },
        { provide: ActionSheetController, useValue: actionSheetControllerSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: AdvanceRequestsCustomFieldsService, useValue: advanceRequestsCustomFieldsServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: ModalPropertiesService, useValue: modalPropertiesSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: ExpenseFieldsService, useValue: expenseFieldsServiceSpy },
        { provide: HumanizeCurrencyPipe, useValue: humanizeCurrencySpy },
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
        {
          provide: MIN_SCREEN_WIDTH,
          useValue: 230,
        },
        UrlSerializer,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewTeamAdvanceRequestPage);
    component = fixture.componentInstance;

    advanceRequestService = TestBed.inject(AdvanceRequestService) as jasmine.SpyObj<AdvanceRequestService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    popupService = TestBed.inject(PopupService) as jasmine.SpyObj<PopupService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    actionSheetController = TestBed.inject(ActionSheetController) as jasmine.SpyObj<ActionSheetController>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    advanceRequestsCustomFieldsService = TestBed.inject(
      AdvanceRequestsCustomFieldsService
    ) as jasmine.SpyObj<AdvanceRequestsCustomFieldsService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
    humanizeCurrency = TestBed.inject(HumanizeCurrencyPipe) as jasmine.SpyObj<HumanizeCurrencyPipe>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('StatisticTypes(): should return statistic types', () => {
    expect(component.StatisticTypes).toEqual(StatisticTypes);
  });

  it('getAndUpdateProjectName(): should return expense field with column name as project_id', fakeAsync(() => {
    expenseFieldsService.getAllEnabled.and.returnValue(of(transformedResponse2));

    const res = component.getAndUpdateProjectName();
    tick(100);

    res.then((data) => {
      expect(data).toEqual(transformedResponse2[0]);
    });
  }));

  describe('ionViewWillEnter():', () => {
    beforeEach(() => {
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();
      advanceRequestService.getAdvanceRequest.and.returnValue(of(extendedAdvReqDraft));
      advanceRequestService.getActions.and.returnValue(of(apiAdvanceRequestAction));
      advanceRequestService.getActiveApproversByAdvanceRequestId.and.returnValue(of(advanceReqApprovals));
      spyOn(component, 'getAttachedReceipts').and.returnValue(of(fileObject4));
      advanceRequestsCustomFieldsService.getAll.and.returnValue(of(advanceRequestCustomFieldData2));
      authService.getEou.and.resolveTo(apiEouRes);
      advanceRequestService.modifyAdvanceRequestCustomFields.and.returnValue(customFields);
      advanceRequestService.modifyAdvanceRequestCustomFields.and.returnValue(customFields);
      spyOn(component, 'setupActionSheet');
      spyOn(component, 'getAndUpdateProjectName').and.resolveTo(transformedResponse2[0]);
    });

    it('should set advanceRequest$, actions$ and showAdvanceActions$ correctly', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(100);

      component.advanceRequest$
        .pipe(
          finalize(() => {
            expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
          })
        )
        .subscribe((data) => {
          expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
          expect(data).toEqual(extendedAdvReqDraft);
          expect(advanceRequestService.getAdvanceRequest).toHaveBeenCalledOnceWith('areqR1cyLgXdND');
        });

      component.actions$.subscribe((data) => {
        expect(data).toEqual(apiAdvanceRequestAction);
        expect(advanceRequestService.getActions).toHaveBeenCalledOnceWith('areqR1cyLgXdND');
      });

      component.showAdvanceActions$.subscribe((data) => {
        expect(data).toEqual(false);
      });
    }));

    it('should set approvals$, activeApprovals$, attachedFiles$ and customFields$ correctly', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(100);

      component.approvals$.subscribe((data) => {
        expect(data).toEqual(advanceReqApprovals);
        expect(advanceRequestService.getActiveApproversByAdvanceRequestId).toHaveBeenCalledOnceWith('areqR1cyLgXdND');
      });

      component.activeApprovals$.subscribe((data) => {
        expect(data).toEqual(advanceReqApprovals);
      });

      component.attachedFiles$.subscribe((data) => {
        expect(data).toEqual(fileObject4);
        expect(component.getAttachedReceipts).toHaveBeenCalledOnceWith('areqR1cyLgXdND');
      });

      component.customFields$.subscribe((data) => {
        expect(data).toEqual(advanceRequestCustomFieldData2);
        expect(advanceRequestsCustomFieldsService.getAll).toHaveBeenCalledTimes(1);
      });
    }));

    it('should set advanceRequestCustomFields$ equal to custom fields returned by advanceRequestsCustomFieldsService.getAll', fakeAsync(() => {
      const mockCustomField = cloneDeep(advanceRequestCustomFieldData2);
      advanceRequestsCustomFieldsService.getAll.and.returnValue(of(mockCustomField));

      component.ionViewWillEnter();
      tick(100);

      component.advanceRequestCustomFields$.subscribe((data) => {
        expect(data).toEqual(mockCustomField);
        expect(advanceRequestsCustomFieldsService.getAll).toHaveBeenCalledTimes(1);
      });
    }));

    it('should set advanceRequestCustomFields$ equal to value returned by advanceRequestService.modifyAdvanceRequestCustomFields if user org id is not equal to advance request org id', fakeAsync(() => {
      const eouRes = cloneDeep(apiEouRes);
      eouRes.ou.org_id = 'or2390Fjsd';
      authService.getEou.and.resolveTo(eouRes);
      let customField: CustomField[] = JSON.parse(extendedAdvReqDraft.areq_custom_field_values);
      component.ionViewWillEnter();
      tick(100);

      component.advanceRequestCustomFields$.subscribe((data) => {
        expect(data).toEqual(customFields);
        expect(advanceRequestService.modifyAdvanceRequestCustomFields).toHaveBeenCalledOnceWith(customField);
      });
    }));

    it('should call setupActionScheet() and update projectFieldName correctly', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(100);

      expect(component.setupActionSheet).toHaveBeenCalledTimes(1);
      expect(component.getAndUpdateProjectName).toHaveBeenCalledTimes(1);
      expect(component.projectFieldName).toEqual('Purpose');
    }));
  });

  it('getAttachedReceipts(): should return all the attached receipts corresponding to an advance request', () => {
    const mockFileObject = cloneDeep(advanceRequestFileUrlData[0]);
    fileService.getReceiptsDetails.and.returnValue({
      type: 'pdf',
      thumbnail: 'src/assets/images/pdf-receipt-placeholder.png',
    });
    fileService.downloadUrl.and.returnValue(of('mockdownloadurl.png'));
    fileService.findByAdvanceRequestId.and.returnValue(of([mockFileObject]));
    component.getAttachedReceipts('areqR1cyLgXdND').subscribe((res) => {
      expect(fileService.getReceiptsDetails).toHaveBeenCalledOnceWith(mockFileObject.name, 'mockdownloadurl.png');
      expect(fileService.downloadUrl).toHaveBeenCalledOnceWith('fiSSsy2Bf4Se');
      expect(fileService.findByAdvanceRequestId).toHaveBeenCalledOnceWith('areqR1cyLgXdND');
      expect(res).toEqual(fileObject10);
    });
  });

  it('edit(): should navigate to add edit advance request page with params.from as TEAM_ADVANCE', () => {
    component.edit();
    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'add_edit_advance_request',
      {
        id: 'areqR1cyLgXdND',
        from: 'TEAM_ADVANCE',
      },
    ]);
  });

  describe('getApproverEmails():', () => {
    it('getApproverEmails(): should return approver emails', () => {
      const approvalEmails = component.getApproverEmails(advanceReqApprovals);
      expect(approvalEmails).toEqual(['ajain@fyle.in']);
    });

    it('getApproverEmails(): should return undefined if approvals are undefined', () => {
      const approvalEmails = component.getApproverEmails(undefined);
      expect(approvalEmails).toEqual(undefined);
    });
  });

  it('onUpdateApprover(): should refresh approvers', () => {
    spyOn(component.refreshApprovers$, 'next');
    component.onUpdateApprover(true);
    expect(component.refreshApprovers$.next).toHaveBeenCalledOnceWith(null);
  });

  it('delete(): should show delete popup and navigate to team_advance page', fakeAsync(() => {
    popupService.showPopup.and.resolveTo('primary');
    advanceRequestService.delete.and.returnValue(of(advanceRequests));

    component.delete();
    tick(100);

    expect(popupService.showPopup).toHaveBeenCalledOnceWith(popupConfigData3);
    expect(advanceRequestService.delete).toHaveBeenCalledOnceWith('areqR1cyLgXdND');
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'team_advance']);
  }));

  it('setupActionSheet(): should populate actionSheetButtons', fakeAsync(() => {
    spyOn(component, 'showApproveAdvanceSummaryPopover');
    spyOn(component, 'showSendBackAdvanceSummaryPopover');
    spyOn(component, 'showRejectAdvanceSummaryPopup');
    const mockActions = cloneDeep(apiAdvanceRequestAction);
    mockActions.can_approve = true;
    mockActions.can_inquire = true;
    mockActions.can_reject = true;
    component.actions$ = of(mockActions);
    component.setupActionSheet();

    component.actionSheetButtons.forEach((button) => {
      button.handler();
    });
    expect(component.showApproveAdvanceSummaryPopover).toHaveBeenCalledTimes(1);
    expect(component.showSendBackAdvanceSummaryPopover).toHaveBeenCalledTimes(1);
    expect(component.showRejectAdvanceSummaryPopup).toHaveBeenCalledTimes(1);
    expect(component.actionSheetButtons[0].text).toEqual('Approve Advance');
    expect(component.actionSheetButtons[1].text).toEqual('Send Back Advance');
    expect(component.actionSheetButtons[2].text).toEqual('Reject Advance');
  }));

  it('openActionSheet(): should call actionSheetController.create with correct params', fakeAsync(() => {
    const actionSheetSpy = jasmine.createSpyObj('ActionSheet', ['present']);
    actionSheetController.create.and.returnValue(actionSheetSpy);
    component.openActionSheet();
    tick(100);
    expect(actionSheetController.create).toHaveBeenCalledOnceWith({
      header: 'ADVANCE ACTIONS',
      mode: 'md',
      cssClass: 'fy-action-sheet advances-action-sheet',
      buttons: component.actionSheetButtons,
    });
    expect(actionSheetSpy.present).toHaveBeenCalledTimes(1);
  }));

  it('showApproveAdvanceSummaryPopover(): should show popup for approving advances', fakeAsync(() => {
    component.advanceRequest$ = of(extendedAdvReqDraft);
    humanizeCurrency.transform.and.returnValue('$54');
    const showApproverSpy = jasmine.createSpyObj('showApprover', ['present', 'onWillDismiss']);
    showApproverSpy.onWillDismiss.and.resolveTo({ data: { action: 'approve' } });
    popoverController.create.and.resolveTo(showApproverSpy);
    advanceRequestService.approve.and.returnValue(of(advanceRequests));

    component.showApproveAdvanceSummaryPopover();
    tick(100);

    expect(popoverController.create).toHaveBeenCalledOnceWith(popoverControllerParams5);
    expect(showApproverSpy.present).toHaveBeenCalledTimes(1);
    expect(showApproverSpy.onWillDismiss).toHaveBeenCalledTimes(1);
    expect(humanizeCurrency.transform).toHaveBeenCalledOnceWith(54, 'USD', false);
    expect(advanceRequestService.approve).toHaveBeenCalledOnceWith('areqoVuT5I8OOy');
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'team_advance']);
  }));

  it('showSendBackAdvanceSummaryPopover(): should show popup for sending back advances', fakeAsync(() => {
    const showApproverSpy = jasmine.createSpyObj('showApprover', ['present', 'onWillDismiss']);
    showApproverSpy.onWillDismiss.and.resolveTo({ data: { comment: 'comment' } });
    popoverController.create.and.resolveTo(showApproverSpy);
    advanceRequestService.sendBack.and.returnValue(of(advanceRequests));

    component.showSendBackAdvanceSummaryPopover();
    tick(100);

    expect(popoverController.create).toHaveBeenCalledOnceWith(popoverControllerParams6);
    expect(showApproverSpy.present).toHaveBeenCalledTimes(1);
    expect(showApproverSpy.onWillDismiss).toHaveBeenCalledTimes(1);
    expect(advanceRequestService.sendBack).toHaveBeenCalledOnceWith('areqR1cyLgXdND', {
      status: {
        comment: 'comment',
      },
      notify: false,
    });
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'team_advance']);
    expect(trackingService.sendBackAdvance).toHaveBeenCalledOnceWith({ Asset: 'Mobile' });
  }));

  it('showRejectAdvanceSummaryPopup(): should show popup for rejecting advances', fakeAsync(() => {
    const showApproverSpy = jasmine.createSpyObj('showApprover', ['present', 'onWillDismiss']);
    showApproverSpy.onWillDismiss.and.resolveTo({ data: { comment: 'comment' } });
    popoverController.create.and.resolveTo(showApproverSpy);
    advanceRequestService.reject.and.returnValue(of(advanceRequests));

    component.showRejectAdvanceSummaryPopup();
    tick(100);

    expect(popoverController.create).toHaveBeenCalledOnceWith(popoverControllerParams7);
    expect(showApproverSpy.present).toHaveBeenCalledTimes(1);
    expect(showApproverSpy.onWillDismiss).toHaveBeenCalledTimes(1);
    expect(advanceRequestService.reject).toHaveBeenCalledOnceWith('areqR1cyLgXdND', {
      status: {
        comment: 'comment',
      },
      notify: false,
    });
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'team_advance']);
    expect(trackingService.rejectAdvance).toHaveBeenCalledOnceWith({ Asset: 'Mobile' });
  }));

  describe('openCommentsModal():', () => {
    let modalSpy: jasmine.SpyObj<HTMLIonModalElement>;
    beforeEach(() => {
      modalSpy = jasmine.createSpyObj('modal', ['present', 'onDidDismiss']);
      modalSpy.onDidDismiss.and.resolveTo({ data: { updated: false } });
      modalController.create.and.resolveTo(modalSpy);
      modalProperties.getModalDefaultProperties.and.returnValue(properties);
    });

    it('should open comments modal and track viewComment event if updated if false', fakeAsync(() => {
      component.openCommentsModal();
      tick(100);

      expect(modalController.create).toHaveBeenCalledOnceWith(modalControllerParams6);
      expect(modalSpy.present).toHaveBeenCalledTimes(1);
      expect(modalSpy.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(trackingService.viewComment).toHaveBeenCalledTimes(1);
      expect(trackingService.addComment).not.toHaveBeenCalled();
    }));

    it('should open comments modal and track addComment event if updated if true', fakeAsync(() => {
      modalSpy.onDidDismiss.and.resolveTo({ data: { updated: true } });
      modalController.create.and.resolveTo(modalSpy);
      component.openCommentsModal();
      tick(100);

      expect(modalController.create).toHaveBeenCalledOnceWith(modalControllerParams6);
      expect(modalSpy.present).toHaveBeenCalledTimes(1);
      expect(modalSpy.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(trackingService.addComment).toHaveBeenCalledTimes(1);
      expect(trackingService.viewComment).not.toHaveBeenCalled();
    }));
  });

  it('viewAttachments(): should open attachments modal', fakeAsync(() => {
    const modalSpy = jasmine.createSpyObj('modal', ['present']);
    modalController.create.and.resolveTo(modalSpy);
    modalController.getTop.and.resolveTo(undefined);
    modalProperties.getModalDefaultProperties.and.returnValue(properties);

    component.viewAttachments(fileObject4[0]);
    tick(100);
    expect(modalController.create).toHaveBeenCalledOnceWith(modalControllerParams7);
    expect(modalSpy.present).toHaveBeenCalledTimes(1);
  }));

  it('goToTeamAdvances(): should navigate to team_advance page', () => {
    component.goToTeamAdvances();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'team_advance']);
  });
});
