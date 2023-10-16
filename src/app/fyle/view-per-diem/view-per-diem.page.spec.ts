import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, PopoverController } from '@ionic/angular';

import { ViewPerDiemPage } from './view-per-diem.page';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { PerDiemService } from 'src/app/core/services/per-diem.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { ReportService } from 'src/app/core/services/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StatusService } from 'src/app/core/services/status.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { finalize, of } from 'rxjs';
import {
  ApproverExpensePolicyStatesData,
  expensePolicyStatesData,
} from 'src/app/core/mock-data/platform-policy-expense.data';
import {
  individualExpPolicyStateData2,
  individualExpPolicyStateData3,
} from 'src/app/core/mock-data/individual-expense-policy-state.data';
import { expenseData1, expenseData2 } from 'src/app/core/mock-data/expense.data';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { properties } from 'src/app/core/mock-data/modal-properties.data';
import { expenseFieldsMapResponse4 } from 'src/app/core/mock-data/expense-fields-map.data';
import { customInputData1 } from 'src/app/core/mock-data/custom-input.data';
import { orgSettingsData } from 'src/app/core/test-data/accounts.service.spec.data';
import { customFieldData1, customFields } from 'src/app/core/mock-data/custom-field.data';
import { perDiemRatesData1 } from 'src/app/core/mock-data/per-diem-rates.data';
import { apiExtendedReportRes } from 'src/app/core/mock-data/report.data';
import { estatusData1 } from 'src/app/core/test-data/status.service.spec.data';
import { cloneDeep } from 'lodash';
import { AccountType } from 'src/app/core/enums/account-type.enum';
import { FyPopoverComponent } from 'src/app/shared/components/fy-popover/fy-popover.component';
import { txnStatusData } from 'src/app/core/mock-data/transaction-status.data';
import { PlatformExpenseService } from 'src/app/core/services/platform-expense.service';
import { platformExpense1 } from 'src/app/core/mock-data/platform-expense.data';
import { ExpenseState } from 'src/app/core/models/expense-state.enum';

