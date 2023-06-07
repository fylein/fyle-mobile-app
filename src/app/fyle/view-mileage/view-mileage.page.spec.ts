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
import { etxncData, expenseData1, expenseData2 } from 'src/app/core/mock-data/expense.data';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { individualExpPolicyStateData3 } from 'src/app/core/mock-data/individual-expense-policy-state.data';
import {
  ApproverExpensePolicyStatesData,
  expensePolicyStatesData,
} from 'src/app/core/mock-data/platform-policy-expense.data';
import { dependentFieldValues } from 'src/app/core/test-data/dependent-fields.service.spec.data';
import { FyPopoverComponent } from 'src/app/shared/components/fy-popover/fy-popover.component';
import { expenseFieldsMapResponse, expenseFieldsMapResponse4 } from 'src/app/core/mock-data/expense-fields-map.data';
import { orgSettingsGetData } from 'src/app/core/test-data/org-settings.service.spec.data';
import { filledCustomProperties } from 'src/app/core/test-data/custom-inputs.spec.data';
import { getEstatusApiResponse } from 'src/app/core/test-data/status.service.spec.data';
import { apiTeamRptSingleRes, expectedReports } from 'src/app/core/mock-data/api-reports.data';
import { cloneDeep, slice } from 'lodash';
import { isEmpty } from 'rxjs/operators';

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

  describe('ionViewWillEnter', () => {
    beforeEach(() => {
      component.reportId = 'rpFvmTgyeBjN';
      spyOn(component, 'setupNetworkWatcher');
      spyOn(component, 'getPolicyDetails');

      activateRouteMock.snapshot.params = {
        id: 'tx5fBcPBAxLv',
        view: ExpenseView.individual,
        txnIds: '["tx3qwe4ty","tx6sd7gh","txD3cvb6"]',
        activeIndex: '0',
      };

      component.extendedMileage$ = of(etxncData.data[0]);
      component.view = activateRouteMock.snapshot.params.view;
      loaderService.showLoader.and.resolveTo();
      transactionService.getExpenseV2.and.returnValue(of(etxncData.data[0]));
      loaderService.hideLoader.and.resolveTo();

      expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse4));
      component.txnFields$ = of(expenseFieldsMapResponse4);

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

      component.extendedMileage$.subscribe((data) => {
        expect(data).toEqual(etxncData.data[0]);
        expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
        expect(transactionService.getExpenseV2).toHaveBeenCalledOnceWith(activateRouteMock.snapshot.params.id);
        expect(component.updateFlag$.next).toHaveBeenCalledOnceWith(null);
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      });

      component.txnFields$.subscribe((data) => {
        expect(data).toEqual(expenseFieldsMapResponse4);
        expect(expenseFieldsService.getAllMap).toHaveBeenCalledTimes(1);
      });
    }));

    it('should get the project dependent custom properties', (done) => {
      const customProps = etxncData.data[0].tx_custom_properties;
      const projectIdNumber = expenseFieldsMapResponse4.project_id[0].id;

      component.txnFields$ = of(expenseFieldsMapResponse4);
      component.ionViewWillEnter();
      component.projectDependentCustomProperties$.subscribe((data) => {
        expect(data).toEqual(dependentFieldValues);
        expect(etxncData.data[0].tx_custom_properties).toBeDefined();
        expect(expenseFieldsMapResponse4.project_id.length).toBeGreaterThan(0);
        expect(dependentFieldsService.getDependentFieldValuesForBaseField).toHaveBeenCalledOnceWith(
          customProps,
          projectIdNumber
        );
        done();
      });
    });

    it('should get the cost center dependent custom properties', (done) => {
      const customProps = etxncData.data[0].tx_custom_properties;
      const costCenterIdNumber = expenseFieldsMapResponse4.cost_center_id[0].id;
      component.ionViewWillEnter();
      component.costCenterDependentCustomProperties$.subscribe((data) => {
        expect(data).toEqual(dependentFieldValues);
        expect(etxncData.data[0].tx_custom_properties).toBeDefined();
        expect(expenseFieldsMapResponse4.cost_center_id.length).toBeGreaterThan(0);
        expect(dependentFieldsService.getDependentFieldValuesForBaseField).toHaveBeenCalledOnceWith(
          customProps,
          costCenterIdNumber
        );
        done();
      });
    });

    it('should set the correct report id and set proper payment mode and icon', (done) => {
      const mockExtMileageData = {
        ...etxncData.data[0],
        source_account_type: 'PERSONAL_ADVANCE_ACCOUNT',
      };

      transactionService.getExpenseV2.and.returnValue(of(mockExtMileageData));

      component.ionViewWillEnter();
      component.extendedMileage$.subscribe((data) => {
        expect(data).toEqual(mockExtMileageData);
        expect(component.reportId).toEqual(mockExtMileageData.tx_report_id);
        expect(component.paymentMode).toEqual('Paid from Advance');
        expect(component.paymentModeIcon).toEqual('fy-non-reimbursable');
        done();
      });
    });

    it('should set the correct payment mode and icon when reimbursement is skipped', (done) => {
      const mockExtMileageData = {
        ...etxncData.data[0],
        tx_skip_reimbursement: true,
      };

      transactionService.getExpenseV2.and.returnValue(of(mockExtMileageData));

      component.ionViewWillEnter();
      component.extendedMileage$.subscribe((data) => {
        expect(data).toEqual(mockExtMileageData);
        expect(component.reportId).toEqual(mockExtMileageData.tx_report_id);
        expect(component.paymentMode).toEqual('Paid by Company');
        expect(component.paymentModeIcon).toEqual('fy-non-reimbursable');
        done();
      });
    });

    it('should set the correct payment mode and icon when the expense is reimbursement', (done) => {
      component.ionViewWillEnter();
      component.extendedMileage$.subscribe((data) => {
        expect(data).toEqual(etxncData.data[0]);
        expect(component.paymentMode).toEqual('Paid by Employee');
        expect(component.paymentModeIcon).toEqual('fy-reimbursable');
        done();
      });
    });

    it('should set the vehicle type to car if the mileage_vehicle type has the word four in it', (done) => {
      const mockExtMileageData = {
        ...etxncData.data[0],
        tx_mileage_vehicle_type: 'Four Wheeler - Type 1 (₹11.00/km)',
      };
      component.extendedMileage$ = of(mockExtMileageData);
      transactionService.getExpenseV2.and.returnValue(of(mockExtMileageData));
      component.ionViewWillEnter();
      component.extendedMileage$.subscribe((data) => {
        expect(data).toEqual(mockExtMileageData);
        expect(component.vehicleType).toEqual('car');
        done();
      });
    });

    it('should set the vehicle type to car if the mileage_vehicle type has the word car in it', (done) => {
      const mockExtMileageData = {
        ...etxncData.data[0],
        tx_mileage_vehicle_type: 'Electric Car',
      };
      component.extendedMileage$ = of(mockExtMileageData);
      transactionService.getExpenseV2.and.returnValue(of(mockExtMileageData));
      component.ionViewWillEnter();
      component.extendedMileage$.subscribe((data) => {
        expect(data).toEqual(mockExtMileageData);
        expect(component.vehicleType).toEqual('car');
        done();
      });
    });

    it('should set the vehicle type to bike if the mileage_vehicle type has neither of htese words - car or four', (done) => {
      const mockExtMileageData = {
        ...etxncData.data[0],
        tx_mileage_vehicle_type: 'Two Wheeler - Type 1 (₹11.00/km)',
      };
      component.extendedMileage$ = of(mockExtMileageData);
      transactionService.getExpenseV2.and.returnValue(of(mockExtMileageData));
      component.ionViewWillEnter();
      component.extendedMileage$.subscribe((data) => {
        expect(data).toEqual(mockExtMileageData);
        expect(component.vehicleType).toEqual('bike');
        done();
      });
    });

    it('should get the correct currency symbol', (done) => {
      component.ionViewWillEnter();
      component.extendedMileage$.subscribe((data) => {
        expect(data.tx_currency).toEqual('USD');
        expect(component.etxnCurrencySymbol).toEqual('$');
        done();
      });
    });

    it('should get the project details', fakeAsync(() => {
      const mockExpFieldData = {
        ...expenseFieldsMapResponse,
        project_id: [],
      };

      transactionService.getExpenseV2.and.returnValue(of(etxncData.data[0]));
      component.extendedMileage$ = of(etxncData.data[0]);
      expenseFieldsService.getAllMap.and.returnValue(of(mockExpFieldData));
      component.txnFields$ = of(mockExpFieldData);
      orgSettingsService.get.and.returnValue(of(orgSettingsGetData));

      component.ionViewWillEnter();
      tick(500);
      expect(component.projectFieldName).toBeUndefined();
      expect(component.isProjectShown).toBeTruthy();
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
    }));

    it('should get the project details when project name is not present', fakeAsync(() => {
      const mockExtMileageData = {
        ...etxncData.data[0],
        tx_project_name: null,
      };
      transactionService.getExpenseV2.and.returnValue(of(mockExtMileageData));
      component.extendedMileage$ = of(mockExtMileageData);

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
      transactionService.getExpenseV2.and.returnValue(of(etxncData.data[0]));
      component.extendedMileage$ = of(etxncData.data[0]);
      expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse));
      component.txnFields$ = of(expenseFieldsMapResponse);
      orgSettingsService.get.and.returnValue(of(mockOrgSettData));
      component.ionViewWillEnter();
      tick(500);
      expect(component.isProjectShown).toBeFalsy();
    }));

    it('should get the project field name and the value of project field name should be truthy', fakeAsync(() => {
      transactionService.getExpenseV2.and.returnValue(of(etxncData.data[0]));
      component.extendedMileage$ = of(etxncData.data[0]);
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
      component.txnFields$ = of(mockExpFieldData);
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

    it('should get the custom mileage fileds', (done) => {
      const mockfilledCustomProperties = cloneDeep(slice(filledCustomProperties, 0, 1));
      customInputsService.fillCustomProperties.and.returnValue(of(mockfilledCustomProperties));
      customInputsService.getCustomPropertyDisplayValue.and.returnValue(mockfilledCustomProperties[0].displayValue);
      component.ionViewWillEnter();
      component.mileageCustomFields$.subscribe((data) => {
        expect(data).toEqual(mockfilledCustomProperties);
        expect(customInputsService.fillCustomProperties).toHaveBeenCalledOnceWith(
          etxncData.data[0].tx_org_category_id,
          etxncData.data[0].tx_custom_properties,
          true
        );
        expect(customInputsService.getCustomPropertyDisplayValue).toHaveBeenCalledTimes(
          mockfilledCustomProperties.length
        );
        done();
      });
    });

    it('should get the flag status when the expense can be flagged', (done) => {
      activateRouteMock.snapshot.params.view = ExpenseView.team;
      component.extendedMileage$ = of(etxncData.data[0]);
      component.ionViewWillEnter();
      component.canFlagOrUnflag$.subscribe((res) => {
        expect(etxncData.data[0].tx_state).toEqual('APPROVER_PENDING');
        expect(res).toBeTrue();
        done();
      });
    });

    it('expense cannot be flagged when the view is set to indivivual', (done) => {
      activateRouteMock.snapshot.params.view = ExpenseView.individual;
      const mockExtMileageData = {
        ...etxncData.data[0],
        tx_state: 'PAID',
      };
      component.extendedMileage$ = of(mockExtMileageData);
      component.ionViewWillEnter();
      component.canFlagOrUnflag$.pipe(isEmpty()).subscribe((isEmpty) => {
        expect(isEmpty).toBeTrue();
        done();
      });
    });

    it('should return false if there is only one transaction in the report and the state is PAID', (done) => {
      const mockExtMileageData = {
        ...etxncData.data[0],
        tx_state: 'PAID',
        tx_report_id: 'rphNNUiCISkD',
        tx_custom_properties: null,
      };
      reportService.getTeamReport.and.returnValue(of(apiTeamRptSingleRes.data[0]));
      transactionService.getExpenseV2.and.returnValue(of(mockExtMileageData));
      component.extendedMileage$ = of(mockExtMileageData);
      component.txnFields$ = of(expenseFieldsMapResponse4);
      activateRouteMock.snapshot.params.view = ExpenseView.team;

      component.ionViewWillEnter();
      component.canDelete$.subscribe((res) => {
        expect(mockExtMileageData.tx_state).toEqual('PAID');
        expect(res).toBeFalse();
        done();
      });
    });

    it('should return true if the transaction state is APPROVER_PENDING and there are more than one transactions in the report', (done) => {
      const mockExtMileageData = {
        ...etxncData.data[0],
        tx_state: 'APPROVER_PENDING',
        tx_report_id: 'rphNNUiCISkD',
        tx_custom_properties: null,
      };
      reportService.getTeamReport.and.returnValue(of(expectedReports.data[3]));
      transactionService.getExpenseV2.and.returnValue(of(mockExtMileageData));
      component.extendedMileage$ = of(mockExtMileageData);
      component.txnFields$ = of(expenseFieldsMapResponse4);
      activateRouteMock.snapshot.params.view = ExpenseView.team;

      component.ionViewWillEnter();
      component.canDelete$.subscribe((res) => {
        expect(mockExtMileageData.tx_state).toEqual('APPROVER_PENDING');
        expect(res).toBeTrue();
        done();
      });
    });

    it('should not delete expense when view is individual', (done) => {
      const mockExtMileageData = {
        ...etxncData.data[0],
        tx_state: 'APPROVER_PENDING',
        tx_report_id: 'rphNNUiCISkD',
        tx_custom_properties: null,
      };
      reportService.getTeamReport.and.returnValue(of(expectedReports.data[3]));
      transactionService.getExpenseV2.and.returnValue(of(mockExtMileageData));
      component.extendedMileage$ = of(mockExtMileageData);
      component.txnFields$ = of(expenseFieldsMapResponse4);
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
        expect(statusService.find).toHaveBeenCalledOnceWith('transactions', expenseData1.tx_id);
        done();
      });
      expect(component.view).toEqual(activateRouteMock.snapshot.params.view);
    });

    it('should be true if expense policy is violated', (done) => {
      spyOn(component, 'isNumber').and.returnValue(true);
      const mockExtMileageData = {
        ...etxncData.data[0],
        tx_policy_amount: -1,
      };

      transactionService.getExpenseV2.and.returnValue(of(mockExtMileageData));
      component.extendedMileage$ = of(mockExtMileageData);
      component.ionViewWillEnter();
      component.isCriticalPolicyViolated$.subscribe((res) => {
        expect(res).toBeTrue();
        expect(component.isNumber).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should return true if the policy amount value is of type number should check if the amount is capped', (done) => {
      spyOn(component, 'isNumber').and.returnValue(true);
      const mockExtMileageData = {
        ...etxncData.data[0],
        tx_policy_amount: 1000,
        tx_admin_amount: null,
      };

      transactionService.getExpenseV2.and.returnValue(of(mockExtMileageData));
      component.extendedMileage$ = of(mockExtMileageData);
      component.ionViewWillEnter();
      component.isAmountCapped$.subscribe((res) => {
        expect(res).toBeTrue();
        expect(component.isNumber).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should return true if the admin amount value is of type number should check if the amount is capped', (done) => {
      spyOn(component, 'isNumber').and.returnValue(true);
      const mockExtMileageData = {
        ...etxncData.data[0],
        tx_admin_amount: 1000,
        tx_policy_amount: null,
      };

      transactionService.getEtxn.and.returnValue(of(mockExtMileageData));
      component.extendedMileage$ = of(mockExtMileageData);
      component.ionViewWillEnter();
      component.isAmountCapped$.subscribe((res) => {
        expect(res).toBeTrue();
        expect(component.isNumber).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should return false if the value is not of type number and check if the expense is capped', (done) => {
      spyOn(component, 'isNumber').and.returnValue(false);
      const mockExtMileageData = {
        ...etxncData.data[0],
        tx_admin_amount: null,
        tx_policy_amount: null,
      };

      transactionService.getEtxn.and.returnValue(of(mockExtMileageData));
      component.extendedMileage$ = of(mockExtMileageData);
      component.ionViewWillEnter();
      component.isAmountCapped$.subscribe((res) => {
        expect(res).toBeFalse();
        expect(component.isNumber).toHaveBeenCalledWith(mockExtMileageData.tx_policy_amount);
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
      expect(component.numEtxnsInReport).toEqual(3);
      expect(component.activeEtxnIndex).toEqual(2);
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
});
