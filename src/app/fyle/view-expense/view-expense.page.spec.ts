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
import { etxncListData, etxnData, expenseData1, expenseData2 } from 'src/app/core/mock-data/expense.data';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { getApiResponse, getEstatusApiResponse } from 'src/app/core/test-data/status.service.spec.data';
import {
  ApproverExpensePolicyStatesData,
  expensePolicyStatesData,
} from 'src/app/core/mock-data/platform-policy-expense.data';
import { fileObjectAdv, fileObjectAdv1, fileObjectData } from 'src/app/core/mock-data/file-object.data';
import {
  individualExpPolicyStateData1,
  individualExpPolicyStateData3,
} from 'src/app/core/mock-data/individual-expense-policy-state.data';
import { IndividualExpensePolicyState } from 'src/app/core/models/platform/platform-individual-expense-policy-state.model';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { FyPopoverComponent } from 'src/app/shared/components/fy-popover/fy-popover.component';
import { FyViewAttachmentComponent } from 'src/app/shared/components/fy-view-attachment/fy-view-attachment.component';
import { expenseFieldsMapResponse, expenseFieldsMapResponse4 } from 'src/app/core/mock-data/expense-fields-map.data';
import { apiTeamReportPaginated1, apiTeamRptSingleRes, expectedReports } from 'src/app/core/mock-data/api-reports.data';
import { expectedECccResponse } from 'src/app/core/mock-data/corporate-card-expense-unflattened.data';
import { filledCustomProperties } from 'src/app/core/test-data/custom-inputs.spec.data';
import { dependentFieldValues } from 'src/app/core/test-data/dependent-fields.service.spec.data';
import { orgSettingsGetData } from 'src/app/core/test-data/org-settings.service.spec.data';

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
      const mockExchangeRateExpData = {
        ...expenseData1,
        source_account_type: 'PERSONAL_ADVANCE_ACCOUNT',
      };
      component.etxn$ = of(mockExchangeRateExpData);
      component.setPaymentModeandIcon(mockExchangeRateExpData);
      component.etxn$.subscribe((res) => {
        expect(res.source_account_type).toEqual('PERSONAL_ADVANCE_ACCOUNT');
        expect(component.paymentMode).toEqual('Advance');
        expect(component.paymentModeIcon).toEqual('fy-non-reimbursable');
      });
    });

    it('should set the payment mode and icon accordingly when the source account type is CCC', () => {
      const mockExchangeRateExpData = {
        ...expenseData1,
        tx_skip_reimbursement: false,
        source_account_type: 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
      };

      component.etxn$ = of(mockExchangeRateExpData);
      component.setPaymentModeandIcon(mockExchangeRateExpData);
      component.etxn$.subscribe((res) => {
        expect(res.source_account_type).toEqual('PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT');
        expect(component.paymentMode).toEqual('Corporate Card');
        expect(component.paymentModeIcon).toEqual('fy-unmatched');
        expect(component.isCCCTransaction).toBeTrue();
      });
    });

    it('should set the payment mode and icon accordingly when the expense is non-reimbursable', () => {
      const mockExchangeRateExpData = {
        ...expenseData1,
        tx_skip_reimbursement: true,
      };
      component.etxn$ = of(mockExchangeRateExpData);
      component.setPaymentModeandIcon(mockExchangeRateExpData);
      component.etxn$.subscribe((res) => {
        expect(res.tx_skip_reimbursement).toBeTrue();
        expect(component.paymentMode).toEqual('Paid by Company');
        expect(component.paymentModeIcon).toEqual('fy-non-reimbursable');
      });
    });

    it('the amount is reimbursable if non of the conditions match', () => {
      const mockExchangeRateExpData = {
        ...expenseData1,
        source_account_type: 'PERSONAL_ACCOUNT',
        tx_skip_reimbursement: false,
      };
      component.etxn$ = of(mockExchangeRateExpData);
      component.setPaymentModeandIcon(mockExchangeRateExpData);
      component.etxn$.subscribe((res) => {
        expect(res.source_account_type).toEqual('PERSONAL_ACCOUNT');
        expect(component.paymentMode).toEqual('Paid by Employee');
        expect(component.paymentModeIcon).toEqual('fy-reimbursable');
      });
    });
  });

  describe('ionViewWillEnter', () => {
    beforeEach(() => {
      component.reportId = 'rpT7x1BFlLOi';
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

      const mockWithoutCustPropData = {
        ...expenseData1,
        tx_custom_properties: null,
      };
      component.etxnWithoutCustomProperties$ = of(mockWithoutCustPropData);
      transactionService.getEtxn.and.returnValue(of(expenseData1));

      customInputsService.fillCustomProperties.and.returnValue(of(filledCustomProperties));
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();

      expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse4));

      component.etxn$ = of(expenseData1);
      component.txnFields$ = of(expenseFieldsMapResponse4);

      dependentFieldsService.getDependentFieldValuesForBaseField.and.returnValue(of(dependentFieldValues));

      corporateCreditCardExpenseService.getEccceByGroupId.and.returnValue(of(expectedECccResponse));
      statusService.find.and.returnValue(of(getEstatusApiResponse));

      orgSettingsService.get.and.returnValue(of(orgSettingsGetData));

      const mockDownloadUrl = {
        url: 'mock-url',
      };
      fileService.findByTransactionId.and.returnValue(of([fileObjectData]));
      fileService.downloadUrl.and.returnValue(of(mockDownloadUrl.url));
      reportService.getTeamReport.and.returnValue(of(apiTeamRptSingleRes.data[0]));
    });

    it('should get all the system categories and get the correct value of report is by subscribing to etxnWithoutCustomProperties$', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(500);
      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
      expect(categoriesService.getSystemCategories).toHaveBeenCalledTimes(1);
      expect(categoriesService.getSystemCategoriesWithTaxi).toHaveBeenCalledTimes(1);
      expect(categoriesService.getBreakfastSystemCategories).toHaveBeenCalledTimes(1);
      expect(categoriesService.getTravelSystemCategories).toHaveBeenCalledTimes(1);
      expect(categoriesService.getFlightSystemCategories).toHaveBeenCalledTimes(1);
      component.etxnWithoutCustomProperties$.subscribe((res) => {
        expect(res).toEqual(expenseData1);
        expect(component.reportId).toEqual(res.tx_report_id);
      });
      expect(transactionService.getEtxn).toHaveBeenCalledOnceWith(activateRouteMock.snapshot.params.id);
      tick(500);
      component.txnFields$.subscribe((res) => {
        expect(res).toEqual(expenseFieldsMapResponse4);
        expect(expenseFieldsService.getAllMap).toHaveBeenCalledTimes(2);
      });
    }));

    it('should get the custom properties', (done) => {
      component.ionViewWillEnter();
      component.customProperties$.subscribe((res) => {
        expect(res).toEqual(filledCustomProperties);
        expect(customInputsService.fillCustomProperties).toHaveBeenCalledOnceWith(
          expenseData1.tx_org_category_id,
          expenseData1.tx_custom_properties,
          true
        );
        done();
      });
    });

    it('should get the project dependent custom properties', (done) => {
      const customProps = expenseData1.tx_custom_properties;
      const projectIdNumber = expenseFieldsMapResponse4.project_id[0].id;
      component.ionViewWillEnter();
      component.projectDependentCustomProperties$.subscribe((res) => {
        expect(res).toEqual(dependentFieldValues);
        expect(expenseData1.tx_custom_properties).toBeDefined();
        expect(expenseFieldsMapResponse4.project_id.length).toBeGreaterThan(0);
        expect(dependentFieldsService.getDependentFieldValuesForBaseField).toHaveBeenCalledOnceWith(
          customProps,
          projectIdNumber
        );
        done();
      });
    });

    it('should get the cost center dependent custom properties', (done) => {
      const customProps = expenseData1.tx_custom_properties;
      const costCenterId = expenseFieldsMapResponse4.cost_center_id[0].id;
      component.ionViewWillEnter();
      component.costCenterDependentCustomProperties$.subscribe((res) => {
        expect(res).toEqual(dependentFieldValues);
        expect(expenseData1.tx_custom_properties).toBeDefined();
        expect(expenseFieldsMapResponse4.project_id.length).toBeGreaterThan(0);
        expect(dependentFieldsService.getDependentFieldValuesForBaseField).toHaveBeenCalledOnceWith(
          customProps,
          costCenterId
        );
        done();
      });
    });

    it('should set the correct value for split expenses and expense rate', (done) => {
      const mockExchangeRateExpData = {
        ...expenseData1,
        ou_org_name: 'Test',
        tx_split_group_id: 'tx5fBcNgRxJk',
      };
      transactionService.getEtxn.and.returnValue(of(mockExchangeRateExpData));
      component.etxn$ = of(mockExchangeRateExpData);
      component.ionViewWillEnter();
      component.etxn$.subscribe((res) => {
        expect(res.tx_split_group_id).not.toEqual(res.tx_id);
        done();
      });
    });

    it('should set the correct exchange rate', () => {
      component.exchangeRate = 0;
      const mockExchangeRateExpData = {
        ...expenseData1,
        tx_split_group_id: 'tx5fBcNgRxJk',
        tx_amount: 500,
        tx_orig_amount: 1000,
      };
      transactionService.getEtxn.and.returnValue(of(mockExchangeRateExpData));
      component.ionViewWillEnter();
      expect(component.exchangeRate).toBe(0.5);
    });

    it('should set the matchingCCCTxnIds and the correct card number and set foreign and expense transaction currency symbol', (done) => {
      const mockExchangeRateExpData = {
        ...expenseData1,
        tx_skip_reimbursement: false,
        tx_corporate_credit_card_expense_group_id: 'cccet1B17R8gWZ',
      };
      component.isCCCTransaction = true;
      transactionService.getEtxn.and.returnValue(of(mockExchangeRateExpData));
      component.etxn$ = of(mockExchangeRateExpData);
      component.ionViewWillEnter();
      component.matchingCCCTransaction$.subscribe((res) => {
        expect(component.paymentModeIcon).toEqual('fy-matched');
        expect(component.cardNumber).toEqual(res.card_or_account_number);
        expect(corporateCreditCardExpenseService.getEccceByGroupId).toHaveBeenCalledOnceWith(
          mockExchangeRateExpData.tx_corporate_credit_card_expense_group_id
        );
        done();
      });
      expect(component.foreignCurrencySymbol).toEqual(expenseData1.tx_orig_currency);
      expect(component.etxnCurrencySymbol).toEqual('$');
    });

    it('should get the project details', () => {
      const mockExpFieldData = {
        ...expenseFieldsMapResponse,
        project_id: [],
      };
      transactionService.getEtxn.and.returnValue(of(expenseData1));
      component.etxn$ = of(expenseData1);
      expenseFieldsService.getAllMap.and.returnValue(of(mockExpFieldData));
      component.txnFields$ = of(mockExpFieldData);

      component.ionViewWillEnter();
      expect(component.projectFieldName).toBeUndefined();
      expect(component.isProjectShown).toBeTruthy();
    });

    it('should get the project details when project name is not present', () => {
      const mockExpData = {
        ...expenseData1,
        tx_project_name: null,
      };
      transactionService.getEtxn.and.returnValue(of(mockExpData));
      expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse4));
      component.etxn$ = of(mockExpData);

      component.ionViewWillEnter();
      expect(component.projectFieldName).toEqual('Project ID');
      expect(component.isProjectShown).toBeTrue();
    });

    it('should get all the policy violations', (done) => {
      spyOn(component, 'isPolicyComment').and.returnValue(true);
      component.ionViewWillEnter();
      component.policyViloations$.subscribe(() => {
        expect(statusService.find).toHaveBeenCalledWith('transactions', expenseData1.tx_id);
        expect(statusService.find).toHaveBeenCalledTimes(2);
        expect(component.isPolicyComment).toHaveBeenCalledTimes(5);
        done();
      });
    });

    it('should get all the comments and set the appropriate view', (done) => {
      activateRouteMock.snapshot.params = {
        id: 'tx5fBcPBAxLv',
        view: ExpenseView.team,
        activeIndex: '0',
      };
      component.ionViewWillEnter();
      component.comments$.subscribe(() => {
        expect(statusService.find).toHaveBeenCalledOnceWith('transactions', expenseData1.tx_id);
        done();
      });
      expect(component.view).toEqual(activateRouteMock.snapshot.params.view);
    });

    it('should get the flag status', (done) => {
      const mockWithoutCustPropData = {
        ...etxnData,
        tx_custom_properties: null,
      };

      transactionService.getEtxn.and.returnValue(of(mockWithoutCustPropData));
      component.etxnWithoutCustomProperties$ = of(mockWithoutCustPropData);
      activateRouteMock.snapshot.params.view = ExpenseView.team;
      component.etxn$ = of(etxnData);
      component.ionViewWillEnter();
      component.canFlagOrUnflag$.subscribe((res) => {
        expect(etxnData.tx_state).toEqual('APPROVED');
        expect(res).toBeTrue();
        done();
      });
    });

    it('should return false if there is only one transaction in the report and the state is PAID', () => {
      const mockWithoutCustPropData = {
        ...etxnData,
        tx_state: 'PAID',
        tx_report_id: 'rphNNUiCISkD',
        tx_custom_properties: null,
      };
      reportService.getTeamReport.and.returnValue(of(apiTeamRptSingleRes.data[0]));
      transactionService.getEtxn.and.returnValue(of(mockWithoutCustPropData));
      component.etxnWithoutCustomProperties$ = of(mockWithoutCustPropData);
      activateRouteMock.snapshot.params.view = ExpenseView.team;

      component.ionViewWillEnter();
      component.canDelete$.subscribe((res) => {
        expect(mockWithoutCustPropData.tx_state).toEqual('PAID');
        expect(res).toBeFalse();
      });
    });

    it('should return true if the transaction state is DRAFT and there are more than one transactions in the report', () => {
      const mockWithoutCustPropData = {
        ...expenseData1,
        tx_report_id: 'rphNNUiCISkD',
        tx_custom_properties: null,
      };
      reportService.getTeamReport.and.returnValue(of(apiTeamReportPaginated1.data[3]));
      transactionService.getEtxn.and.returnValue(of(mockWithoutCustPropData));
      component.etxnWithoutCustomProperties$ = of(mockWithoutCustPropData);
      activateRouteMock.snapshot.params.view = ExpenseView.team;

      component.ionViewWillEnter();
      component.canDelete$.subscribe((res) => {
        expect(mockWithoutCustPropData.tx_state).toEqual('DRAFT');
        expect(res).toBeTrue();
      });
    });

    it('should return true if the policy amount value is of type number should check if the amount is capped', (done) => {
      spyOn(component, 'isNumber').and.returnValue(true);
      const mockExpenseData = {
        ...expenseData1,
        tx_policy_amount: 1000,
        tx_admin_amount: null,
      };

      transactionService.getEtxn.and.returnValue(of(mockExpenseData));
      component.etxn$ = of(mockExpenseData);
      component.ionViewWillEnter();
      component.isAmountCapped$.subscribe((res) => {
        expect(res).toBeTrue();
        done();
      });
    });

    it('should return true if the admin amount value is of type number should check if the amount is capped', (done) => {
      spyOn(component, 'isNumber').and.returnValue(true);
      const mockExpenseData = {
        ...expenseData1,
        tx_admin_amount: 1000,
        tx_policy_amount: null,
      };

      transactionService.getEtxn.and.returnValue(of(mockExpenseData));
      component.etxn$ = of(mockExpenseData);
      component.ionViewWillEnter();
      component.isAmountCapped$.subscribe((res) => {
        expect(res).toBeTrue();
        expect(component.isNumber).toHaveBeenCalledOnceWith(mockExpenseData.tx_admin_amount);
        done();
      });
    });

    it('should return false if the value is not of type number and check if the expense is capped', (done) => {
      spyOn(component, 'isNumber').and.returnValue(false);
      const mockExpenseData = {
        ...expenseData1,
        tx_admin_amount: null,
        tx_policy_amount: null,
      };

      transactionService.getEtxn.and.returnValue(of(mockExpenseData));
      component.etxn$ = of(mockExpenseData);
      component.ionViewWillEnter();
      component.isAmountCapped$.subscribe((res) => {
        expect(res).toBeFalse();
        expect(component.isNumber).toHaveBeenCalledWith(mockExpenseData.tx_policy_amount);
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
      const mockExpenseData = {
        ...expenseData1,
        tx_policy_amount: -1,
      };
      transactionService.getEtxn.and.returnValue(of(mockExpenseData));
      component.etxn$ = of(mockExpenseData);
      component.ionViewWillEnter();
      component.isCriticalPolicyViolated$.subscribe((res) => {
        expect(res).toBeTrue();
        expect(component.isNumber).toHaveBeenCalledOnceWith(mockExpenseData.tx_policy_amount);
      });
    });

    it('should be able to edit expense attachments', fakeAsync(() => {
      spyOn(component, 'getReceiptDetails').and.returnValue({
        type: 'image',
        thumbnail: 'mock-thumbnail',
      });

      spyOn(component.updateFlag$, 'next');

      const mockDownloadUrl = {
        url: 'mock-url',
      };
      fileService.findByTransactionId.and.returnValue(of([fileObjectData]));
      fileService.downloadUrl.and.returnValue(of(mockDownloadUrl.url));
      component.ionViewWillEnter();
      tick(500);
      component.etxn$.subscribe((res) => {
        expect(fileService.findByTransactionId).toHaveBeenCalledOnceWith(res.tx_id);
        expect(fileService.downloadUrl).toHaveBeenCalledOnceWith(fileObjectData.id);
        expect(component.getReceiptDetails).toHaveBeenCalledOnceWith(fileObjectData);
      });
      tick(500);
      expect(component.updateFlag$.next).toHaveBeenCalledOnceWith(null);
      component.attachments$.subscribe((res) => {
        expect(res).toEqual([fileObjectData]);
        expect(component.isLoading).toBeFalse();
      });
    }));

    it('should parse the transaction ids and active index accordingly', () => {
      activateRouteMock.snapshot.params.txnIds = '["tx3qwe4ty","tx6sd7gh","txD3cvb6"]';
      activateRouteMock.snapshot.params.activeIndex = '20';
      component.ionViewWillEnter();
      expect(component.numEtxnsInReport).toEqual(3);
      expect(component.activeEtxnIndex).toEqual(20);
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
