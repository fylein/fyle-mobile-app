import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { ReportService } from 'src/app/core/services/report.service';
import { NetworkService } from '../../core/services/network.service';
import { StatusService } from 'src/app/core/services/status.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { TrackingService } from '../../core/services/tracking.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { ViewMileagePage } from './view-mileage.page';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController, ModalController } from '@ionic/angular';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { expenseData1, expenseData2 } from 'src/app/core/mock-data/expense.data';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { individualExpPolicyStateData3 } from 'src/app/core/mock-data/individual-expense-policy-state.data';
import {
  ApproverExpensePolicyStatesData,
  expensePolicyStatesData,
} from 'src/app/core/mock-data/platform-policy-expense.data';
import { dependentFieldValues } from 'src/app/core/test-data/dependent-fields.service.spec.data';
import { FyPopoverComponent } from 'src/app/shared/components/fy-popover/fy-popover.component';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { FyViewAttachmentComponent } from 'src/app/shared/components/fy-view-attachment/fy-view-attachment.component';
import { FileService } from 'src/app/core/services/file.service';
import { expenseFieldsMapResponse, expenseFieldsMapResponse4 } from 'src/app/core/mock-data/expense-fields-map.data';
import { orgSettingsGetData } from 'src/app/core/test-data/org-settings.service.spec.data';
import { filledCustomProperties } from 'src/app/core/test-data/custom-inputs.spec.data';
import { getEstatusApiResponse } from 'src/app/core/test-data/status.service.spec.data';
import { apiTeamRptSingleRes, expectedReports } from 'src/app/core/mock-data/api-reports.data';
import { cloneDeep, slice } from 'lodash';
import { isEmpty } from 'rxjs/operators';
import { txnStatusData } from 'src/app/core/mock-data/transaction-status.data';
import { mileageExpense } from 'src/app/core/mock-data/platform/v1/expense.data';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { ExpenseState } from 'src/app/core/models/expense-state.enum';
import { AccountType } from 'src/app/core/models/platform/v1/account.model';
import { ExpensesService as ApproverExpensesService } from 'src/app/core/services/platform/v1/approver/expenses.service';
import { ExpensesService as SpenderExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { MileageRatesService } from 'src/app/core/services/mileage-rates.service';
import { platformMileageRatesSingleData } from 'src/app/core/mock-data/platform-mileage-rate.data';

describe('ViewMileagePage', () => {
  let component: ViewMileagePage;
  let fixture: ComponentFixture<ViewMileagePage>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let customInputsService: jasmine.SpyObj<CustomInputsService>;
  let policyService: jasmine.SpyObj<PolicyService>;
  let reportService: jasmine.SpyObj<ReportService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let router: jasmine.SpyObj<Router>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let statusService: jasmine.SpyObj<StatusService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let dependentFieldsService: jasmine.SpyObj<DependentFieldsService>;
  let fileService: jasmine.SpyObj<FileService>;
  let spenderExpensesService: jasmine.SpyObj<SpenderExpensesService>;
  let approverExpensesService: jasmine.SpyObj<ApproverExpensesService>;
  let mileageRatesService: jasmine.SpyObj<MileageRatesService>;
  let activateRouteMock: ActivatedRoute;

  beforeEach(waitForAsync(() => {
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['hideLoader', 'showLoader']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['manualUnflag', 'manualFlag']);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', ['getTeamReport', 'removeTransaction']);
    const customInputsServiceSpy = jasmine.createSpyObj('CustomInputsService', [
      'getCustomPropertyDisplayValue',
      'fillCustomProperties',
    ]);
    const statusServiceSpy = jasmine.createSpyObj('StatusService', ['find', 'post']);
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
    const dependentFieldsServiceSpy = jasmine.createSpyObj('DependentFieldsService', [
      'getDependentFieldValuesForBaseField',
    ]);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['findByTransactionId', 'downloadUrl']);
    const spenderExpensesServiceSpy = jasmine.createSpyObj('SpenderExpensesService', ['getExpenseById']);
    const approverExpensesServiceSpy = jasmine.createSpyObj('ApproverExpensesService', ['getExpenseById']);
    const mileageRatesServiceSpy = jasmine.createSpyObj('MileageRatesService', [
      'getSpenderMileageRateById',
      'getApproverMileageRateById',
    ]);

    TestBed.configureTestingModule({
      declarations: [ViewMileagePage],
      imports: [IonicModule.forRoot()],
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
          useValue: dependentFieldsServiceSpy,
          provide: DependentFieldsService,
        },
        {
          useValue: fileServiceSpy,
          provide: FileService,
        },
        {
          useValue: spenderExpensesServiceSpy,
          provide: SpenderExpensesService,
        },
        {
          useValue: approverExpensesServiceSpy,
          provide: ApproverExpensesService,
        },
        {
          useValue: mileageRatesServiceSpy,
          provide: MileageRatesService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                id: 'tx3qwe4ty',
                view: ExpenseView.individual,
                txnIds: '["tx3qwe4ty","tx6sd7gh","txD3cvb6"]',
                activeIndex: '0',
              },
            },
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ViewMileagePage);
    component = fixture.componentInstance;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    customInputsService = TestBed.inject(CustomInputsService) as jasmine.SpyObj<CustomInputsService>;
    statusService = TestBed.inject(StatusService) as jasmine.SpyObj<StatusService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    policyService = TestBed.inject(PolicyService) as jasmine.SpyObj<PolicyService>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    dependentFieldsService = TestBed.inject(DependentFieldsService) as jasmine.SpyObj<DependentFieldsService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    spenderExpensesService = TestBed.inject(SpenderExpensesService) as jasmine.SpyObj<SpenderExpensesService>;
    approverExpensesService = TestBed.inject(ApproverExpensesService) as jasmine.SpyObj<ApproverExpensesService>;
    mileageRatesService = TestBed.inject(MileageRatesService) as jasmine.SpyObj<MileageRatesService>;
    activateRouteMock = TestBed.inject(ActivatedRoute);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ionViewWillLeave(): should execute the on page exit next function', () => {
    spyOn(component.onPageExit$, 'next');

    component.ionViewWillLeave();
    expect(component.onPageExit$.next).toHaveBeenCalledOnceWith(null);
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
        },
        ...modalProperties.getModalDefaultProperties(),
      });
      expect(modalSpy.present).toHaveBeenCalledTimes(1);
      expect(modalSpy.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(trackingService.viewComment).toHaveBeenCalledOnceWith({ view: 'Individual' });
    }));
  });

  it('getDeleteDialogProps(): should return the props', () => {
    const props = component.getDeleteDialogProps();
    props.componentProps.deleteMethod();
    expect(reportService.removeTransaction).toHaveBeenCalledOnceWith(component.reportId, component.expenseId);
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

  describe('flagUnflagExpense', () => {
    it('should flag,unflagged expense', fakeAsync(() => {
      activateRouteMock.snapshot.queryParams = {
        id: 'tx5fBcPBAxLv',
      };

      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();

      const title = 'Flag';
      const flagPopoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
      popoverController.create.and.returnValue(flagPopoverSpy);
      const data = { comment: 'This is a comment for flagging' };
      flagPopoverSpy.onWillDismiss.and.resolveTo({ data });
      statusService.post.and.returnValue(of(txnStatusData));
      transactionService.manualFlag.and.returnValue(of(expenseData2));

      component.flagUnflagExpense(false);
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
      expect(statusService.post).toHaveBeenCalledOnceWith('transactions', component.expenseId, data, true);
      expect(transactionService.manualFlag).toHaveBeenCalledOnceWith(component.expenseId);
      tick(500);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(trackingService.expenseFlagUnflagClicked).toHaveBeenCalledOnceWith({ action: title });
    }));

    it('should unflag,flagged expense', fakeAsync(() => {
      activateRouteMock.snapshot.params = {
        id: 'tx5fBcPBAxLv',
      };

      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();

      const title = 'Unflag';
      const flagPopoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
      popoverController.create.and.returnValue(flagPopoverSpy);
      const data = { comment: 'This is a comment for flagging' };
      flagPopoverSpy.onWillDismiss.and.resolveTo({ data });
      statusService.post.and.returnValue(of(txnStatusData));
      transactionService.manualUnflag.and.returnValue(of(expenseData1));

      component.flagUnflagExpense(true);
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
      expect(statusService.post).toHaveBeenCalledOnceWith('transactions', component.expenseId, data, true);
      expect(transactionService.manualUnflag).toHaveBeenCalledOnceWith(component.expenseId);
      tick(500);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(trackingService.expenseFlagUnflagClicked).toHaveBeenCalledOnceWith({ action: title });
    }));
  });

  describe('ionViewWillEnter', () => {
    beforeEach(() => {
      component.expenseId = 'tx5fBcPBAxLv';
      component.reportId = 'rpynbzxa3psU';

      spyOn(component, 'setupNetworkWatcher');
      spyOn(component, 'getPolicyDetails');

      activateRouteMock.snapshot.params = {
        id: 'tx5fBcPBAxLv',
        view: ExpenseView.individual,
        txnIds: '["tx3qwe4ty","tx6sd7gh","txD3cvb6"]',
        activeIndex: '0',
      };

      component.mileageExpense$ = of(mileageExpense);
      component.view = activateRouteMock.snapshot.params.view;
      loaderService.showLoader.and.resolveTo();
      spenderExpensesService.getExpenseById.and.returnValue(of(mileageExpense));
      approverExpensesService.getExpenseById.and.returnValue(of(mileageExpense));
      loaderService.hideLoader.and.resolveTo();

      expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse4));
      component.expenseFields$ = of(expenseFieldsMapResponse4);

      dependentFieldsService.getDependentFieldValuesForBaseField.and.returnValue(of(dependentFieldValues));
      orgSettingsService.get.and.returnValue(of(orgSettingsGetData));

      customInputsService.fillCustomProperties.and.returnValue(of(filledCustomProperties));
      statusService.find.and.returnValue(of(getEstatusApiResponse));
    });

    it('should get all the data for extended mileage and expense fields', fakeAsync(() => {
      spyOn(component.updateFlag$, 'next');
      component.ionViewWillEnter();
      tick(500);
      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);

      component.mileageExpense$.subscribe((data) => {
        expect(data).toEqual(mileageExpense);
        expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
        expect(spenderExpensesService.getExpenseById).toHaveBeenCalledOnceWith(activateRouteMock.snapshot.params.id);
        expect(component.updateFlag$.next).toHaveBeenCalledOnceWith(null);
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      });

      component.expenseFields$.subscribe((data) => {
        expect(data).toEqual(expenseFieldsMapResponse4);
        expect(expenseFieldsService.getAllMap).toHaveBeenCalledTimes(1);
      });
    }));

    it('should get the project dependent custom properties', (done) => {
      const customProps = mileageExpense.custom_fields;
      const projectIdNumber = expenseFieldsMapResponse4.project_id[0].id;

      component.expenseFields$ = of(expenseFieldsMapResponse4);
      component.ionViewWillEnter();
      component.projectDependentCustomProperties$.subscribe((data) => {
        expect(data).toEqual(dependentFieldValues);
        expect(mileageExpense.custom_fields).toBeDefined();
        expect(expenseFieldsMapResponse4.project_id.length).toBeGreaterThan(0);
        expect(dependentFieldsService.getDependentFieldValuesForBaseField).toHaveBeenCalledOnceWith(
          customProps,
          projectIdNumber
        );
        done();
      });
    });

    it('should get the cost center dependent custom properties', (done) => {
      const customProps = mileageExpense.custom_fields;
      const costCenterIdNumber = expenseFieldsMapResponse4.cost_center_id[0].id;
      component.ionViewWillEnter();
      component.costCenterDependentCustomProperties$.subscribe((data) => {
        expect(data).toEqual(dependentFieldValues);
        expect(mileageExpense.custom_fields).toBeDefined();
        expect(expenseFieldsMapResponse4.cost_center_id.length).toBeGreaterThan(0);
        expect(dependentFieldsService.getDependentFieldValuesForBaseField).toHaveBeenCalledOnceWith(
          customProps,
          costCenterIdNumber
        );
        done();
      });
    });

    it('should set the correct report id and set proper payment mode and icon', (done) => {
      const mockMileageExpense: Expense = {
        ...mileageExpense,
        source_account: {
          ...mileageExpense.source_account,
          type: AccountType.PERSONAL_ADVANCE_ACCOUNT,
        },
      };

      spenderExpensesService.getExpenseById.and.returnValue(of(mockMileageExpense));

      component.ionViewWillEnter();
      component.mileageExpense$.subscribe((data) => {
        expect(data).toEqual(mockMileageExpense);
        expect(component.reportId).toEqual(mockMileageExpense.report_id);
        expect(component.paymentMode).toEqual('Paid from Advance');
        expect(component.paymentModeIcon).toEqual('fy-non-reimbursable');
        done();
      });
    });

    it('should set the correct payment mode and icon when reimbursement is skipped', (done) => {
      const mockMileageExpense: Expense = {
        ...mileageExpense,
        is_reimbursable: false,
      };

      spenderExpensesService.getExpenseById.and.returnValue(of(mockMileageExpense));

      component.ionViewWillEnter();
      component.mileageExpense$.subscribe((data) => {
        expect(data).toEqual(mockMileageExpense);
        expect(component.reportId).toEqual(mockMileageExpense.report_id);
        expect(component.paymentMode).toEqual('Paid by Company');
        expect(component.paymentModeIcon).toEqual('fy-non-reimbursable');
        done();
      });
    });

    it('should set the correct payment mode and icon when the expense is reimbursement', (done) => {
      component.ionViewWillEnter();
      component.mileageExpense$.subscribe((data) => {
        expect(data).toEqual(mileageExpense);
        expect(component.paymentMode).toEqual('Paid by Employee');
        expect(component.paymentModeIcon).toEqual('fy-reimbursable');
        done();
      });
    });

    it('should set the vehicle type to car if the mileage_vehicle type has the word four in it', (done) => {
      const mockMileageExpense: Expense = {
        ...mileageExpense,
        mileage_rate: {
          ...mileageExpense.mileage_rate,
          vehicle_type: 'Four Wheeler - Type 1 (₹11.00/km)',
        },
      };

      component.mileageExpense$ = of(mockMileageExpense);
      spenderExpensesService.getExpenseById.and.returnValue(of(mockMileageExpense));
      component.ionViewWillEnter();
      component.mileageExpense$.subscribe((data) => {
        expect(data).toEqual(mockMileageExpense);
        expect(component.vehicleType).toEqual('car');
        done();
      });
    });

    it('should set the vehicle type to car if the mileage_vehicle type has the word car in it', (done) => {
      const mockMileageExpense: Expense = {
        ...mileageExpense,
        mileage_rate: {
          ...mileageExpense.mileage_rate,
          vehicle_type: 'Electric Car',
        },
      };

      component.mileageExpense$ = of(mockMileageExpense);
      spenderExpensesService.getExpenseById.and.returnValue(of(mockMileageExpense));

      component.ionViewWillEnter();
      component.mileageExpense$.subscribe((data) => {
        expect(data).toEqual(mockMileageExpense);
        expect(component.vehicleType).toEqual('car');
        done();
      });
    });

    it('should set the vehicle type to scooter if the mileage_vehicle type has neither of htese words - car or four', (done) => {
      const mockMileageExpense: Expense = {
        ...mileageExpense,
        mileage_rate: {
          ...mileageExpense.mileage_rate,
          vehicle_type: 'Two Wheeler - Type 1 (₹11.00/km)',
        },
      };
      component.mileageExpense$ = of(mockMileageExpense);
      spenderExpensesService.getExpenseById.and.returnValue(of(mockMileageExpense));
      component.ionViewWillEnter();
      component.mileageExpense$.subscribe((data) => {
        expect(data).toEqual(mockMileageExpense);
        expect(component.vehicleType).toEqual('scooter');
        done();
      });
    });

    it('should get the correct currency symbol', (done) => {
      component.ionViewWillEnter();
      component.mileageExpense$.subscribe((data) => {
        expect(data.currency).toEqual('USD');
        expect(component.expenseCurrencySymbol).toEqual('$');
        done();
      });
    });

    it('should get the project details', fakeAsync(() => {
      const mockExpFieldData = {
        ...expenseFieldsMapResponse,
        project_id: [],
      };

      spenderExpensesService.getExpenseById.and.returnValue(of(mileageExpense));
      component.mileageExpense$ = of(mileageExpense);
      expenseFieldsService.getAllMap.and.returnValue(of(mockExpFieldData));
      component.expenseFields$ = of(mockExpFieldData);
      orgSettingsService.get.and.returnValue(of(orgSettingsGetData));

      component.ionViewWillEnter();
      tick(500);
      expect(component.projectFieldName).toBeUndefined();
      expect(component.isProjectShown).toBeTruthy();
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
    }));

    it('should show the project details when project is not present but mandatory', fakeAsync(() => {
      const mockMileageExpense: Expense = {
        ...mileageExpense,
        project: null,
      };
      spenderExpensesService.getExpenseById.and.returnValue(of(mockMileageExpense));
      component.mileageExpense$ = of(mockMileageExpense);

      component.ionViewWillEnter();
      tick(500);
      expect(component.projectFieldName).toEqual('Project ID');
      expect(component.isProjectShown).toBeTrue();
    }));

    it('should set projecct shown to false when org setting do not have the projects property', fakeAsync(() => {
      const mockOrgSettData = {
        ...orgSettingsGetData,
        projects: null,
      };
      spenderExpensesService.getExpenseById.and.returnValue(of(mileageExpense));
      component.mileageExpense$ = of(mileageExpense);
      expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse));
      component.expenseFields$ = of(expenseFieldsMapResponse);
      orgSettingsService.get.and.returnValue(of(mockOrgSettData));
      component.ionViewWillEnter();
      tick(500);
      expect(component.isProjectShown).toBeFalsy();
    }));

    it('should get the project field name and the value of project field name should be truthy', fakeAsync(() => {
      spenderExpensesService.getExpenseById.and.returnValue(of(mileageExpense));
      component.mileageExpense$ = of(mileageExpense);
      const mockExpFieldData = {
        ...expenseFieldsMapResponse4,
        project_id: [
          {
            ...expenseFieldsMapResponse4.project_id[0],
            is_mandatory: false,
          },
        ],
      };
      expenseFieldsService.getAllMap.and.returnValue(of(mockExpFieldData));
      component.expenseFields$ = of(mockExpFieldData);
      orgSettingsService.get.and.returnValue(of(orgSettingsGetData));
      component.ionViewWillEnter();
      tick(500);
      expect(component.projectFieldName).toEqual('Project ID');
      expect(component.isProjectShown).toBeTruthy();
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
    }));

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

    it('should get the custom mileage fields', (done) => {
      const mockfilledCustomProperties = cloneDeep(slice(filledCustomProperties, 0, 1));
      customInputsService.fillCustomProperties.and.returnValue(of(mockfilledCustomProperties));
      customInputsService.getCustomPropertyDisplayValue.and.returnValue(mockfilledCustomProperties[0].displayValue);
      component.ionViewWillEnter();
      component.mileageCustomFields$.subscribe((data) => {
        expect(data).toEqual(mockfilledCustomProperties);
        expect(customInputsService.fillCustomProperties).toHaveBeenCalledOnceWith(
          mileageExpense.category_id,
          mileageExpense.custom_fields,
          true
        );
        expect(customInputsService.getCustomPropertyDisplayValue).toHaveBeenCalledTimes(
          mockfilledCustomProperties.length
        );
        done();
      });
    });

    it('should get the mileage rate for spenders', (done) => {
      mileageRatesService.getSpenderMileageRateById.and.returnValue(of(platformMileageRatesSingleData.data[0]));
      component.mileageExpense$ = of(mileageExpense);
      component.ionViewWillEnter();

      component.mileageRate$.subscribe((mileageRate) => {
        expect(mileageRate).toEqual(platformMileageRatesSingleData.data[0]);
        expect(mileageRatesService.getSpenderMileageRateById).toHaveBeenCalledOnceWith(mileageExpense.mileage_rate_id);
        done();
      });
    });

    it('should get the mileage rate for approvers', (done) => {
      mileageRatesService.getApproverMileageRateById.and.returnValue(of(platformMileageRatesSingleData.data[0]));
      component.mileageExpense$ = of(mileageExpense);
      activateRouteMock.snapshot.params.view = ExpenseView.team;
      component.ionViewWillEnter();

      component.mileageRate$.subscribe((mileageRate) => {
        expect(mileageRate).toEqual(platformMileageRatesSingleData.data[0]);
        expect(mileageRatesService.getApproverMileageRateById).toHaveBeenCalledOnceWith(mileageExpense.mileage_rate_id);
        done();
      });
    });

    it('should get the flag status when the expense can be flagged', (done) => {
      activateRouteMock.snapshot.params.view = ExpenseView.team;
      component.mileageExpense$ = of(mileageExpense);
      component.ionViewWillEnter();
      component.canFlagOrUnflag$.subscribe((res) => {
        expect(mileageExpense.state).toEqual(ExpenseState.APPROVER_PENDING);
        expect(res).toBeTrue();
        done();
      });
    });

    it('expense cannot be flagged when the view is set to indivivual', (done) => {
      activateRouteMock.snapshot.params.view = ExpenseView.individual;
      const mockMileageExpense: Expense = {
        ...mileageExpense,
        state: ExpenseState.PAID,
      };
      component.mileageExpense$ = of(mockMileageExpense);
      component.ionViewWillEnter();
      component.canFlagOrUnflag$.pipe(isEmpty()).subscribe((isEmpty) => {
        expect(isEmpty).toBeTrue();
        done();
      });
    });

    it('should return false if there is only one transaction in the report and the state is PAID', (done) => {
      const mockMileageExpense: Expense = {
        ...mileageExpense,
        state: ExpenseState.PAID,
        report_id: 'rphNNUiCISkD',
        custom_fields: null,
      };
      reportService.getTeamReport.and.returnValue(of(apiTeamRptSingleRes.data[0]));
      spenderExpensesService.getExpenseById.and.returnValue(of(mockMileageExpense));
      component.mileageExpense$ = of(mockMileageExpense);
      component.expenseFields$ = of(expenseFieldsMapResponse4);
      activateRouteMock.snapshot.params.view = ExpenseView.team;

      component.ionViewWillEnter();
      component.canDelete$.subscribe((res) => {
        expect(mockMileageExpense.state).toEqual(ExpenseState.PAID);
        expect(res).toBeFalse();
        done();
      });
    });

    it('should return true if the transaction state is APPROVER_PENDING and there are more than one transactions in the report', (done) => {
      const mockMileageExpense: Expense = {
        ...mileageExpense,
        state: ExpenseState.APPROVER_PENDING,
        report_id: 'rphNNUiCISkD',
        custom_fields: null,
      };
      reportService.getTeamReport.and.returnValue(of(expectedReports.data[3]));
      approverExpensesService.getExpenseById.and.returnValue(of(mockMileageExpense));
      component.mileageExpense$ = of(mockMileageExpense);
      component.expenseFields$ = of(expenseFieldsMapResponse4);
      activateRouteMock.snapshot.params.view = ExpenseView.team;

      component.ionViewWillEnter();
      component.canDelete$.subscribe((res) => {
        expect(mockMileageExpense.state).toEqual(ExpenseState.APPROVER_PENDING);
        expect(res).toBeTrue();
        done();
      });
    });

    it('should not delete expense when view is individual', (done) => {
      const mockMileageExpense: Expense = {
        ...mileageExpense,
        state: ExpenseState.APPROVER_PENDING,
        report_id: 'rphNNUiCISkD',
        custom_fields: null,
      };
      reportService.getTeamReport.and.returnValue(of(expectedReports.data[3]));
      spenderExpensesService.getExpenseById.and.returnValue(of(mockMileageExpense));
      component.mileageExpense$ = of(mockMileageExpense);
      component.expenseFields$ = of(expenseFieldsMapResponse4);
      component.view = ExpenseView.individual;

      component.ionViewWillEnter();
      component.canDelete$.pipe(isEmpty()).subscribe((isEmpty) => {
        expect(isEmpty).toBeTrue();
        done();
      });
    });

    it('should get all the policy violations when it a team expense', (done) => {
      activateRouteMock.snapshot.params.id = 'tx5fBcPBAxLv';
      activateRouteMock.snapshot.params.view = ExpenseView.team;
      policyService.getApproverExpensePolicyViolations.and.returnValue(
        of(ApproverExpensePolicyStatesData.data[0].individual_desired_states)
      );
      component.ionViewWillEnter();
      component.policyViloations$.subscribe(() => {
        expect(policyService.getApproverExpensePolicyViolations).toHaveBeenCalledOnceWith(
          activateRouteMock.snapshot.params.id
        );
        done();
      });
    });

    it('should get all the policy violations when it an individual expense', (done) => {
      activateRouteMock.snapshot.params.id = 'tx5fBcPBAxLv';
      activateRouteMock.snapshot.params.view = ExpenseView.individual;
      policyService.getSpenderExpensePolicyViolations.and.returnValue(
        of(expensePolicyStatesData.data[0].individual_desired_states)
      );
      component.ionViewWillEnter();
      component.policyViloations$.subscribe(() => {
        expect(policyService.getSpenderExpensePolicyViolations).toHaveBeenCalledOnceWith(
          activateRouteMock.snapshot.params.id
        );
        done();
      });
    });

    it('policyViolations should emit null if no id is provided', (done) => {
      activateRouteMock.snapshot.params.id = null;
      component.ionViewWillEnter();
      component.policyViloations$.subscribe((data) => {
        expect(data).toBeNull();
        done();
      });
    });

    it('should get all the comments and set the appropriate view', (done) => {
      activateRouteMock.snapshot.params = {
        id: 'tx5fBcPBAxLv',
        view: ExpenseView.individual,
        txnIds: '["tx3qwe4ty","tx6sd7gh","txD3cvb6"]',
        activeIndex: '0',
      };
      component.ionViewWillEnter();
      component.comments$.subscribe(() => {
        expect(statusService.find).toHaveBeenCalledOnceWith('transactions', component.expenseId);
        done();
      });
      expect(component.view).toEqual(activateRouteMock.snapshot.params.view);
    });

    it('should be true if expense policy is violated', (done) => {
      spyOn(component, 'isNumber').and.returnValue(true);
      const mockMileageExpense: Expense = {
        ...mileageExpense,
        policy_amount: -1,
      };

      spenderExpensesService.getExpenseById.and.returnValue(of(mockMileageExpense));
      component.mileageExpense$ = of(mockMileageExpense);
      component.ionViewWillEnter();
      component.isCriticalPolicyViolated$.subscribe((res) => {
        expect(res).toBeTrue();
        expect(component.isNumber).toHaveBeenCalledOnceWith(-1);
        done();
      });
    });

    it('should return true if the policy amount value is of type number should check if the amount is capped', (done) => {
      const mockMileageExpense: Expense = {
        ...mileageExpense,
        policy_amount: 1000,
        admin_amount: null,
      };

      spyOn(component, 'isNumber').and.callThrough();

      spenderExpensesService.getExpenseById.and.returnValue(of(mockMileageExpense));
      component.mileageExpense$ = of(mockMileageExpense);
      component.ionViewWillEnter();
      component.isAmountCapped$.subscribe((res) => {
        expect(res).toBeTrue();
        expect(component.isNumber).toHaveBeenCalledTimes(2);
        expect(component.isNumber).toHaveBeenCalledWith(null);
        expect(component.isNumber).toHaveBeenCalledWith(1000);
        done();
      });
    });

    it('should return true if the admin amount value is of type number should check if the amount is capped', (done) => {
      const mockMileageExpense: Expense = {
        ...mileageExpense,
        admin_amount: 1000,
        policy_amount: null,
      };

      spyOn(component, 'isNumber').and.callThrough();

      spenderExpensesService.getExpenseById.and.returnValue(of(mockMileageExpense));
      component.mileageExpense$ = of(mockMileageExpense);
      component.ionViewWillEnter();
      component.isAmountCapped$.subscribe((res) => {
        expect(res).toBeTrue();
        expect(component.isNumber).toHaveBeenCalledOnceWith(1000);
        done();
      });
    });

    it('should return false if the value is not of type number and check if the expense is capped', (done) => {
      spyOn(component, 'isNumber').and.returnValue(false);
      const mockMileageExpense: Expense = {
        ...mileageExpense,
        admin_amount: null,
        policy_amount: null,
      };

      spenderExpensesService.getExpenseById.and.returnValue(of(mockMileageExpense));
      component.mileageExpense$ = of(mockMileageExpense);
      component.ionViewWillEnter();
      component.isAmountCapped$.subscribe((res) => {
        expect(res).toBeFalse();
        expect(component.isNumber).toHaveBeenCalledWith(null);
        expect(component.isNumber).toHaveBeenCalledTimes(2);
        done();
      });
    });

    it('should parse the transaction ids and active index accordingly', () => {
      spyOn(component.updateFlag$, 'next');
      activateRouteMock.snapshot.params = {
        id: 'tx3qwe4ty',
        view: ExpenseView.individual,
        txnIds: '["tx3qwe4ty","tx6sd7gh","txD3cvb6"]',
        activeIndex: '2',
      };
      component.ionViewWillEnter();
      expect(component.updateFlag$.next).toHaveBeenCalledOnceWith(null);
      expect(component.reportExpenseCount).toEqual(3);
      expect(component.activeExpenseIndex).toEqual(2);
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

  describe('viewAttachment', () => {
    it('should open modal with map attachment', fakeAsync(() => {
      const mapAttachment: FileObject = {
        id: '1',
        type: 'image',
        url: 'http://example.com/mileage-map.png',
        purpose: 'ORIGINAL',
      };

      component.mapAttachment$ = of(mapAttachment);
      loaderService.showLoader.and.resolveTo();
      const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present']);
      modalController.create.and.returnValue(modalSpy);
      component.viewAttachment();
      tick(500);
      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: FyViewAttachmentComponent,
        componentProps: {
          attachments: [mapAttachment],
          canEdit: false,
          isMileageExpense: true,
        },
      });

      expect(modalSpy.present).toHaveBeenCalledTimes(1);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    }));
  });
});
