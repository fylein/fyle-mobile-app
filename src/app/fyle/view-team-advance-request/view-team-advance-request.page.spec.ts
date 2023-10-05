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
import { extendedAdvReqDraft } from 'src/app/core/mock-data/extended-advance-request.data';
import { apiAdvanceRequestAction } from 'src/app/core/mock-data/advance-request-actions.data';
import { advanceReqApprovals } from 'src/app/core/mock-data/approval.data';
import { fileObject4 } from 'src/app/core/mock-data/file-object.data';
import { advanceRequestCustomFieldData2 } from 'src/app/core/mock-data/advance-requests-custom-fields.data';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { customFields } from 'src/app/core/mock-data/custom-field.data';

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
      spyOn(component, 'setupActionScheet');
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
  });
});
