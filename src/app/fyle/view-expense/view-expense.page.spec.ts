import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { StatusService } from 'src/app/core/services/status.service';
import { ReportService } from 'src/app/core/services/report.service';
import { FileService } from 'src/app/core/services/file.service';
import { NetworkService } from '../../core/services/network.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { TrackingService } from '../../core/services/tracking.service';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { ViewExpensePage } from './view-expense.page';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, PopoverController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { etxncListData, expenseData1, expenseData2 } from 'src/app/core/mock-data/expense.data';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { getApiResponse, getEstatusApiResponse } from 'src/app/core/test-data/status.service.spec.data';
import {
  ApproverExpensePolicyStatesData,
  expensePolicyStatesData,
} from 'src/app/core/mock-data/platform-policy-expense.data';
import {
  fileObjectAdv,
  fileObjectAdv1,
  fileObjectData,
  fileObjectData4,
} from 'src/app/core/mock-data/file-object.data';
import {
  individualExpPolicyStateData1,
  individualExpPolicyStateData3,
} from 'src/app/core/mock-data/individual-expense-policy-state.data';
import { IndividualExpensePolicyState } from 'src/app/core/models/platform/platform-individual-expense-policy-state.model';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { FyPopoverComponent } from 'src/app/shared/components/fy-popover/fy-popover.component';
import { FyViewAttachmentComponent } from 'src/app/shared/components/fy-view-attachment/fy-view-attachment.component';

