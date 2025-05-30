import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { ExpenseCommentService as SpenderExpenseCommentService } from 'src/app/core/services/platform/v1/spender/expense-comment.service';
import { ExpenseCommentService as ApproverExpenseCommentService } from 'src/app/core/services/platform/v1/approver/expense-comment.service';
import { ReportService } from 'src/app/core/services/report.service';
import { FileService } from 'src/app/core/services/file.service';
import { NetworkService } from '../../core/services/network.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { TrackingService } from '../../core/services/tracking.service';
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
import { expenseData1, expenseData2 } from 'src/app/core/mock-data/expense.data';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { getEstatusApiResponse } from 'src/app/core/test-data/status.service.spec.data';
import {
  ApproverExpensePolicyStatesData,
  expensePolicyStatesData,
} from 'src/app/core/mock-data/platform-policy-expense.data';
import { fileObjectData } from 'src/app/core/mock-data/file-object.data';
import { individualExpPolicyStateData3 } from 'src/app/core/mock-data/individual-expense-policy-state.data';
import { FyPopoverComponent } from 'src/app/shared/components/fy-popover/fy-popover.component';
import { FyViewAttachmentComponent } from 'src/app/shared/components/fy-view-attachment/fy-view-attachment.component';
import { expenseFieldsMapResponse, expenseFieldsMapResponse4 } from 'src/app/core/mock-data/expense-fields-map.data';
import { filledCustomProperties } from 'src/app/core/test-data/custom-inputs.spec.data';
import { dependentFieldValues } from 'src/app/core/test-data/dependent-fields.service.spec.data';
import { orgSettingsGetData } from 'src/app/core/test-data/org-settings.service.spec.data';
import { txnStatusData } from 'src/app/core/mock-data/transaction-status.data';
import { ExpensesService as ApproverExpensesService } from 'src/app/core/services/platform/v1/approver/expenses.service';
import { ExpensesService as SpenderExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { expenseData } from 'src/app/core/mock-data/platform/v1/expense.data';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { AccountType } from 'src/app/core/models/platform/v1/account.model';
import { ExpenseState } from 'src/app/core/models/expense-state.enum';
import { TransactionStatusInfoPopoverComponent } from 'src/app/shared/components/transaction-status-info-popover/transaction-status-info-popover.component';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { CustomInput } from 'src/app/core/models/custom-input.model';
import { SpenderFileService } from 'src/app/core/services/platform/v1/spender/file.service';
import { ApproverFileService } from 'src/app/core/services/platform/v1/approver/file.service';
import { urlsBulkData } from 'src/app/core/mock-data/platform-file.data';
import { ApproverReportsService } from 'src/app/core/services/platform/v1/approver/reports.service';
import {
  expectedReportsSinglePage,
  expectedReportsSinglePageSubmitted,
  paidReportData,
} from 'src/app/core/mock-data/platform-report.data';
import { ExpenseTransactionStatus } from 'src/app/core/enums/platform/v1/expense-transaction-status.enum';
import { CCExpenseMerchantInfoModalComponent } from 'src/app/shared/components/cc-expense-merchant-info-modal/cc-expense-merchant-info-modal.component';

describe('ViewExpensePage', () => {
  let component: ViewExpensePage;
  let fixture: ComponentFixture<ViewExpensePage>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let customInputsService: jasmine.SpyObj<CustomInputsService>;
  let spenderExpenseCommentService: jasmine.SpyObj<SpenderExpenseCommentService>;
  let approverExpenseCommentService: jasmine.SpyObj<ApproverExpenseCommentService>;
  let fileService: jasmine.SpyObj<FileService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let router: jasmine.SpyObj<Router>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let policyService: jasmine.SpyObj<PolicyService>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let categoriesService: jasmine.SpyObj<CategoriesService>;
  let dependentFieldsService: jasmine.SpyObj<DependentFieldsService>;
  let approverExpensesService: jasmine.SpyObj<ApproverExpensesService>;
  let spenderExpensesService: jasmine.SpyObj<SpenderExpensesService>;
  let spenderFileService: jasmine.SpyObj<SpenderFileService>;
  let approverFileService: jasmine.SpyObj<ApproverFileService>;
  let activateRouteMock: ActivatedRoute;
  let approverReportsService: jasmine.SpyObj<ApproverReportsService>;

  beforeEach(waitForAsync(() => {
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['hideLoader', 'showLoader']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['manualUnflag', 'manualFlag']);
    const customInputsServiceSpy = jasmine.createSpyObj('CustomInputsService', [
      'getCustomPropertyDisplayValue',
      'fillCustomProperties',
    ]);
    const spenderExpenseCommentServiceSpy = jasmine.createSpyObj('SpenderExpenseCommentService', [
      'getTransformedComments',
    ]);
    const approverExpenseCommentServiceSpy = jasmine.createSpyObj('ApproverExpenseCommentService', [
      'getTransformedComments',
    ]);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['getReceiptsDetails', 'downloadUrl']);
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
    const approverExpensesServiceSpy = jasmine.createSpyObj('ApproverExpensesService', ['getExpenseById']);
    const spenderExpensesServiceSpy = jasmine.createSpyObj('SpenderExpensesService', ['getExpenseById']);
    const approverReportsServiceSpy = jasmine.createSpyObj('ApproverReportsService', [
      'ejectExpenses',
      'getReportById',
    ]);

    const spenderFileServiceSpy = jasmine.createSpyObj('SpenderFileService', ['generateUrlsBulk']);
    const approverFileServiceSpy = jasmine.createSpyObj('ApproverFileService', ['generateUrlsBulk']);

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
          useValue: customInputsServiceSpy,
          provide: CustomInputsService,
        },
        {
          useValue: spenderExpenseCommentServiceSpy,
          provide: SpenderExpenseCommentService,
        },
        {
          useValue: approverExpenseCommentServiceSpy,
          provide: ApproverExpenseCommentService,
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
          useValue: approverExpensesServiceSpy,
          provide: ApproverExpensesService,
        },
        {
          useValue: spenderExpensesServiceSpy,
          provide: SpenderExpensesService,
        },
        {
          useValue: spenderFileServiceSpy,
          provide: SpenderFileService,
        },
        {
          useValue: approverFileServiceSpy,
          provide: ApproverFileService,
        },
        {
          provide: ApproverReportsService,
          useValue: approverReportsServiceSpy,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                id: 'tx5fBcPBAxLv',
                view: ExpenseView.individual,
                txnIds: ['tx5fBcPBAxLv', 'txCBp2jIK6G3'],
                activeIndex: '0',
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
    customInputsService = TestBed.inject(CustomInputsService) as jasmine.SpyObj<CustomInputsService>;
    spenderExpenseCommentService = TestBed.inject(
      SpenderExpenseCommentService
    ) as jasmine.SpyObj<SpenderExpenseCommentService>;
    approverExpenseCommentService = TestBed.inject(
      ApproverExpenseCommentService
    ) as jasmine.SpyObj<ApproverExpenseCommentService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    policyService = TestBed.inject(PolicyService) as jasmine.SpyObj<PolicyService>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
    dependentFieldsService = TestBed.inject(DependentFieldsService) as jasmine.SpyObj<DependentFieldsService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    approverExpensesService = TestBed.inject(ApproverExpensesService) as jasmine.SpyObj<ApproverExpensesService>;
    spenderExpensesService = TestBed.inject(SpenderExpensesService) as jasmine.SpyObj<SpenderExpensesService>;
    spenderFileService = TestBed.inject(SpenderFileService) as jasmine.SpyObj<SpenderFileService>;
    approverFileService = TestBed.inject(ApproverFileService) as jasmine.SpyObj<ApproverFileService>;
    approverReportsService = TestBed.inject(ApproverReportsService) as jasmine.SpyObj<ApproverReportsService>;
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
      expect(result).toBeTrue();
    });

    it('should return false for a non-number value', () => {
      const result = component.isNumber('42');
      expect(result).toBeFalse();
    });
  });

  describe('openCommentsModal', () => {
    it('on opening the comments modal it should add a comment if the data is updated', fakeAsync(() => {
      component.view = ExpenseView.individual;
      const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
      modalController.create.and.resolveTo(modalSpy);
      modalSpy.onDidDismiss.and.resolveTo({ data: { updated: true } } as any);
      component.openCommentsModal();
      tick(500);
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: ViewCommentComponent,
        componentProps: {
          objectType: 'transactions',
          objectId: component.expenseId,
          view: ExpenseView.individual,
        },
        ...modalProperties.getModalDefaultProperties(),
      });
      expect(modalSpy.present).toHaveBeenCalledTimes(1);
      expect(modalSpy.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(trackingService.addComment).toHaveBeenCalledOnceWith({ view: 'Individual' });
    }));

    it('on opening the comments modal it should show the comments if the data not updated', fakeAsync(() => {
      component.view = ExpenseView.individual;
      const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
      modalController.create.and.resolveTo(modalSpy);
      modalSpy.onDidDismiss.and.resolveTo({ data: { updated: false } } as any);
      component.openCommentsModal();
      tick(500);
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: ViewCommentComponent,
        componentProps: {
          objectType: 'transactions',
          objectId: component.expenseId,
          view: ExpenseView.individual,
        },
        ...modalProperties.getModalDefaultProperties(),
      });
      expect(modalSpy.present).toHaveBeenCalledTimes(1);
      expect(modalSpy.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(trackingService.viewComment).toHaveBeenCalledOnceWith({ view: 'Individual' });
    }));
  });

  describe('isPolicyComment', () => {
    it('should return true if the comment is a policy comment', () => {
      const result = component.isPolicyComment(getEstatusApiResponse[0]);
      expect(result).toBeTrue();
    });

    it('should return false if the comment is not a policy comment', () => {
      const result = component.isPolicyComment(getEstatusApiResponse[4]);
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

  describe('setPaymentModeandIcon', () => {
    it('should set the payment mode and icon accordingly when the source account type is ADVANCE', () => {
      const mockExpense: Expense = {
        ...expenseData,
        source_account: {
          ...expenseData.source_account,
          type: AccountType.PERSONAL_ADVANCE_ACCOUNT,
        },
      };

      component.expense$ = of(mockExpense);
      component.setPaymentModeandIcon(mockExpense);
      component.expense$.subscribe((expense) => {
        expect(expense.source_account.type).toEqual(AccountType.PERSONAL_ADVANCE_ACCOUNT);
        expect(component.paymentMode).toEqual('Advance');
        expect(component.paymentModeIcon).toEqual('cash-slash');
      });
    });

    it('should set the payment mode and icon accordingly when the source account type is CCC', () => {
      const mockExpense: Expense = {
        ...expenseData,
        source_account: {
          ...expenseData.source_account,
          type: AccountType.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT,
        },
      };

      component.expense$ = of(mockExpense);
      component.setPaymentModeandIcon(mockExpense);
      component.expense$.subscribe((expense) => {
        expect(expense.source_account.type).toEqual(AccountType.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT);
        expect(component.paymentMode).toEqual('Corporate Card');
        expect(component.paymentModeIcon).toEqual('card');
        expect(component.isCCCTransaction).toBeTrue();
      });
    });

    it('should set the payment mode and icon accordingly when the expense is non-reimbursable', () => {
      const mockExpense: Expense = {
        ...expenseData,
        is_reimbursable: false,
        source_account: {
          ...expenseData.source_account,
          type: AccountType.PERSONAL_CASH_ACCOUNT,
        },
      };

      component.expense$ = of(mockExpense);
      component.setPaymentModeandIcon(mockExpense);
      component.expense$.subscribe((expense) => {
        expect(expense.is_reimbursable).toBeFalse();
        expect(component.paymentMode).toEqual('Paid by Company');
        expect(component.paymentModeIcon).toEqual('cash-slash');
      });
    });

    it('the amount is reimbursable if non of the conditions match', () => {
      const mockExpense: Expense = {
        ...expenseData,
        source_account: {
          ...expenseData.source_account,
          type: AccountType.PERSONAL_CASH_ACCOUNT,
        },
        is_reimbursable: true,
      };

      component.expense$ = of(mockExpense);
      component.setPaymentModeandIcon(mockExpense);
      component.expense$.subscribe((expense) => {
        expect(expense.source_account.type).toEqual(AccountType.PERSONAL_CASH_ACCOUNT);
        expect(component.paymentMode).toEqual('Paid by Employee');
        expect(component.paymentModeIcon).toEqual('cash');
      });
    });
  });

  describe('ionViewWillEnter', () => {
    beforeEach(() => {
      component.expenseId = 'tx5fBcPBAxLv';
      component.reportId = 'rp96APY6Efph';
      component.view = ExpenseView.individual;

      spyOn(component, 'setupNetworkWatcher');
      spyOn(component, 'getPolicyDetails');
      spyOn(component, 'setPaymentModeandIcon');

      activateRouteMock.snapshot.params = {
        id: '["tx3qwe4ty","tx6sd7gh","txD3cvb6"]',
        view: ExpenseView.individual,
        activeIndex: '0',
      };

      categoriesService.getSystemCategories.and.returnValue(['Bus', 'Airlines', 'Lodging', 'Train']);
      categoriesService.getSystemCategoriesWithTaxi.and.returnValue(['Taxi', 'Bus', 'Airlines', 'Lodging', 'Train']);
      categoriesService.getBreakfastSystemCategories.and.returnValue(['Lodging']);
      categoriesService.getTravelSystemCategories.and.returnValue(['Bus', 'Airlines', 'Train']);
      categoriesService.getFlightSystemCategories.and.returnValue(['Airlines']);

      const mockWithoutCustPropData: Expense = {
        ...expenseData,
        custom_fields: null,
      };

      component.expenseWithoutCustomProperties$ = of(mockWithoutCustPropData);
      spenderExpensesService.getExpenseById.and.returnValue(of(expenseData));
      approverExpensesService.getExpenseById.and.returnValue(of(expenseData));

      customInputsService.fillCustomProperties.and.returnValue(of(filledCustomProperties));
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();

      expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse4));

      component.expense$ = of(expenseData);
      component.expenseFields$ = of(expenseFieldsMapResponse4);

      dependentFieldsService.getDependentFieldValuesForBaseField.and.returnValue(of(dependentFieldValues));

      spenderExpenseCommentService.getTransformedComments.and.returnValue(of(getEstatusApiResponse));

      orgSettingsService.get.and.returnValue(of(orgSettingsGetData));

      const mockDownloadUrl = {
        url: 'mock-url',
      };

      fileService.downloadUrl.and.returnValue(of(mockDownloadUrl.url));
      fileService.getReceiptsDetails.and.returnValue({
        type: 'image',
        thumbnail: 'mock-thumbnail',
      });
      approverReportsService.getReportById.and.returnValue(of(expectedReportsSinglePage[0]));
    });

    it('should get all the system categories and get the correct value of report is by subscribing to expenseWithoutCustomProperties$', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(500);
      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
      expect(categoriesService.getSystemCategories).toHaveBeenCalledTimes(1);
      expect(categoriesService.getSystemCategoriesWithTaxi).toHaveBeenCalledTimes(1);
      expect(categoriesService.getBreakfastSystemCategories).toHaveBeenCalledTimes(1);
      expect(categoriesService.getTravelSystemCategories).toHaveBeenCalledTimes(1);
      expect(categoriesService.getFlightSystemCategories).toHaveBeenCalledTimes(1);
      component.expenseWithoutCustomProperties$.subscribe((expense) => {
        expect(expense).toEqual(expenseData);
        expect(component.reportId).toEqual(expense.report_id);
      });
      expect(spenderExpensesService.getExpenseById).toHaveBeenCalledOnceWith(activateRouteMock.snapshot.params.id);
      tick(500);
      component.expenseFields$.subscribe((expenseFields) => {
        expect(expenseFields).toEqual(expenseFieldsMapResponse4);
        expect(expenseFieldsService.getAllMap).toHaveBeenCalledTimes(2);
      });
    }));

    it('should get the custom properties', (done) => {
      component.ionViewWillEnter();
      component.customProperties$.subscribe((customProperties) => {
        expect(customProperties).toEqual(filledCustomProperties);
        expect(customInputsService.fillCustomProperties).toHaveBeenCalledOnceWith(
          expenseData.category_id,
          expenseData.custom_fields as Partial<CustomInput>[]
        );
        done();
      });
    });

    it('should get the project dependent custom properties', (done) => {
      const customProps = expenseData.custom_fields;
      const projectIdNumber = expenseFieldsMapResponse4.project_id[0].id;
      component.ionViewWillEnter();
      component.projectDependentCustomProperties$.subscribe((customProperties) => {
        expect(customProperties).toEqual(dependentFieldValues);
        expect(expenseData.custom_fields).toBeDefined();
        expect(expenseFieldsMapResponse4.project_id.length).toBeGreaterThan(0);
        expect(dependentFieldsService.getDependentFieldValuesForBaseField).toHaveBeenCalledOnceWith(
          customProps as Partial<CustomInput>[],
          projectIdNumber
        );
        done();
      });
    });

    it('should get the cost center dependent custom properties', (done) => {
      const customProps = expenseData.custom_fields;
      const costCenterId = expenseFieldsMapResponse4.cost_center_id[0].id;
      component.ionViewWillEnter();
      component.costCenterDependentCustomProperties$.subscribe((customProperties) => {
        expect(customProperties).toEqual(dependentFieldValues);
        expect(expenseData.custom_fields).toBeDefined();
        expect(expenseFieldsMapResponse4.project_id.length).toBeGreaterThan(0);
        expect(dependentFieldsService.getDependentFieldValuesForBaseField).toHaveBeenCalledOnceWith(
          customProps as Partial<CustomInput>[],
          costCenterId
        );
        done();
      });
    });

    it('should set the correct value for split expense', () => {
      const mockExpense: Expense = {
        ...expenseData,
        is_split: true,
      };

      spenderExpensesService.getExpenseById.and.returnValue(of(mockExpense));
      component.expense$ = of(mockExpense);
      component.ionViewWillEnter();
      expect(component.isSplitExpense).toBeTrue();
    });

    it('should set the correct exchange rate', () => {
      component.exchangeRate = 0;
      const mockExpense: Expense = {
        ...expenseData,
        amount: 500,
        foreign_amount: 1000,
      };

      spenderExpensesService.getExpenseById.and.returnValue(of(mockExpense));
      component.ionViewWillEnter();
      expect(component.exchangeRate).toBe(0.5);
    });

    it('should set the correct card number and set foreign and expense transaction currency symbol', () => {
      const mockExpense: Expense = {
        ...expenseData,
      };

      component.isCCCTransaction = true;
      spenderExpensesService.getExpenseById.and.returnValue(of(mockExpense));
      component.expense$ = of(mockExpense);
      component.ionViewWillEnter();

      expect(component.paymentModeIcon).toEqual('card');
      expect(component.cardNumber).toEqual(expenseData.matched_corporate_card_transactions[0].corporate_card_number);
      expect(component.foreignCurrencySymbol).toEqual(expenseData.foreign_currency);
      expect(component.expenseCurrencySymbol).toEqual('$');
    });

    it('should get the project details', () => {
      const mockExpFieldData = {
        ...expenseFieldsMapResponse,
        project_id: [],
      };

      spenderExpensesService.getExpenseById.and.returnValue(of(expenseData));
      component.expense$ = of(expenseData);
      expenseFieldsService.getAllMap.and.returnValue(of(mockExpFieldData));
      component.expenseFields$ = of(mockExpFieldData);

      component.ionViewWillEnter();
      expect(component.projectFieldName).toBeUndefined();
      expect(component.isProjectShown).toBeTruthy();
    });

    it('should get the project details when project is not present', () => {
      const mockExpData: Expense = {
        ...expenseData,
        project: null,
      };
      spenderExpensesService.getExpenseById.and.returnValue(of(mockExpData));
      expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse4));
      component.expense$ = of(mockExpData);

      component.ionViewWillEnter();
      expect(component.projectFieldName).toEqual('Project ID');
      expect(component.isProjectShown).toBeTrue();
    });

    it('should get all the policy violations', (done) => {
      spyOn(component, 'isPolicyComment').and.returnValue(true);
      component.ionViewWillEnter();
      component.policyViloations$.subscribe(() => {
        expect(spenderExpenseCommentService.getTransformedComments).toHaveBeenCalledWith(expenseData.id);
        expect(spenderExpenseCommentService.getTransformedComments).toHaveBeenCalledTimes(2);
        expect(component.isPolicyComment).toHaveBeenCalledTimes(5);
        done();
      });
    });

    it('should get all the comments and set the appropriate view', fakeAsync(() => {
      activateRouteMock.snapshot.params = {
        id: 'tx5fBcPBAxLv',
        view: ExpenseView.team,
        activeIndex: '0',
      };

      component.ionViewWillEnter();
      tick();

      expect(component.view).toEqual(activateRouteMock.snapshot.params.view);
      component.comments$?.subscribe(() => {
        expect(approverExpenseCommentService.getTransformedComments).toHaveBeenCalledOnceWith(component.expenseId);
      });
    }));

    it('should get the flag status', () => {
      const mockWithoutCustPropData: Expense = {
        ...expenseData,
        custom_fields: null,
      };

      approverExpensesService.getExpenseById.and.returnValue(of(mockWithoutCustPropData));
      component.expenseWithoutCustomProperties$ = of(mockWithoutCustPropData);
      activateRouteMock.snapshot.params.view = ExpenseView.team;
      component.expense$ = of(expenseData);
      component.ionViewWillEnter();
    });

    it('should return false if there is only one transaction in the report and the state is PAID', () => {
      const mockWithoutCustPropData: Expense = {
        ...expenseData,
        state: ExpenseState.PAID,
        report_id: 'rphNNUiCISkD',
        custom_fields: null,
      };

      approverReportsService.getReportById.and.returnValue(of(paidReportData));
      approverExpensesService.getExpenseById.and.returnValue(of(mockWithoutCustPropData));
      component.expenseWithoutCustomProperties$ = of(mockWithoutCustPropData);
      activateRouteMock.snapshot.params.view = ExpenseView.team;

      component.ionViewWillEnter();
      component.canDelete$.subscribe((canDelete) => {
        expect(mockWithoutCustPropData.state).toEqual(ExpenseState.PAID);
        expect(canDelete).toBeFalse();
      });
    });

    it('should return true if the transaction state is DRAFT and there are more than one transactions in the report', () => {
      const mockWithoutCustPropData: Expense = {
        ...expenseData,
        report_id: 'rphNNUiCISkD',
        state: ExpenseState.DRAFT,
        custom_fields: null,
      };
      approverReportsService.getReportById.and.returnValue(of(expectedReportsSinglePageSubmitted[2]));
      approverExpensesService.getExpenseById.and.returnValue(of(mockWithoutCustPropData));
      component.expenseWithoutCustomProperties$ = of(mockWithoutCustPropData);
      activateRouteMock.snapshot.params.view = ExpenseView.team;

      component.ionViewWillEnter();
      component.canDelete$.subscribe((canDelete) => {
        expect(mockWithoutCustPropData.state).toEqual(ExpenseState.DRAFT);
        expect(canDelete).toBeTrue();
      });
    });

    it('should return true if the policy amount value is of type number should check if the amount is capped', (done) => {
      spyOn(component, 'isNumber').and.returnValue(true);
      const mockExpenseData: Expense = {
        ...expenseData,
        policy_amount: 1000,
        admin_amount: null,
      };

      spenderExpensesService.getExpenseById.and.returnValue(of(mockExpenseData));
      component.expense$ = of(mockExpenseData);
      component.ionViewWillEnter();
      component.isAmountCapped$.subscribe((isAmountCapped) => {
        expect(isAmountCapped).toBeTrue();
        done();
      });
    });

    it('should return true if the admin amount value is of type number should check if the amount is capped', (done) => {
      spyOn(component, 'isNumber').and.returnValue(true);
      const mockExpenseData: Expense = {
        ...expenseData,
        admin_amount: 1000,
        policy_amount: null,
      };

      spenderExpensesService.getExpenseById.and.returnValue(of(mockExpenseData));
      component.expense$ = of(mockExpenseData);
      component.ionViewWillEnter();
      component.isAmountCapped$.subscribe((isAmountCapped) => {
        expect(isAmountCapped).toBeTrue();
        expect(component.isNumber).toHaveBeenCalledOnceWith(mockExpenseData.admin_amount);
        done();
      });
    });

    it('should return false if the value is not of type number and check if the expense is capped', (done) => {
      spyOn(component, 'isNumber').and.returnValue(false);
      const mockExpenseData: Expense = {
        ...expenseData,
        admin_amount: null,
        policy_amount: null,
      };

      spenderExpensesService.getExpenseById.and.returnValue(of(mockExpenseData));
      component.expense$ = of(mockExpenseData);
      component.ionViewWillEnter();
      component.isAmountCapped$.subscribe((isAmountCapped) => {
        expect(isAmountCapped).toBeFalse();
        expect(component.isNumber).toHaveBeenCalledWith(mockExpenseData.policy_amount);
        expect(component.isNumber).toHaveBeenCalledTimes(2);
        done();
      });
    });

    it('should get all the org setting and return true if new reports Flow Enabled ', () => {
      const mockOrgSettings = {
        ...orgSettingsGetData,
        simplified_report_closure_settings: {
          allowed: false,
          enabled: true,
        },
      };
      orgSettingsService.get.and.returnValue(of(mockOrgSettings));
      component.ionViewWillEnter();
      expect(component.isNewReportsFlowEnabled).toBeTrue();
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
    });

    it('should get all the org setting and return false if there are no report closure settings ', () => {
      const mockOrgSettings = {
        ...orgSettingsGetData,
        simplified_report_closure_settings: null,
      };
      orgSettingsService.get.and.returnValue(of(mockOrgSettings));
      component.ionViewWillEnter();
      expect(component.isNewReportsFlowEnabled).toBeFalse();
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
    });

    it('should get all the org setting and return false if simplified_report_closure_settings is not present in orgSettings', () => {
      orgSettingsService.get.and.returnValue(of(orgSettingsGetData));
      component.ionViewWillEnter();
      expect(component.isNewReportsFlowEnabled).toBeFalse();
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
    });

    it('should set isRTFEnabled to true if only visa rtf is enabled', () => {
      const mockOrgSettings: OrgSettings = {
        ...orgSettingsGetData,
        mastercard_enrollment_settings: {
          allowed: false,
          enabled: false,
        },
      };

      orgSettingsService.get.and.returnValue(of(mockOrgSettings));
      component.ionViewWillEnter();
      expect(component.isRTFEnabled).toBeTrue();
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
    });

    it('should set isRTFEnabled to true if only mastercard rtf is enabled', () => {
      const mockOrgSettings: OrgSettings = {
        ...orgSettingsGetData,
        visa_enrollment_settings: {
          allowed: false,
          enabled: false,
        },
      };

      orgSettingsService.get.and.returnValue(of(mockOrgSettings));
      component.ionViewWillEnter();
      expect(component.isRTFEnabled).toBeTrue();
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
    });

    it('should set isRTFEnabled to false if both visa/mastercard rtf are not enabled', () => {
      const mockOrgSettings: OrgSettings = {
        ...orgSettingsGetData,
        visa_enrollment_settings: {
          allowed: false,
          enabled: false,
        },
        mastercard_enrollment_settings: {
          allowed: false,
          enabled: false,
        },
      };

      orgSettingsService.get.and.returnValue(of(mockOrgSettings));
      component.ionViewWillEnter();
      expect(component.isRTFEnabled).toBeFalse();
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
    });

    it('should get the merchant field name', () => {
      expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse4));
      component.ionViewWillEnter();
      expect(component.merchantFieldName).toEqual('Merchant');
      expect(expenseFieldsService.getAllMap).toHaveBeenCalledTimes(2);
    });

    it('should set the merchant field to null', () => {
      const mockExpenseFielsMap1 = {
        ...expenseFieldsMapResponse4,
        vendor_id: [],
      };
      expenseFieldsService.getAllMap.and.returnValue(of(mockExpenseFielsMap1));
      component.ionViewWillEnter();
      expect(component.merchantFieldName).toBeUndefined();
      expect(expenseFieldsService.getAllMap).toHaveBeenCalledTimes(2);
    });

    it('should be true if expense policy is violated', () => {
      spyOn(component, 'isNumber').and.returnValue(true);
      const mockExpenseData: Expense = {
        ...expenseData,
        policy_amount: -1,
      };
      spenderExpensesService.getExpenseById.and.returnValue(of(mockExpenseData));
      component.expense$ = of(mockExpenseData);
      component.ionViewWillEnter();
      component.isCriticalPolicyViolated$.subscribe((isCriticalPolicyViolated) => {
        expect(isCriticalPolicyViolated).toBeTrue();
        expect(component.isNumber).toHaveBeenCalledOnceWith(mockExpenseData.policy_amount);
      });
    });

    it('should be able to edit expense attachments', fakeAsync(() => {
      spyOn(component.updateFlag$, 'next');
      component.view = ExpenseView.team;

      const details = {
        url: 'mock-url',
        type: 'image',
        thumbnail: 'mock-thumbnail',
      };

      fileService.getReceiptsDetails.and.returnValue(details);
      approverFileService.generateUrlsBulk.and.returnValue(of(urlsBulkData));

      component.ionViewWillEnter();
      tick(500);
      component.expense$.subscribe((expense) => {
        expect(approverFileService.generateUrlsBulk).toHaveBeenCalledOnceWith(expense.file_ids);
        expect(fileService.getReceiptsDetails).toHaveBeenCalledOnceWith(
          urlsBulkData[0].name,
          urlsBulkData[0].download_url
        );
      });
      tick(500);
      expect(component.updateFlag$.next).toHaveBeenCalledOnceWith(null);
      component.attachments$.subscribe((attachments) => {
        expect(attachments).toEqual([details]);
        expect(component.isLoading).toBeFalse();
      });
    }));

    it('should parse the transaction ids and active index accordingly', () => {
      activateRouteMock.snapshot.params.txnIds = '["tx3qwe4ty","tx6sd7gh","txD3cvb6"]';
      activateRouteMock.snapshot.params.activeIndex = '20';
      component.ionViewWillEnter();
      expect(component.reportExpenseCount).toEqual(3);
      expect(component.activeExpenseIndex).toEqual(20);
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

  it('getDeleteDialogProps(): should return the props', () => {
    const props = component.getDeleteDialogProps();
    props.componentProps.deleteMethod();
    expect(approverReportsService.ejectExpenses).toHaveBeenCalledOnceWith(component.reportId, component.expenseId);
  });

  describe('removeExpenseFromReport', () => {
    it('should remove the expense from report', fakeAsync(() => {
      activateRouteMock.snapshot.params = {
        id: 'tx5fBcPBAxLv',
      };

      spyOn(component, 'getDeleteDialogProps');
      const deletePopoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onDidDismiss']);
      popoverController.create.and.returnValue(deletePopoverSpy);
      deletePopoverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });

      component.removeExpenseFromReport();
      tick(500);
      expect(popoverController.create).toHaveBeenCalledOnceWith(component.getDeleteDialogProps());
      expect(deletePopoverSpy.present).toHaveBeenCalledTimes(1);
      expect(deletePopoverSpy.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(trackingService.expenseRemovedByApprover).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'view_team_report',
        { id: component.reportId, navigate_back: true },
      ]);
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

  it('openTransactionStatusInfoModal(): should open the transaction status info modal', fakeAsync(() => {
    const popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present']);
    popoverController.create.and.resolveTo(popoverSpy);

    component.openTransactionStatusInfoModal(ExpenseTransactionStatus.PENDING);

    tick();

    expect(popoverController.create).toHaveBeenCalledOnceWith({
      component: TransactionStatusInfoPopoverComponent,
      componentProps: {
        transactionStatus: ExpenseTransactionStatus.PENDING,
      },
      cssClass: 'fy-dialog-popover',
    });
    expect(popoverSpy.present).toHaveBeenCalledTimes(1);
  }));

  it('openCCExpenseMerchantInfoModal(): should open the transaction status info modal', fakeAsync(() => {
    const modalSpy = jasmine.createSpyObj('modal', ['present']);
    modalController.create.and.resolveTo(modalSpy);

    modalProperties.getModalDefaultProperties.and.returnValue({
      cssClass: 'merchant-info',
      showBackdrop: true,
      canDismiss: true,
      backdropDismiss: true,
      animated: true,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      handle: false,
    });

    component.openCCExpenseMerchantInfoModal();

    tick();

    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: CCExpenseMerchantInfoModalComponent,
      cssClass: 'merchant-info',
      showBackdrop: true,
      canDismiss: true,
      backdropDismiss: true,
      animated: true,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      handle: false,
    });

    expect(modalSpy.present).toHaveBeenCalledTimes(1);
    expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
  }));
});