describe('ViewPerDiemPage', () => {
  let component: ViewPerDiemPage;
  let fixture: ComponentFixture<ViewPerDiemPage>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let customInputsService: jasmine.SpyObj<CustomInputsService>;
  let perDiemService: jasmine.SpyObj<PerDiemService>;
  let policyService: jasmine.SpyObj<PolicyService>;
  let reportService: jasmine.SpyObj<ReportService>;
  let router: jasmine.SpyObj<Router>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let statusService: jasmine.SpyObj<StatusService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let dependentFieldsService: jasmine.SpyObj<DependentFieldsService>;
  let platformExpenseService: jasmine.SpyObj<PlatformExpenseService>;
  let activatedRoute: ActivatedRoute;

  beforeEach(waitForAsync(() => {
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['getEtxn', 'manualUnflag', 'manualFlag']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const customInputsServiceSpy = jasmine.createSpyObj('CustomInputsService', [
      'fillCustomProperties',
      'getCustomPropertyDisplayValue',
    ]);
    const perDiemServiceSpy = jasmine.createSpyObj('PerDiemService', ['getRate']);
    const policyServiceSpy = jasmine.createSpyObj('PolicyService', [
      'getApproverExpensePolicyViolations',
      'getSpenderExpensePolicyViolations',
    ]);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', ['getTeamReport', 'removeTransaction']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const statusServiceSpy = jasmine.createSpyObj('StatusService', ['find', 'post']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'addComment',
      'viewComment',
      'expenseRemovedByApprover',
      'expenseFlagUnflagClicked',
    ]);
    const expenseFieldsServiceSpy = jasmine.createSpyObj('ExpenseFieldsService', ['getAllMap']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const dependentFieldsServiceSpy = jasmine.createSpyObj('DependentFieldsService', [
      'getDependentFieldValuesForBaseField',
    ]);
    const platformExpenseServiceSpy = jasmine.createSpyObj('PlatformExpenseService', ['getExpense']);

    TestBed.configureTestingModule({
      declarations: [ViewPerDiemPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: CustomInputsService, useValue: customInputsServiceSpy },
        { provide: PerDiemService, useValue: perDiemServiceSpy },
        { provide: PolicyService, useValue: policyServiceSpy },
        { provide: ReportService, useValue: reportServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: PopoverController, useValue: popoverControllerSpy },
        { provide: StatusService, useValue: statusServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: ModalPropertiesService, useValue: modalPropertiesSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: ExpenseFieldsService, useValue: expenseFieldsServiceSpy },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpy },
        { provide: DependentFieldsService, useValue: dependentFieldsServiceSpy },
        { provide: PlatformExpenseService, useValue: platformExpenseServiceSpy },
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

    fixture = TestBed.createComponent(ViewPerDiemPage);
    component = fixture.componentInstance;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    customInputsService = TestBed.inject(CustomInputsService) as jasmine.SpyObj<CustomInputsService>;
    perDiemService = TestBed.inject(PerDiemService) as jasmine.SpyObj<PerDiemService>;
    policyService = TestBed.inject(PolicyService) as jasmine.SpyObj<PolicyService>;
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    statusService = TestBed.inject(StatusService) as jasmine.SpyObj<StatusService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    dependentFieldsService = TestBed.inject(DependentFieldsService) as jasmine.SpyObj<DependentFieldsService>;
    platformExpenseService = TestBed.inject(PlatformExpenseService) as jasmine.SpyObj<PlatformExpenseService>;
    activatedRoute = TestBed.inject(ActivatedRoute);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('get ExpenseView(): should return the expense view enum', () => {
    expect(component.ExpenseView).toEqual(ExpenseView);
  });

  describe('isNumber():', () => {
    it('should return true if the value is a number', () => {
      expect(component.isNumber(1)).toBeTrue();
    });

    it('should return false if the value is not a number', () => {
      expect(component.isNumber('1')).toBeFalse();
    });
  });

  describe('goBack():', () => {
    beforeEach(() => {
      component.view = ExpenseView.team;
      component.reportId = 'rpFE5X1Pqi9P';
    });

    it('should navigate to view team report page if current view is set to team', () => {
      component.goBack();
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'view_team_report',
        { id: 'rpFE5X1Pqi9P', navigate_back: true },
      ]);
    });

    it('should navigate to view report page if current view is not set to team', () => {
      component.view = ExpenseView.individual;
      component.goBack();
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'my_view_report',
        { id: 'rpFE5X1Pqi9P', navigate_back: true },
      ]);
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

  describe('openCommentsModal', () => {
    beforeEach(() => {
      component.view = ExpenseView.individual;
      transactionService.getEtxn.and.returnValue(of(expenseData1));
      modalProperties.getModalDefaultProperties.and.returnValue(properties);
    });

    it('on opening the comments modal it should add a comment if the data is updated', fakeAsync(() => {
      const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
      modalController.create.and.resolveTo(modalSpy);
      modalSpy.onDidDismiss.and.resolveTo({ data: { updated: true } });

      component.openCommentsModal();
      tick(500);
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: ViewCommentComponent,
        componentProps: {
          objectType: 'transactions',
          objectId: expenseData1.tx_id,
        },
        ...properties,
      });
      expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
      expect(transactionService.getEtxn).toHaveBeenCalledOnceWith('tx3qwe4ty');
      expect(modalSpy.present).toHaveBeenCalledTimes(1);
      expect(modalSpy.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(trackingService.addComment).toHaveBeenCalledOnceWith({ view: 'Individual' });
    }));

    it('on opening the comments modal it should show the comments if the data not updated', fakeAsync(() => {
      const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
      modalController.create.and.resolveTo(modalSpy);
      modalSpy.onDidDismiss.and.resolveTo({ data: { updated: true } });
      modalSpy.onDidDismiss.and.resolveTo({ data: { updated: false } });

      component.openCommentsModal();
      tick(500);
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: ViewCommentComponent,
        componentProps: {
          objectType: 'transactions',
          objectId: expenseData1.tx_id,
        },
        ...properties,
      });
      expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
      expect(transactionService.getEtxn).toHaveBeenCalledOnceWith('tx3qwe4ty');
      expect(modalSpy.present).toHaveBeenCalledTimes(1);
      expect(modalSpy.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(trackingService.viewComment).toHaveBeenCalledOnceWith({ view: 'Individual' });
    }));
  });

  describe('ionViewWillEnter():', () => {
    const mockCustomFields = cloneDeep(customFields);
    beforeEach(() => {
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();
      platformExpenseService.getExpense.and.returnValue(of(platformExpense1));
      expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse4));
      dependentFieldsService.getDependentFieldValuesForBaseField.and.returnValue(of(customInputData1));
      orgSettingsService.get.and.returnValue(of(orgSettingsData));
      customInputsService.fillCustomProperties.and.returnValue(of(mockCustomFields));
      customInputsService.getCustomPropertyDisplayValue.and.returnValue('customPropertyDisplayValue');
      perDiemService.getRate.and.returnValue(of(perDiemRatesData1));
      reportService.getTeamReport.and.returnValue(of(apiExtendedReportRes[0]));
      policyService.getApproverExpensePolicyViolations.and.returnValue(of(individualExpPolicyStateData2));
      policyService.getSpenderExpensePolicyViolations.and.returnValue(of(individualExpPolicyStateData3));
      statusService.find.and.returnValue(of(estatusData1));
      spyOn(component, 'getPolicyDetails');
    });

    it('should set extendedPerDiem$ and txnFields$ correctly', (done) => {
      component.ionViewWillEnter();
      component.perDiemExpense$
        .pipe(
          finalize(() => {
            expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
          })
        )
        .subscribe((extendedPerDiem) => {
          expect(platformExpenseService.getExpense).toHaveBeenCalledOnceWith('tx3qwe4ty');
          expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
          expect(extendedPerDiem).toEqual(platformExpense1);
        });

      component.txnFields$.subscribe((txnFields) => {
        expect(expenseFieldsService.getAllMap).toHaveBeenCalledTimes(1);
        expect(txnFields).toEqual(expenseFieldsMapResponse4);
        done();
      });
    });

    it('should set projectDependentCustomProperties$ and costCenterDependentCustomProperties$ correctly', (done) => {
      component.ionViewWillEnter();

      component.projectDependentCustomProperties$.subscribe((projectDependentCustomProperties) => {
        expect(dependentFieldsService.getDependentFieldValuesForBaseField).toHaveBeenCalledTimes(1);
        expect(projectDependentCustomProperties).toEqual(customInputData1);
      });

      component.costCenterDependentCustomProperties$.subscribe((costCenterDependentCustomProperties) => {
        expect(dependentFieldsService.getDependentFieldValuesForBaseField).toHaveBeenCalledTimes(2);
        expect(costCenterDependentCustomProperties).toEqual(customInputData1);
        done();
      });
    });

    it('should set paymentMode and paymentMode icon correctly if account type is ADVANCE', fakeAsync(() => {
      const mockExpense = cloneDeep(platformExpense1);
      mockExpense.source_account.type = AccountType.ADVANCE;

      platformExpenseService.getExpense.and.returnValue(of(mockExpense));
      component.ionViewWillEnter();
      tick(100);
      expect(component.paymentMode).toEqual('Paid from Advance');
      expect(component.paymentModeIcon).toEqual('fy-non-reimbursable');
    }));

    it('should set paymentMode and paymentMode icon correctly if tx_skip_reimbursement is true', fakeAsync(() => {
      const mockExpense = cloneDeep(platformExpense1);
      mockExpense.is_reimbursable = false;

      platformExpenseService.getExpense.and.returnValue(of(mockExpense));
      component.ionViewWillEnter();
      tick(100);
      expect(component.paymentMode).toEqual('Paid by Company');
      expect(component.paymentModeIcon).toEqual('fy-non-reimbursable');
    }));

    it('should set paymentMode and paymentMode icon correctly if no condition matches', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(100);
      expect(component.paymentMode).toEqual('Paid by Employee');
      expect(component.paymentModeIcon).toEqual('fy-reimbursable');
    }));

    it('should set projectFieldName and isProjectShown correctly', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(100);
      expect(component.projectFieldName).toEqual('Project ID');
      expect(component.isProjectShown).toBeTrue();
    }));

    it('should set isProjectShown to false if project name and is empty string and project is not mandatory', fakeAsync(() => {
      const mockExpense = cloneDeep(platformExpense1);
      mockExpense.project.name = '';

      platformExpenseService.getExpense.and.returnValue(of(mockExpense));
      const mockExpenseField = cloneDeep(expenseFieldsMapResponse4);
      mockExpenseField.project_id[0].is_mandatory = false;
      expenseFieldsService.getAllMap.and.returnValue(of(mockExpenseField));
      component.ionViewWillEnter();
      tick(100);
      expect(component.isProjectShown).toBeFalse();
    }));

    it('should set orgSettings and isNewReportsFlowEnabled', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(100);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      expect(component.orgSettings).toEqual(orgSettingsData);
      expect(component.isNewReportsFlowEnabled).toBeFalse();
    }));

    it('should set perDiemCustomFields$ and perDiemRate$', (done) => {
      const mockExpense = cloneDeep(platformExpense1);
      mockExpense.per_diem_rate_id = 508;

      platformExpenseService.getExpense.and.returnValue(of(mockExpense));
      component.ionViewWillEnter();

      component.perDiemCustomFields$.subscribe((perDiemCustomFields) => {
        expect(customInputsService.fillCustomProperties).toHaveBeenCalledOnceWith(
          platformExpense1.category_id,
          platformExpense1.custom_fields,
          true
        );
        // Called twice because of the two custom fields
        expect(customInputsService.getCustomPropertyDisplayValue).toHaveBeenCalledTimes(2);
        expect(customInputsService.getCustomPropertyDisplayValue).toHaveBeenCalledWith(mockCustomFields[0]);
        expect(customInputsService.getCustomPropertyDisplayValue).toHaveBeenCalledWith(mockCustomFields[1]);
        expect(perDiemCustomFields).toEqual(mockCustomFields);
      });

      component.perDiemRate$.subscribe((perDiemRate) => {
        expect(perDiemService.getRate).toHaveBeenCalledOnceWith(508);
        expect(perDiemRate).toEqual(perDiemRatesData1);
        done();
      });
    });

    it('should set view and canFlagOrUnflag$ to true if expense state is APPROVER_PENDING', (done) => {
      activatedRoute.snapshot.params.view = ExpenseView.team;

      platformExpenseService.getExpense.and.returnValue(of(platformExpense1));
      component.ionViewWillEnter();
      expect(component.view).toEqual(ExpenseView.team);
      component.canFlagOrUnflag$.subscribe((canFlagOrUnflag) => {
        expect(canFlagOrUnflag).toBeTrue();
        done();
      });
    });

    it('should set canFlagOrUnflag$ to false if state is PAID', (done) => {
      activatedRoute.snapshot.params.view = ExpenseView.team;
      const mockExpense = cloneDeep(platformExpense1);
      mockExpense.state = ExpenseState.PAID;

      platformExpenseService.getExpense.and.returnValue(of(mockExpense));
      component.ionViewWillEnter();
      component.canFlagOrUnflag$.subscribe((canFlagOrUnflag) => {
        expect(canFlagOrUnflag).toBeFalse();
        done();
      });
    });

    it('should set canDelete$ to false if report transaction equals 1', (done) => {
      activatedRoute.snapshot.params.view = ExpenseView.team;

      platformExpenseService.getExpense.and.returnValue(of(platformExpense1));
      component.ionViewWillEnter();
      component.canDelete$.subscribe((canDelete) => {
        expect(reportService.getTeamReport).toHaveBeenCalledOnceWith('rpFvmTgyeBjN');
        expect(canDelete).toBeFalse();
        done();
      });
    });

    it('should set canDelete$ to true if expense state is APPROVER_PENDING', (done) => {
      activatedRoute.snapshot.params.view = ExpenseView.team;

      const mockExpense = cloneDeep(platformExpense1);
      mockExpense.state = ExpenseState.APPROVER_PENDING;
      const mockReport = cloneDeep(apiExtendedReportRes[0]);
      mockReport.rp_num_transactions = 2;

      reportService.getTeamReport.and.returnValue(of(mockReport));
      platformExpenseService.getExpense.and.returnValue(of(mockExpense));

      component.ionViewWillEnter();
      component.canDelete$.subscribe((canDelete) => {
        expect(reportService.getTeamReport).toHaveBeenCalledOnceWith('rpFvmTgyeBjN');
        expect(canDelete).toBeTrue();
        done();
      });
    });

    it('should set policyViolations$ to approver policy state if view is set to team and id exists', (done) => {
      activatedRoute.snapshot.params.view = ExpenseView.team;
      component.ionViewWillEnter();
      component.policyViolations$.subscribe((policyViolations) => {
        expect(policyService.getApproverExpensePolicyViolations).toHaveBeenCalledOnceWith('tx3qwe4ty');
        expect(policyService.getSpenderExpensePolicyViolations).not.toHaveBeenCalled();
        expect(policyViolations).toEqual(individualExpPolicyStateData2);
        done();
      });
    });

    it('should set policyViolations$ to spender policy state if view is set to individual and id exists', (done) => {
      activatedRoute.snapshot.params.view = ExpenseView.individual;
      component.ionViewWillEnter();
      component.policyViolations$.subscribe((policyViolations) => {
        expect(policyService.getSpenderExpensePolicyViolations).toHaveBeenCalledOnceWith('tx3qwe4ty');
        expect(policyService.getApproverExpensePolicyViolations).not.toHaveBeenCalled();
        expect(policyViolations).toEqual(individualExpPolicyStateData3);
        done();
      });
    });

    it('should set policyViolations$ to null if id does not exist', (done) => {
      activatedRoute.snapshot.params.id = undefined;
      component.ionViewWillEnter();
      component.policyViolations$.subscribe((policyViolations) => {
        expect(policyService.getApproverExpensePolicyViolations).not.toHaveBeenCalled();
        expect(policyService.getSpenderExpensePolicyViolations).not.toHaveBeenCalled();
        expect(policyViolations).toBeNull();
        done();
      });
    });

    it('should set comments$ and call getPolicyDetails once', (done) => {
      component.ionViewWillEnter();
      expect(component.getPolicyDetails).toHaveBeenCalledOnceWith('tx3qwe4ty');
      component.comments$.subscribe((comments) => {
        expect(statusService.find).toHaveBeenCalledOnceWith('transactions', 'tx3qwe4ty');
        expect(comments).toEqual(estatusData1);
        done();
      });
    });

    it('should set isCriticalPolicyViolated$ to true if policy amount is number and less than 0.0001', (done) => {
      spyOn(component, 'isNumber').and.returnValue(true);
      const mockExpense = cloneDeep(platformExpense1);
      mockExpense.policy_amount = 0;

      platformExpenseService.getExpense.and.returnValue(of(mockExpense));
      component.ionViewWillEnter();

      component.isCriticalPolicyViolated$.subscribe((isCriticalPolicyViolated) => {
        expect(component.isNumber).toHaveBeenCalledOnceWith(0);
        expect(isCriticalPolicyViolated).toBeTrue();
        done();
      });
    });

    it('should set isCriticalPolicyViolated$ to false if policy amount is not a number', (done) => {
      spyOn(component, 'isNumber').and.returnValue(false);
      const mockExpense = cloneDeep(platformExpense1);
      mockExpense.policy_amount = null;

      platformExpenseService.getExpense.and.returnValue(of(mockExpense));
      component.ionViewWillEnter();

      component.isCriticalPolicyViolated$.subscribe((isCriticalPolicyViolated) => {
        expect(component.isNumber).toHaveBeenCalledOnceWith(null);
        expect(isCriticalPolicyViolated).toBeFalse();
        done();
      });
    });

    it('should set isAmountCapped$ to true if admin amount is number', (done) => {
      spyOn(component, 'isNumber').and.returnValue(true);
      const mockExpense = cloneDeep(platformExpense1);
      mockExpense.admin_amount = 0;

      platformExpenseService.getExpense.and.returnValue(of(mockExpense));
      component.ionViewWillEnter();

      component.isAmountCapped$.subscribe((isAmountCapped) => {
        expect(component.isNumber).toHaveBeenCalledOnceWith(0);
        expect(isAmountCapped).toBeTrue();
        done();
      });
    });

    it('should set isAmountCapped$ to true if policy amount is number', (done) => {
      spyOn(component, 'isNumber').and.returnValues(false, true);
      const mockExpense = cloneDeep(platformExpense1);
      mockExpense.admin_amount = null;
      mockExpense.policy_amount = 0;

      platformExpenseService.getExpense.and.returnValue(of(mockExpense));
      component.ionViewWillEnter();

      component.isAmountCapped$.subscribe((isAmountCapped) => {
        expect(component.isNumber).toHaveBeenCalledTimes(2);
        expect(component.isNumber).toHaveBeenCalledWith(null);
        expect(component.isNumber).toHaveBeenCalledWith(0);
        expect(isAmountCapped).toBeTrue();
        done();
      });
    });

    it('should set isAmountCapped$ to false if policy amount and admin amount are not a number', (done) => {
      spyOn(component, 'isNumber').and.returnValues(false, false);
      const mockExpense = cloneDeep(platformExpense1);
      mockExpense.admin_amount = null;
      mockExpense.policy_amount = null;

      platformExpenseService.getExpense.and.returnValue(of(mockExpense));
      component.ionViewWillEnter();

      component.isAmountCapped$.subscribe((isAmountCapped) => {
        expect(component.isNumber).toHaveBeenCalledTimes(2);
        expect(component.isNumber).toHaveBeenCalledWith(null);
        expect(component.isNumber).toHaveBeenCalledWith(null);
        expect(isAmountCapped).toBeFalse();
        done();
      });
    });

    it('should set isExpenseFlagged to expense manual flag and updateFlag$ to null', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(100);

      expect(component.isExpenseFlagged).toBeFalse();
      component.updateFlag$.subscribe((updateFlag) => {
        expect(updateFlag).toBeNull();
      });
    }));

    it('should set numEtxnsInReport and activeEtxnIndex', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(100);

      expect(component.numEtxnsInReport).toEqual(3);
      expect(component.activeEtxnIndex).toEqual(0);
    }));
  });

  it('getDeleteDialogProps(): should return modal params', () => {
    const props = component.getDeleteDialogProps(expenseData1);
    props.componentProps.deleteMethod();
    expect(reportService.removeTransaction).toHaveBeenCalledOnceWith(expenseData1.tx_report_id, expenseData1.tx_id);
  });

  it('removeExpenseFromReport(): should remove the expense from report', fakeAsync(() => {
    transactionService.getEtxn.and.returnValue(of(expenseData1));

    spyOn(component, 'getDeleteDialogProps');
    const deletePopoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onDidDismiss']);
    popoverController.create.and.returnValue(deletePopoverSpy);
    deletePopoverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });

    component.removeExpenseFromReport();
    tick(100);
    expect(transactionService.getEtxn).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);
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

  describe('flagUnflagExpense', () => {
    it('should flag unflagged expense', fakeAsync(() => {
      transactionService.getEtxn.and.returnValue(of(expenseData1));
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();

      const title = 'Flag';
      const flagPopoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
      popoverController.create.and.returnValue(flagPopoverSpy);
      const data = { comment: 'This is a comment for flagging' };
      flagPopoverSpy.onWillDismiss.and.resolveTo({ data });
      statusService.post.and.returnValue(of(txnStatusData));
      transactionService.manualFlag.and.returnValue(of(expenseData2));

      component.flagUnflagExpense();
      tick(100);
      expect(transactionService.getEtxn).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);

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
      expect(transactionService.manualUnflag).not.toHaveBeenCalled();
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(trackingService.expenseFlagUnflagClicked).toHaveBeenCalledOnceWith({ action: title });
      expect(component.isExpenseFlagged).toBeFalse();
    }));

    it('should unflag flagged expense', fakeAsync(() => {
      const mockExpenseData = {
        ...expenseData1,
        tx_manual_flag: true,
      };
      transactionService.getEtxn.and.returnValue(of(mockExpenseData));
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();
      component.isExpenseFlagged = true;

      const title = 'Unflag';
      const flagPopoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
      popoverController.create.and.returnValue(flagPopoverSpy);
      const data = { comment: 'This is a comment for flagging' };
      flagPopoverSpy.onWillDismiss.and.resolveTo({ data });
      statusService.post.and.returnValue(of(txnStatusData));
      transactionService.manualUnflag.and.returnValue(of(expenseData1));

      component.flagUnflagExpense();
      tick(100);
      expect(transactionService.getEtxn).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);

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
      expect(transactionService.manualFlag).not.toHaveBeenCalled();
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(trackingService.expenseFlagUnflagClicked).toHaveBeenCalledOnceWith({ action: title });
      expect(component.isExpenseFlagged).toBeTrue();
    }));
  });

  describe('getDisplayValue():', () => {
    it('should get the correct display value', () => {
      const expectedProperty = 'record1, record2';
      customInputsService.getCustomPropertyDisplayValue.and.returnValue(expectedProperty);
      const result = component.getDisplayValue(customFieldData1[0]);
      expect(customInputsService.getCustomPropertyDisplayValue).toHaveBeenCalledOnceWith(customFieldData1[0]);
      expect(result).toEqual(expectedProperty);
    });

    it('should display Not Added if no value is added', () => {
      const expectedProperty = '-';
      customInputsService.getCustomPropertyDisplayValue.and.returnValue(expectedProperty);
      const result = component.getDisplayValue(customFieldData1[0]);
      expect(customInputsService.getCustomPropertyDisplayValue).toHaveBeenCalledOnceWith(customFieldData1[0]);
      expect(result).toEqual('Not Added');
    });
  });
});