describe('ViewExpensePage', () => {
  let component: ViewExpensePage;
  let fixture: ComponentFixture<ViewExpensePage>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let reportService: jasmine.SpyObj<ReportService>;
  let customInputsService: jasmine.SpyObj<CustomInputsService>;
  let statusService: jasmine.SpyObj<StatusService>;
  let fileService: jasmine.SpyObj<FileService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let router: jasmine.SpyObj<Router>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let policyService: jasmine.SpyObj<PolicyService>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let corporateCreditCardExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;
  let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let categoriesService: jasmine.SpyObj<CategoriesService>;
  let dependentFieldsService: jasmine.SpyObj<DependentFieldsService>;
  let activateRouteMock: ActivatedRoute;

  beforeEach(waitForAsync(() => {
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['hideLoader', 'showLoader']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['getEtxn', 'manualUnflag', 'manualFlag']);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', ['getTeamReport', 'removeTransaction']);
    const customInputsServiceSpy = jasmine.createSpyObj('CustomInputsService', [
      'getCustomPropertyDisplayValue',
      'fillCustomProperties',
    ]);
    const statusServiceSpy = jasmine.createSpyObj('StatusService', ['find', 'post']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['findByTransactionId', 'downloadUrl']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', [
      'isConnected',
      'connectivityWatcher',
      'isOnline',
    ]);
    const policyServiceSpy = jasmine.createSpyObj('PolicyService', [
      'getApproverExpensePolicyViolations',
      'getSpenderExpensePolicyViolations',
    ]);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'expenseRemovedByApprover',
      'addComment',
      'viewComment',
      'expenseFlagUnflagClicked',
    ]);
    const corporateCreditCardExpenseServiceSpy = jasmine.createSpyObj('CorporateCreditCardExpenseService', [
      'getEccceByGroupId',
    ]);
    const expenseFieldsServiceSpy = jasmine.createSpyObj('ExpenseFieldsService', ['getAllMap']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const categoriesServiceSpy = jasmine.createSpyObj('CategoriesService', [
      'getSystemCategories',
      'getSystemCategoriesWithTaxi',
      'getBreakfastSystemCategories',
      'getTravelSystemCategories',
      'getFlightSystemCategories',
    ]);
    const dependentFieldsServiceSpy = jasmine.createSpyObj('DependentFieldsService', [
      'getDependentFieldValuesForBaseField',
    ]);

    TestBed.configureTestingModule({
      declarations: [ViewExpensePage],
      imports: [IonicModule.forRoot(), FormsModule, MatIconModule, MatIconTestingModule],
      providers: [
        {
          useValue: loaderServiceSpy,
          provide: LoaderService,
        },
        {
          useValue: transactionServiceSpy,
          provide: TransactionService,
        },
        {
          useValue: reportServiceSpy,
          provide: ReportService,
        },
        {
          useValue: customInputsServiceSpy,
          provide: CustomInputsService,
        },
        {
          useValue: statusServiceSpy,
          provide: StatusService,
        },
        {
          useValue: fileServiceSpy,
          provide: FileService,
        },
        {
          useValue: modalControllerSpy,
          provide: ModalController,
        },
        {
          useValue: routerSpy,
          provide: Router,
        },
        {
          useValue: popoverControllerSpy,
          provide: PopoverController,
        },
        {
          useValue: networkServiceSpy,
          provide: NetworkService,
        },
        {
          useValue: policyServiceSpy,
          provide: PolicyService,
        },
        {
          useValue: modalPropertiesSpy,
          provide: ModalPropertiesService,
        },
        {
          useValue: trackingServiceSpy,
          provide: TrackingService,
        },
        {
          useValue: corporateCreditCardExpenseServiceSpy,
          provide: CorporateCreditCardExpenseService,
        },
        {
          useValue: expenseFieldsServiceSpy,
          provide: ExpenseFieldsService,
        },
        {
          useValue: orgSettingsServiceSpy,
          provide: OrgSettingsService,
        },
        {
          useValue: categoriesServiceSpy,
          provide: CategoriesService,
        },
        {
          useValue: dependentFieldsServiceSpy,
          provide: DependentFieldsService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                id: 'tx5fBcPBAxLv',
                view: ExpenseView.individual,
                txnIds: ['tx5fBcPBAxLv', 'txCBp2jIK6G3'],
                activeIndex: 0,
              },
            },
          },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewExpensePage);
    component = fixture.componentInstance;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    customInputsService = TestBed.inject(CustomInputsService) as jasmine.SpyObj<CustomInputsService>;
    statusService = TestBed.inject(StatusService) as jasmine.SpyObj<StatusService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    policyService = TestBed.inject(PolicyService) as jasmine.SpyObj<PolicyService>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    corporateCreditCardExpenseService = TestBed.inject(
      CorporateCreditCardExpenseService
    ) as jasmine.SpyObj<CorporateCreditCardExpenseService>;
    expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
    dependentFieldsService = TestBed.inject(DependentFieldsService) as jasmine.SpyObj<DependentFieldsService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    activateRouteMock = TestBed.inject(ActivatedRoute);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ionViewWillLeave(): should execute the on page exit next function', () => {
    spyOn(component.onPageExit, 'next');

    component.ionViewWillLeave();
    expect(component.onPageExit.next).toHaveBeenCalledOnceWith(null);
  });

  it('setupNetworkWatcher(): should setup network watcher', () => {
    networkService.connectivityWatcher.and.returnValue(new EventEmitter(true));
    networkService.isOnline.and.returnValue(of(false));

    component.setupNetworkWatcher();
    expect(networkService.isOnline).toHaveBeenCalledTimes(1);
    expect(networkService.connectivityWatcher).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard']);
  });

  describe('isNumber', () => {
    it('should return true for a number', () => {
      const result = component.isNumber(42);
      expect(result).toBe(true);
    });

    it('should return false for a non-number value', () => {
      const result = component.isNumber('42');
      expect(result).toBe(false);
    });
  });

  describe('openCommentsModal', () => {
    it('on opening the comments modal it should add a comment if the data is updated', fakeAsync(() => {
      component.view = ExpenseView.individual;
      transactionService.getEtxn.and.returnValue(of(expenseData1));
      const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
      modalController.create.and.resolveTo(modalSpy);
      modalSpy.onDidDismiss.and.resolveTo({ data: { updated: true } } as any);
      component.openCommentsModal();
      tick(500);
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: ViewCommentComponent,
        componentProps: {
          objectType: 'transactions',
          objectId: expenseData1.tx_id,
        },
        ...modalProperties.getModalDefaultProperties(),
      });
      expect(transactionService.getEtxn).toHaveBeenCalledOnceWith(activateRouteMock.snapshot.params.id);
      expect(modalSpy.present).toHaveBeenCalledTimes(1);
      expect(modalSpy.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(trackingService.addComment).toHaveBeenCalledOnceWith({ view: 'Individual' });
    }));

    it('on opening the comments modal it should show the comments if the data not updated', fakeAsync(() => {
      component.view = ExpenseView.individual;
      transactionService.getEtxn.and.returnValue(of(expenseData1));
      const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
      modalController.create.and.resolveTo(modalSpy);
      modalSpy.onDidDismiss.and.resolveTo({ data: { updated: false } } as any);
      component.openCommentsModal();
      tick(500);
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: ViewCommentComponent,
        componentProps: {
          objectType: 'transactions',
          objectId: expenseData1.tx_id,
        },
        ...modalProperties.getModalDefaultProperties(),
      });
      expect(transactionService.getEtxn).toHaveBeenCalledOnceWith(activateRouteMock.snapshot.params.id);
      expect(modalSpy.present).toHaveBeenCalledTimes(1);
      expect(modalSpy.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(trackingService.viewComment).toHaveBeenCalledOnceWith({ view: 'Individual' });
    }));
  });

  describe('isPolicyComment', () => {
    it('should return true if the comment is a policy comment', () => {
      const estatus = { st_org_user_id: 'POLICY' };
      const result = component.isPolicyComment(estatus);
      expect(result).toBeTrue();
    });

    it('should return false if the comment is not a policy comment', () => {
      const estatus = { st_org_user_id: 'SYSTEM' };
      const result = component.isPolicyComment(estatus);
      expect(result).toBeFalse();
    });
  });

  describe('getPolicyDetails():', () => {
    it('should get policy details for team expenses', () => {
      component.view = ExpenseView.team;
      policyService.getApproverExpensePolicyViolations.and.returnValue(
        of(ApproverExpensePolicyStatesData.data[0].individual_desired_states)
      );
      component.getPolicyDetails('txRNWeQRXhso');
      expect(policyService.getApproverExpensePolicyViolations).toHaveBeenCalledOnceWith('txRNWeQRXhso');
      expect(component.policyDetails).toEqual(ApproverExpensePolicyStatesData.data[0].individual_desired_states);
    });

    it('should get policy details for individual expenses', () => {
      component.view = ExpenseView.individual;
      policyService.getSpenderExpensePolicyViolations.and.returnValue(
        of(expensePolicyStatesData.data[0].individual_desired_states)
      );
      component.getPolicyDetails('txVTmNOp5JEa');
      expect(policyService.getSpenderExpensePolicyViolations).toHaveBeenCalledOnceWith('txVTmNOp5JEa');
      expect(individualExpPolicyStateData3).toEqual(component.policyDetails);
    });
  });

  describe('getDisplayValue():', () => {
    it('should get the correct display value', () => {
      const testProperty = {
        name: 'Multi Type',
        value: ['record1', 'record2'],
        type: 'MULTI_SELECT',
        mandatory: true,
        options: ['record1', 'record2', 'record3'],
      };

      const expectedProperty = 'record1, record2';
      customInputsService.getCustomPropertyDisplayValue.and.returnValue(expectedProperty);
      const result = component.getDisplayValue(testProperty);
      expect(result).toEqual(expectedProperty);
    });

    it('should display Not Added if no value is added', () => {
      const testProperty = {
        name: 'userlist',
        value: [],
        type: 'USER_LIST',
        mandatory: false,
        options: ['scooby@fyle.com', 'mickey@wd.com', 'johnny@cn.com'],
      };

      const expectedProperty = '-';
      customInputsService.getCustomPropertyDisplayValue.and.returnValue(expectedProperty);
      const result = component.getDisplayValue(testProperty);
      expect(result).toEqual('Not Added');
    });
  });

  describe('goBack', () => {
    it('should go to view team report if the expense is a team expense', () => {
      component.reportId = 'rpWDg3QX3';
      component.view = ExpenseView.team;
      component.goBack();
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'view_team_report',
        { id: component.reportId, navigate_back: true },
      ]);
    });

    it('should go to view report if the expense is an individual expense', () => {
      component.reportId = 'rpJFg3Da4';
      component.view = ExpenseView.individual;
      component.goBack();
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'my_view_report',
        { id: component.reportId, navigate_back: true },
      ]);
    });
  });

  describe('getReceiptExtension():', () => {
    it('should return the receipt extention if present', () => {
      const res = component.getReceiptExtension('dummyFile.pdf');
      expect(res).toEqual('pdf');
    });

    it('should return null when a file name without extension is provided', () => {
      const res = component.getReceiptExtension('dummyFile');
      expect(res).toEqual(null);
    });
  });

  describe('getReceiptDetails', () => {
    it('should get the receipt details when the file extention is of type pdf', () => {
      spyOn(component, 'getReceiptExtension').and.returnValue('pdf');
      const res = component.getReceiptDetails(fileObjectAdv1);
      expect(component.getReceiptExtension).toHaveBeenCalledOnceWith(fileObjectAdv1.name);
      expect(res.type).toEqual('pdf');
      expect(res.thumbnail).toEqual('img/fy-pdf.svg');
    });

    it('should get the receipt details when the it is an image with jpeg as extention', () => {
      spyOn(component, 'getReceiptExtension').and.returnValue('jpeg');
      const res = component.getReceiptDetails(fileObjectAdv[0]);
      expect(component.getReceiptExtension).toHaveBeenCalledOnceWith(fileObjectAdv[0].name);
      expect(res.type).toEqual('image');
      expect(res.thumbnail).toEqual(fileObjectAdv[0].url);
    });

    it('should get the receipt details when the it is an image with jpg as extention', () => {
      const mockFileData = {
        ...fileObjectAdv[0],
        name: 'dummyFile.jpg',
        url: 'https://fyle-storage-mumbai-3.s3.amazonaws.com/2023-02-23/orrjqbDbeP9p/receipts/fiSSsy2Bf4Se.000.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230223T151537Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=AKIA54Z3LIXTX6CFH4VG%2F20230223%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=d79c2711892e7cb3f072e223b7b416408c252da38e7df0995e3d256cd8509fee',
      };
      spyOn(component, 'getReceiptExtension').and.returnValue('jpg');
      const res = component.getReceiptDetails(mockFileData);
      expect(component.getReceiptExtension).toHaveBeenCalledOnceWith(mockFileData.name);
      expect(res.type).toEqual('image');
      expect(res.thumbnail).toEqual(mockFileData.url);
    });

    it('should get the receipt details when the it is an image with png as extention', () => {
      const mockFileData = {
        ...fileObjectAdv[0],
        name: 'dummyFile.png',
        url: 'https://fyle-storage-mumbai-3.s3.amazonaws.com/2023-02-23/orrjqbDbeP9p/receipts/fiSSsy2Bf4Se.000.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230223T151537Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=AKIA54Z3LIXTX6CFH4VG%2F20230223%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=d79c2711892e7cb3f072e223b7b416408c252da38e7df0995e3d256cd8509fee',
      };
      spyOn(component, 'getReceiptExtension').and.returnValue('png');
      const res = component.getReceiptDetails(mockFileData);
      expect(component.getReceiptExtension).toHaveBeenCalledOnceWith(mockFileData.name);
      expect(res.type).toEqual('image');
      expect(res.thumbnail).toEqual(mockFileData.url);
    });

    it('should get the receipt details when the it is an image with gif as extention', () => {
      const mockFileData = {
        ...fileObjectAdv[0],
        name: 'dummyFile.gif',
        url: 'https://fyle-storage-mumbai-3.s3.amazonaws.com/2023-02-23/orrjqbDbeP9p/receipts/fiSSsy2Bf4Se.000.gif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230223T151537Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=AKIA54Z3LIXTX6CFH4VG%2F20230223%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=d79c2711892e7cb3f072e223b7b416408c252da38e7df0995e3d256cd8509fee',
      };
      spyOn(component, 'getReceiptExtension').and.returnValue('gif');
      const res = component.getReceiptDetails(mockFileData);
      expect(component.getReceiptExtension).toHaveBeenCalledOnceWith(mockFileData.name);
      expect(res.type).toEqual('image');
      expect(res.thumbnail).toEqual(mockFileData.url);
    });
  });

  it('getDeleteDialogProps(): should return the props', () => {
    const props = component.getDeleteDialogProps(expenseData1);
    props.componentProps.deleteMethod();
    expect(reportService.removeTransaction).toHaveBeenCalledOnceWith(expenseData1.tx_report_id, expenseData1.tx_id);
  });

  describe('removeExpenseFromReport', () => {
    it('should remove the expense from report', fakeAsync(() => {
      activateRouteMock.snapshot.params = {
        id: 'tx5fBcPBAxLv',
      };
      transactionService.getEtxn.and.returnValue(of(expenseData1));

      spyOn(component, 'getDeleteDialogProps');
      const deletePopoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onDidDismiss']);
      popoverController.create.and.returnValue(deletePopoverSpy);
      deletePopoverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });

      component.removeExpenseFromReport();
      tick(500);
      expect(transactionService.getEtxn).toHaveBeenCalledOnceWith(activateRouteMock.snapshot.params.id);
      expect(popoverController.create).toHaveBeenCalledOnceWith(component.getDeleteDialogProps(expenseData1));
      expect(deletePopoverSpy.present).toHaveBeenCalledTimes(1);
      expect(deletePopoverSpy.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(trackingService.expenseRemovedByApprover).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'view_team_report',
        { id: expenseData1.tx_report_id, navigate_back: true },
      ]);
    }));
  });

  describe('flagUnflagExpense', () => {
    it('should flag,unflagged expense', fakeAsync(() => {
      activateRouteMock.snapshot.queryParams = {
        id: 'tx5fBcPBAxLv',
      };

      const testComment = {
        id: 'stjIdPp8BX8O',
        created_at: '2022-11-17T06:07:38.590Z',
        org_user_id: 'ouX8dwsbLCLv',
        comment: 'This is a comment for flagging',
        diff: null,
        state: null,
        transaction_id: null,
        report_id: 'rpkpSa8guCuR',
        advance_request_id: null,
      };

      transactionService.getEtxn.and.returnValue(of(expenseData1));
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();

      const title = 'Flag';
      const flagPopoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
      popoverController.create.and.returnValue(flagPopoverSpy);
      const data = { comment: 'This is a comment for flagging' };
      flagPopoverSpy.onWillDismiss.and.resolveTo({ data });
      statusService.post.and.returnValue(of(testComment));
      transactionService.manualFlag.and.returnValue(of(expenseData2));

      component.flagUnflagExpense(expenseData1.tx_manual_flag);
      tick(500);
      expect(transactionService.getEtxn).toHaveBeenCalledOnceWith(activateRouteMock.snapshot.params.id);
      tick(500);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: FyPopoverComponent,
        componentProps: {
          title,
          formLabel: 'Reason for flaging expense',
        },
        cssClass: 'fy-dialog-popover',
      });

      expect(flagPopoverSpy.present).toHaveBeenCalledTimes(1);
      expect(flagPopoverSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Please wait');
      expect(statusService.post).toHaveBeenCalledOnceWith('transactions', expenseData1.tx_id, data, true);
      expect(transactionService.manualFlag).toHaveBeenCalledOnceWith(expenseData1.tx_id);
      tick(500);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(trackingService.expenseFlagUnflagClicked).toHaveBeenCalledOnceWith({ action: title });
    }));

    it('should unflag,flagged expense', fakeAsync(() => {
      activateRouteMock.snapshot.params = {
        id: 'tx5fBcPBAxLv',
      };

      const mockExpenseData = {
        ...expenseData1,
        tx_manual_flag: true,
      };
      const testComment = {
        id: 'stjIdPp8BX8O',
        created_at: '2022-11-17T06:07:38.590Z',
        org_user_id: 'ouX8dwsbLCLv',
        comment: 'a comment',
        diff: null,
        state: null,
        transaction_id: null,
        report_id: 'rpkpSa8guCuR',
        advance_request_id: null,
      };
      transactionService.getEtxn.and.returnValue(of(mockExpenseData));
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();

      const title = 'Unflag';
      const flagPopoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
      popoverController.create.and.returnValue(flagPopoverSpy);
      const data = { comment: 'This is a comment for flagging' };
      flagPopoverSpy.onWillDismiss.and.resolveTo({ data });
      statusService.post.and.returnValue(of(testComment));
      transactionService.manualUnflag.and.returnValue(of(expenseData1));

      component.flagUnflagExpense(mockExpenseData.tx_manual_flag);
      tick(500);
      expect(transactionService.getEtxn).toHaveBeenCalledOnceWith(activateRouteMock.snapshot.params.id);
      tick(500);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: FyPopoverComponent,
        componentProps: {
          title,
          formLabel: 'Reason for unflaging expense',
        },
        cssClass: 'fy-dialog-popover',
      });

      expect(flagPopoverSpy.present).toHaveBeenCalledTimes(1);
      expect(flagPopoverSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Please wait');
      expect(statusService.post).toHaveBeenCalledOnceWith('transactions', mockExpenseData.tx_id, data, true);
      expect(transactionService.manualUnflag).toHaveBeenCalledOnceWith(mockExpenseData.tx_id);
      tick(500);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(trackingService.expenseFlagUnflagClicked).toHaveBeenCalledOnceWith({ action: title });
    }));
  });

  describe('viewAttachments', () => {
    it('should open modal with attachments', fakeAsync(() => {
      const attachments = [
        {
          id: '1',
          type: 'pdf',
          url: 'http://example.com/attachment1.pdf',
        },
        {
          id: '2',
          type: 'image',
          url: 'http://example.com/attachment2.jpg',
        },
        {
          id: '3',
          type: 'pdf',
          url: 'http://example.com/attachment3.pdf',
        },
      ];

      component.attachments$ = of(attachments);
      loaderService.showLoader.and.resolveTo();
      const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present']);
      modalController.create.and.returnValue(modalSpy);
      component.viewAttachments();
      tick(500);
      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: FyViewAttachmentComponent,
        componentProps: {
          attachments,
          canEdit: false,
        },
      });

      expect(modalSpy.present).toHaveBeenCalledTimes(1);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    }));
  });
});
