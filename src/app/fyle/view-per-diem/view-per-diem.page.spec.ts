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
import { of } from 'rxjs';
import {
  ApproverExpensePolicyStatesData,
  expensePolicyStatesData,
} from 'src/app/core/mock-data/platform-policy-expense.data';
import { individualExpPolicyStateData3 } from 'src/app/core/mock-data/individual-expense-policy-state.data';
import { expenseData1 } from 'src/app/core/mock-data/expense.data';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { properties } from 'src/app/core/mock-data/modal-properties.data';

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
  let activatedRoute: ActivatedRoute;

  beforeEach(waitForAsync(() => {
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', [
      'getEtxn',
      'getExpenseV2',
      'manualUnflag',
      'manualFlag',
    ]);
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
        of(ApproverExpensePolicyStatesData.data[0].individual_desired_states),
      );
      component.getPolicyDetails('txRNWeQRXhso');
      expect(policyService.getApproverExpensePolicyViolations).toHaveBeenCalledOnceWith('txRNWeQRXhso');
      expect(component.policyDetails).toEqual(ApproverExpensePolicyStatesData.data[0].individual_desired_states);
    });

    it('should get policy details for individual expenses', () => {
      component.view = ExpenseView.individual;
      policyService.getSpenderExpensePolicyViolations.and.returnValue(
        of(expensePolicyStatesData.data[0].individual_desired_states),
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
});
