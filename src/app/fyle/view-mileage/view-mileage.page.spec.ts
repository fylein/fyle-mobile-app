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
import { FyPopoverComponent } from 'src/app/shared/components/fy-popover/fy-popover.component';

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
  let activateRouteMock: ActivatedRoute;

  beforeEach(waitForAsync(() => {
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['hideLoader', 'showLoader']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', [
      'getEtxn',
      'manualUnflag',
      'manualFlag',
      'getExpenseV2',
    ]);
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

  xit('ionViewWillEnter', () => {});
});
