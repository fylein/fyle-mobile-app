import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, UrlSerializer } from '@angular/router';
import { IonicModule, ModalController, NavController, PopoverController, SegmentCustomEvent } from '@ionic/angular';
import { cloneDeep } from 'lodash';
import { Subscription, of } from 'rxjs';
import { click, getElementBySelector } from 'src/app/core/dom-helpers';
import { ReportPageSegment } from 'src/app/core/enums/report-page-segment.enum';
import { approversData1 } from 'src/app/core/mock-data/approver.data';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { fyModalProperties, shareReportModalProperties } from 'src/app/core/mock-data/model-properties.data';
import { apiReportActions } from 'src/app/core/mock-data/report-actions.data';
import { expectedAllReports, newReportParam } from 'src/app/core/mock-data/report.data';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { RefinerService } from 'src/app/core/services/refiner.service';
import { ReportService } from 'src/app/core/services/report.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { StatusService } from 'src/app/core/services/status.service';
import { orgSettingsData } from 'src/app/core/test-data/accounts.service.spec.data';
import {
  expectedNewStatusData,
  newEstatusData1,
  systemComments1,
  systemCommentsWithSt,
} from 'src/app/core/test-data/status.service.spec.data';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { EllipsisPipe } from 'src/app/shared/pipes/ellipses.pipe';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { ReportState } from 'src/app/shared/pipes/report-state.pipe';
import { SnakeCaseToSpaceCase } from 'src/app/shared/pipes/snake-case-to-space-case.pipe';
import { NetworkService } from '../../core/services/network.service';
import { TrackingService } from '../../core/services/tracking.service';
import { txnStatusData } from 'src/app/core/mock-data/transaction-status.data';
import { platformReportData } from 'src/app/core/mock-data/platform-report.data';
import {
  expenseData,
  expenseResponseData2,
  mileageExpense,
  perDiemExpense,
} from 'src/app/core/mock-data/platform/v1/expense.data';
import { ExpenseState } from 'src/app/core/models/expense-state.enum';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { FyViewReportInfoComponent } from 'src/app/shared/components/fy-view-report-info/fy-view-report-info.component';
import { MyViewReportPage } from './my-view-report.page';
import { AddExpensesToReportComponent } from './add-expenses-to-report/add-expenses-to-report.component';
import { ShareReportComponent } from './share-report/share-report.component';
import { EditReportNamePopoverComponent } from './edit-report-name-popover/edit-report-name-popover.component';

describe('MyViewReportPage', () => {
  let component: MyViewReportPage;
  let fixture: ComponentFixture<MyViewReportPage>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let reportService: jasmine.SpyObj<ReportService>;
  let expensesService: jasmine.SpyObj<ExpensesService>;
  let authService: jasmine.SpyObj<AuthService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let router: jasmine.SpyObj<Router>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let statusService: jasmine.SpyObj<StatusService>;
  let refinerService: jasmine.SpyObj<RefinerService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;

  beforeEach(waitForAsync(() => {
    const reportServiceSpy = jasmine.createSpyObj('ReportService', [
      'getReport',
      'getApproversByReportId',
      'actions',
      'updateReportDetails',
      'updateReportPurpose',
      'delete',
      'submit',
      'resubmit',
      'downloadSummaryPdfUrl',
      'addTransactions',
    ]);
    const expnesesServicespy = jasmine.createSpyObj('ExpensesService', [
      'getReportExpenses',
      'getExpenses',
      'getExpensesCount',
      'getAllExpenses',
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'deleteReport',
      'showToastMessage',
      'viewExpenseClicked',
      'clickShareReport',
      'clickViewReportInfo',
      'addToExistingReport',
      'reportNameChange',
    ]);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const statusServiceSpy = jasmine.createSpyObj('StatusService', ['find', 'createStatusMap', 'post']);
    const refinerServiceSpy = jasmine.createSpyObj('RefinerService', ['startSurvey']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);

    TestBed.configureTestingModule({
      declarations: [
        MyViewReportPage,
        EllipsisPipe,
        HumanizeCurrencyPipe,
        ReportState,
        SnakeCaseToSpaceCase,
        AsyncPipe,
      ],
      imports: [IonicModule.forRoot(), MatIconTestingModule, MatIconModule],
      providers: [
        FyCurrencyPipe,
        CurrencyPipe,
        UrlSerializer,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                id: 'rprAfNrce73O',
                navigateBack: true,
              },
            },
          },
        },
        {
          provide: ReportService,
          useValue: reportServiceSpy,
        },
        {
          provide: ExpensesService,
          useValue: expnesesServicespy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: ModalPropertiesService,
          useValue: modalPropertiesSpy,
        },
        {
          provide: NetworkService,
          useValue: networkServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: MatSnackBar,
          useValue: matSnackBarSpy,
        },
        {
          provide: SnackbarPropertiesService,
          useValue: snackbarPropertiesSpy,
        },
        {
          provide: StatusService,
          useValue: statusServiceSpy,
        },
        {
          provide: RefinerService,
          useValue: refinerServiceSpy,
        },
        {
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        { provide: NavController, useValue: { push: NavController.prototype.back } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(MyViewReportPage);
    component = fixture.componentInstance;

    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    statusService = TestBed.inject(StatusService) as jasmine.SpyObj<StatusService>;
    refinerService = TestBed.inject(RefinerService) as jasmine.SpyObj<RefinerService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;

    component.erpt$ = of(newReportParam);
    component.canEdit$ = of(true);
    component.canDelete$ = of(true);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setupNetworkWatcher():', () => {
    it('should setup network watcher', () => {
      networkService.isOnline.and.returnValue(of(true));

      component.setupNetworkWatcher();
      expect(networkService.connectivityWatcher).toHaveBeenCalledTimes(1);
      expect(networkService.isOnline).toHaveBeenCalledTimes(1);
    });

    it('should navigate to dashboard if device is not online', () => {
      networkService.isOnline.and.returnValue(of(false));

      component.setupNetworkWatcher();
      expect(networkService.connectivityWatcher).toHaveBeenCalledTimes(1);
      expect(networkService.isOnline).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard']);
    });
  });

  it('ionViewWillLeave(): should call the next callback on page exit subscription', () => {
    spyOn(component.onPageExit, 'next');
    component.hardwareBackButtonAction = new Subscription();
    spyOn(component.hardwareBackButtonAction, 'unsubscribe');

    component.ionViewWillLeave();
    expect(component.onPageExit.next).toHaveBeenCalledOnceWith(null);
    expect(component.hardwareBackButtonAction.unsubscribe).toHaveBeenCalledTimes(1);
  });

  describe('getSimplifyReportSettings():', () => {
    it('should return simplify report settings', () => {
      const result = component.getSimplifyReportSettings({
        ...orgSettingsData,
        simplified_report_closure_settings: {
          enabled: true,
        },
      });

      expect(result).toBeTrue();
    });

    it('should return undefined if settings not present', () => {
      const result = component.getSimplifyReportSettings({
        ...orgSettingsData,
        simplified_report_closure_settings: null,
      });

      expect(result).toBeUndefined();
    });

    it('should return undefined if settings not provided', () => {
      const result = component.getSimplifyReportSettings(null);

      expect(result).toBeUndefined();
    });
  });

  describe('ionViewWillEnter():', () => {
    it('should load report and report status', fakeAsync(() => {
      const erpt = cloneDeep({ ...expectedAllReports[0], rp_state: 'APPROVER_INQUIRY' });
      spyOn(component, 'setupNetworkWatcher');
      loaderService.showLoader.and.resolveTo();
      reportService.getReport.and.returnValue(of(erpt));
      authService.getEou.and.resolveTo(apiEouRes);
      statusService.find.and.returnValue(of(newEstatusData1));
      statusService.createStatusMap.and.returnValue(systemCommentsWithSt);
      reportService.getApproversByReportId.and.returnValue(of(approversData1));
      expensesService.getReportExpenses.and.returnValue(of(expenseResponseData2));
      reportService.actions.and.returnValue(of(apiReportActions));
      expensesService.getAllExpenses.and.returnValue(of([expenseData, expenseData]));
      orgSettingsService.get.and.returnValue(of(orgSettingsData));
      spyOn(component, 'getSimplifyReportSettings').and.returnValue(true);

      component.ionViewWillEnter();
      tick(2000);

      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(reportService.getReport).toHaveBeenCalledOnceWith(component.reportId);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(statusService.find).toHaveBeenCalledOnceWith(component.objectType, component.reportId);

      component.erpt$.subscribe((res) => {
        expect(res).toEqual(erpt);
      });

      component.estatuses$.subscribe((res) => {
        expect(res).toEqual(expectedNewStatusData);
      });

      expect(component.systemComments).toEqual(systemComments1);
      expect(component.type).toEqual(component.objectType.substring(0, component.objectType.length - 1));

      expect(statusService.createStatusMap).toHaveBeenCalledWith(systemComments1, 'report');
      expect(component.systemEstatuses).toEqual(systemCommentsWithSt);

      expect(component.userComments).toEqual([expectedNewStatusData[2], expectedNewStatusData[3]]);

      component.totalCommentsCount$.subscribe((res) => {
        expect(res).toEqual(3);
      });

      expect(component.eou).toEqual(apiEouRes);

      expect(component.segmentValue).toEqual(ReportPageSegment.COMMENTS);

      expect(reportService.getApproversByReportId).toHaveBeenCalledOnceWith(component.reportId);
      component.reportApprovals$.subscribe((res) => {
        expect(res).toEqual(approversData1);
      });

      expect(expensesService.getReportExpenses).toHaveBeenCalledOnceWith(component.reportId);

      expect(reportService.actions).toHaveBeenCalledOnceWith(component.reportId);

      component.canEdit$.subscribe((res) => {
        expect(res).toBeTrue();
      });

      component.canDelete$.subscribe((res) => {
        expect(res).toBeTrue();
      });

      component.canResubmitReport$.subscribe((res) => {
        expect(res).toBeFalse();
      });

      expect(component.reportExpenseIds).toEqual(['txcSFe6efB6R', 'txcSFe6efB6R']);

      expect(expensesService.getAllExpenses).toHaveBeenCalledOnceWith({
        queryParams: {
          report_id: 'is.null',
          state: 'in.(COMPLETE)',
          order: 'spent_at.desc',
          or: ['(policy_amount.is.null,policy_amount.gt.0.0001)'],
          and: '()',
        },
      });
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);

      component.simplifyReportsSettings$.subscribe((res) => {
        expect(res).toEqual({
          enabled: true,
        });
      });

      expect(component.getSimplifyReportSettings).toHaveBeenCalledOnceWith(orgSettingsData);
    }));

    it('should change object type and other properties if not present', fakeAsync(() => {
      spyOn(component, 'setupNetworkWatcher');
      spyOn(component, 'getSimplifyReportSettings').and.returnValue(true);
      component.objectType = 'transactions';
      loaderService.showLoader.and.resolveTo();
      reportService.getReport.and.returnValue(of(null));
      authService.getEou.and.resolveTo(apiEouRes);
      statusService.find.and.returnValue(of(newEstatusData1));
      statusService.createStatusMap.and.returnValue(systemCommentsWithSt);
      reportService.getApproversByReportId.and.returnValue(of(approversData1));
      expensesService.getReportExpenses.and.returnValue(of(expenseResponseData2));
      reportService.actions.and.returnValue(of(apiReportActions));
      expensesService.getAllExpenses.and.returnValue(of([expenseData, expenseData]));
      orgSettingsService.get.and.returnValue(of(orgSettingsData));
      fixture.detectChanges();

      component.ionViewWillEnter();
      tick(2000);

      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(reportService.getReport).toHaveBeenCalledOnceWith(component.reportId);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(statusService.find).toHaveBeenCalledOnceWith(component.objectType, component.reportId);

      component.erpt$.subscribe((res) => {
        expect(res).toBeNull();
      });

      component.estatuses$.subscribe((res) => {
        expect(res).toEqual(expectedNewStatusData);
      });

      expect(component.systemComments).toEqual(systemComments1);
      expect(component.type).toEqual('Expense');
      expect(component.reportCurrencySymbol).toBeUndefined();

      expect(statusService.createStatusMap).toHaveBeenCalledWith(systemComments1, 'Expense');
      expect(component.systemEstatuses).toEqual(systemCommentsWithSt);

      expect(component.userComments).toEqual([expectedNewStatusData[2], expectedNewStatusData[3]]);

      component.totalCommentsCount$.subscribe((res) => {
        expect(res).toEqual(3);
      });

      expect(component.segmentValue).toEqual(ReportPageSegment.EXPENSES);

      expect(reportService.getApproversByReportId).toHaveBeenCalledOnceWith(component.reportId);
      component.reportApprovals$.subscribe((res) => {
        expect(res).toEqual(approversData1);
      });

      expect(expensesService.getReportExpenses).toHaveBeenCalledOnceWith(component.reportId);

      expect(reportService.actions).toHaveBeenCalledOnceWith(component.reportId);

      component.canEdit$.subscribe((res) => {
        expect(res).toBeTrue();
      });

      component.canDelete$.subscribe((res) => {
        expect(res).toBeTrue();
      });

      component.canResubmitReport$.subscribe((res) => {
        expect(res).toBeFalse();
      });

      expect(component.reportExpenseIds).toEqual(['txcSFe6efB6R', 'txcSFe6efB6R']);

      expect(expensesService.getAllExpenses).toHaveBeenCalledOnceWith({
        queryParams: {
          report_id: 'is.null',
          state: 'in.(COMPLETE)',
          order: 'spent_at.desc',
          or: ['(policy_amount.is.null,policy_amount.gt.0.0001)'],
          and: '()',
        },
      });

      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);

      component.simplifyReportsSettings$.subscribe((res) => {
        expect(res).toEqual({ enabled: true });
      });
      expect(component.getSimplifyReportSettings).toHaveBeenCalledOnceWith(orgSettingsData);
    }));
  });

  it('updateReportName(): should update report name', () => {
    component.erpt$ = of(newReportParam);
    fixture.detectChanges();
    reportService.updateReportPurpose.and.returnValue(of(platformReportData));
    spyOn(component.loadReportDetails$, 'next');

    component.updateReportName('#3:  Jul 2023 - Office expense');
    expect(reportService.updateReportPurpose).toHaveBeenCalledOnceWith(newReportParam);
    expect(component.loadReportDetails$.next).toHaveBeenCalledTimes(1);
  });

  describe('editReportName(): ', () => {
    it('should edit report name', fakeAsync(() => {
      component.erpt$ = of(cloneDeep({ ...expectedAllReports[0], rp_state: 'DRAFT' }));
      component.canEdit$ = of(true);
      fixture.detectChanges();

      spyOn(component, 'updateReportName').and.returnValue(null);

      const editReportNamePopoverSpy = jasmine.createSpyObj('editReportNamePopover', ['present', 'onWillDismiss']);
      editReportNamePopoverSpy.onWillDismiss.and.resolveTo({ data: { reportName: 'new name' } });

      popoverController.create.and.returnValue(Promise.resolve(editReportNamePopoverSpy));

      const editReportButton = getElementBySelector(fixture, '.view-reports--card-header__icon') as HTMLElement;
      click(editReportButton);
      tick(2000);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: EditReportNamePopoverComponent,
        componentProps: {
          reportName: expectedAllReports[0].rp_purpose,
        },
        cssClass: 'fy-dialog-popover',
      });
      expect(component.updateReportName).toHaveBeenCalledOnceWith('new name');
    }));

    it('should not edit report name if data does not contain name', fakeAsync(() => {
      component.erpt$ = of(cloneDeep({ ...expectedAllReports[0], rp_state: 'DRAFT' }));
      component.canEdit$ = of(true);
      fixture.detectChanges();

      spyOn(component, 'updateReportName').and.returnValue(null);

      const editReportNamePopoverSpy = jasmine.createSpyObj('editReportNamePopover', ['present', 'onWillDismiss']);
      editReportNamePopoverSpy.onWillDismiss.and.resolveTo();

      popoverController.create.and.returnValue(Promise.resolve(editReportNamePopoverSpy));

      const editReportButton = getElementBySelector(fixture, '.view-reports--card-header__icon') as HTMLElement;
      click(editReportButton);
      tick(2000);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: EditReportNamePopoverComponent,
        componentProps: {
          reportName: expectedAllReports[0].rp_purpose,
        },
        cssClass: 'fy-dialog-popover',
      });
      expect(component.updateReportName).not.toHaveBeenCalled();
    }));
  });

  it('deleteReport(): should delete report', () => {
    component.erpt$ = of(expectedAllReports[0]);
    fixture.detectChanges();
    spyOn(component, 'deleteReportPopup').and.returnValue(null);

    component.deleteReport();

    expect(component.deleteReportPopup).toHaveBeenCalledOnceWith(expectedAllReports[0]);
  });

  describe('getDeleteReportPopupParams(): ', () => {
    it('should get delete report popup props', (done) => {
      reportService.delete.and.returnValue(of(undefined));
      const props = component.getDeleteReportPopupParams(expectedAllReports[0]);
      props.componentProps.deleteMethod().subscribe(() => {
        expect(reportService.delete).toHaveBeenCalledOnceWith(component.reportId);
        expect(trackingService.deleteReport).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should return null info message if number of txns is 0', (done) => {
      reportService.delete.and.returnValue(of(undefined));
      const props = component.getDeleteReportPopupParams(
        cloneDeep({ ...expectedAllReports[0], rp_num_transactions: 0, rp_state: 'DRAFT' })
      );
      expect(props.componentProps.infoMessage).toBeNull();
      props.componentProps.deleteMethod().subscribe(() => {
        expect(reportService.delete).toHaveBeenCalledOnceWith(component.reportId);
        expect(trackingService.deleteReport).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  it('deleteReportPopup(): should show delete report popup', fakeAsync(() => {
    spyOn(component, 'getDeleteReportPopupParams');
    const deleteReportPopoverSpy = jasmine.createSpyObj('deleteReportPopover', ['present', 'onDidDismiss']);
    deleteReportPopoverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });

    popoverController.create.and.returnValue(Promise.resolve(deleteReportPopoverSpy));

    component.deleteReportPopup(expectedAllReports[0]);
    tick(2000);

    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_reports']);
    expect(component.getDeleteReportPopupParams).toHaveBeenCalledOnceWith(expectedAllReports[0]);
    expect(popoverController.create).toHaveBeenCalledOnceWith(
      component.getDeleteReportPopupParams(expectedAllReports[0])
    );
  }));

  it('resubmitReport(): should resubmit report', () => {
    component.segmentValue = ReportPageSegment.EXPENSES;
    component.erpt$ = of(cloneDeep({ ...expectedAllReports[0], rp_state: 'DRAFT', rp_num_transactions: 3 }));
    component.canResubmitReport$ = of(true);
    fixture.detectChanges();

    const properties = {
      data: {
        icon: 'check-square-fill',
        showCloseButton: true,
        message: 'Report resubmitted successfully.',
      },
      duration: 3000,
    };
    reportService.resubmit.and.returnValue(of(null));
    matSnackBar.openFromComponent.and.callThrough();
    snackbarProperties.setSnackbarProperties.and.returnValue(properties);

    const resubmitButton = getElementBySelector(fixture, '.fy-footer-cta--primary') as HTMLElement;
    click(resubmitButton);

    expect(reportService.resubmit).toHaveBeenCalledWith(component.reportId);
    expect(refinerService.startSurvey).toHaveBeenCalledOnceWith({ actionName: 'Resubmit Report ' });
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_reports']);
    expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      ...properties,
      panelClass: ['msb-success-with-camera-icon'],
    });
    expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('success', {
      message: 'Report resubmitted successfully.',
    });
    expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
      ToastContent: 'Report resubmitted successfully.',
    });
  });

  it('submitReport(): should submit report', () => {
    component.segmentValue = ReportPageSegment.EXPENSES;
    component.erpt$ = of(cloneDeep({ ...expectedAllReports[0], rp_state: 'DRAFT', rp_num_transactions: 3 }));
    fixture.detectChanges();

    const properties = {
      data: {
        icon: 'check-square-fill',
        showCloseButton: true,
        message: 'Report submitted successfully.',
      },
      duration: 3000,
    };
    reportService.submit.and.returnValue(of(null));
    matSnackBar.openFromComponent.and.callThrough();
    snackbarProperties.setSnackbarProperties.and.returnValue(properties);

    const submitButton = getElementBySelector(fixture, '.fy-footer-cta--primary') as HTMLElement;
    click(submitButton);

    expect(reportService.submit).toHaveBeenCalledWith(component.reportId);
    expect(refinerService.startSurvey).toHaveBeenCalledOnceWith({ actionName: 'Submit Report' });
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_reports']);
    expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      ...properties,
      panelClass: ['msb-success-with-camera-icon'],
    });
    expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('success', {
      message: 'Report submitted successfully.',
    });
    expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
      ToastContent: 'Report submitted successfully.',
    });
  });

  describe('goToTransaction():', () => {
    beforeEach(() => {
      component.canEdit$ = of(false);
    });

    it('should go to view expense page if canEdit is false', () => {
      component.goToTransaction({
        expense: expenseData,
        expenseIndex: 0,
      });

      const route = '/enterprise/view_expense';

      expect(trackingService.viewExpenseClicked).toHaveBeenCalledOnceWith({
        view: ExpenseView.individual,
        category: expenseData.category.name.toLowerCase(),
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        route,
        {
          id: expenseData.id,
          txnIds: JSON.stringify(component.reportExpenseIds),
          activeIndex: 0,
          view: ExpenseView.individual,
        },
      ]);
    });
    it('should go to edit expense page if canEdit is true', () => {
      component.canEdit$ = of(true);
      component.erpt$ = of(expectedAllReports[0]);

      fixture.detectChanges();
      component.goToTransaction({
        expense: expenseData,
        expenseIndex: 0,
      });

      const route = '/enterprise/add_edit_expense';

      expect(router.navigate).toHaveBeenCalledOnceWith([
        route,
        {
          id: expenseData.id,
          navigate_back: true,
          remove_from_report: expectedAllReports[0].rp_num_transactions > 1,
        },
      ]);
    });

    it('should go to view mileage page if category is mileage and canEdit is false', () => {
      component.goToTransaction({
        expense: mileageExpense,
        expenseIndex: 0,
      });

      const route = '/enterprise/view_mileage';

      expect(trackingService.viewExpenseClicked).toHaveBeenCalledOnceWith({
        view: ExpenseView.individual,
        category: mileageExpense.category.name.toLowerCase(),
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        route,
        {
          id: mileageExpense.id,
          txnIds: JSON.stringify(component.reportExpenseIds),
          activeIndex: 0,
          view: ExpenseView.individual,
        },
      ]);
    });

    it('should go to edit mileage page if category is mileage and canEdit is true', () => {
      component.canEdit$ = of(true);
      component.erpt$ = of(expectedAllReports[0]);

      fixture.detectChanges();
      component.goToTransaction({
        expense: mileageExpense,
        expenseIndex: 0,
      });

      const route = '/enterprise/add_edit_mileage';

      expect(router.navigate).toHaveBeenCalledOnceWith([
        route,
        {
          id: mileageExpense.id,
          navigate_back: true,
          remove_from_report: expectedAllReports[0].rp_num_transactions > 1,
        },
      ]);
    });

    it('should go to view per diem page if category is per diem and canEdit is false', () => {
      component.goToTransaction({
        expense: perDiemExpense,
        expenseIndex: 0,
      });

      const route = '/enterprise/view_per_diem';

      expect(trackingService.viewExpenseClicked).toHaveBeenCalledOnceWith({
        view: ExpenseView.individual,
        category: perDiemExpense.category.name.toLowerCase(),
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        route,
        {
          id: perDiemExpense.id,
          txnIds: JSON.stringify(component.reportExpenseIds),
          activeIndex: 0,
          view: ExpenseView.individual,
        },
      ]);
    });

    it('should go to edit per diem page if category is per diem and canEdit is true', () => {
      component.canEdit$ = of(true);
      component.erpt$ = of(expectedAllReports[0]);

      fixture.detectChanges();
      component.goToTransaction({
        expense: perDiemExpense,
        expenseIndex: 0,
      });

      const route = '/enterprise/add_edit_per_diem';

      expect(router.navigate).toHaveBeenCalledOnceWith([
        route,
        {
          id: perDiemExpense.id,
          navigate_back: true,
          remove_from_report: expectedAllReports[0].rp_num_transactions > 1,
        },
      ]);
    });
  });

  it('shareReport(): should share report', async () => {
    const snackbarPropertiesData = {
      data: {
        icon: 'check-square-fill',
        showCloseButton: true,
        message: 'PDF download link has been emailed to aj@fyle.com',
      },
      duration: 3000,
    };
    const shareReportModalSpy = jasmine.createSpyObj('shareReportModal', ['present', 'onWillDismiss']);
    shareReportModalSpy.onWillDismiss.and.resolveTo({
      data: {
        email: 'aj@fyle.com',
      },
    });
    modalController.create.and.returnValue(Promise.resolve(shareReportModalSpy));
    reportService.downloadSummaryPdfUrl.and.returnValue(of(null));
    matSnackBar.openFromComponent.and.callThrough();
    modalProperties.getModalDefaultProperties.and.returnValue(shareReportModalProperties);
    snackbarProperties.setSnackbarProperties.and.returnValue(snackbarPropertiesData);

    await component.shareReport();

    expect(trackingService.clickShareReport).toHaveBeenCalledTimes(1);
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: ShareReportComponent,
      mode: 'ios',
      ...shareReportModalProperties,
      cssClass: 'share-report-modal',
    });
    expect(reportService.downloadSummaryPdfUrl).toHaveBeenCalledOnceWith({
      report_ids: [component.reportId],
      email: 'aj@fyle.com',
    });
    expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      ...snackbarPropertiesData,
      panelClass: ['msb-success-with-report-btn'],
    });
    expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('success', {
      message: 'PDF download link has been emailed to aj@fyle.com',
    });
    expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
      ToastContent: 'PDF download link has been emailed to aj@fyle.com',
    });
  });

  it('openViewReportInfoModal(): should open report info modal', async () => {
    const viewInfoModalSpy = jasmine.createSpyObj('viewInfoModal', ['onWillDismiss', 'present']);
    viewInfoModalSpy.onWillDismiss.and.resolveTo();

    modalController.create.and.returnValue(Promise.resolve(viewInfoModalSpy));
    modalProperties.getModalDefaultProperties.and.returnValue(fyModalProperties);

    await component.openViewReportInfoModal();
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: FyViewReportInfoComponent,
      componentProps: {
        erpt$: component.erpt$,
        expenses$: component.expenses$,
        view: ExpenseView.individual,
      },
      ...fyModalProperties,
    });
    expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
    expect(trackingService.clickViewReportInfo).toHaveBeenCalledOnceWith({ view: ExpenseView.individual });
  });

  describe('segmentChanged():', () => {
    it('should change segment value', () => {
      component.segmentChanged({
        detail: {
          value: '100',
        },
      } as SegmentCustomEvent);

      expect(component.segmentValue).toEqual(parseInt('100', 10));
    });

    it('should not change segment value if event does not contain the value', () => {
      component.segmentValue = parseInt('100', 10);
      fixture.detectChanges();
      expect(component.segmentValue).toEqual(parseInt('100', 10));

      component.segmentChanged(null);

      expect(component.segmentValue).toEqual(parseInt('100', 10));
    });
  });

  it('addComment(): should add a comment', () => {
    component.segmentValue = ReportPageSegment.COMMENTS;
    fixture.detectChanges();

    statusService.post.and.returnValue(of(txnStatusData));
    spyOn(component.content, 'scrollToBottom');
    spyOn(component.refreshEstatuses$, 'next');
    component.newComment = 'comment';
    component.segmentValue = ReportPageSegment.COMMENTS;
    component.commentInput = fixture.debugElement.query(By.css('.view-comment--text-area'));
    fixture.detectChanges();
    spyOn(component.commentInput.nativeElement, 'focus');

    const addCommentButton = getElementBySelector(fixture, '.view-comment--send-icon') as HTMLElement;
    click(addCommentButton);

    component.addComment();
    fixture.detectChanges();

    expect(statusService.post).toHaveBeenCalledOnceWith(component.objectType, component.reportId, {
      comment: 'comment',
    });
    expect(component.newComment).toBeNull();
    expect(component.isCommentAdded).toBeTrue();
    expect(component.refreshEstatuses$.next).toHaveBeenCalledTimes(1);
  });

  it('addExpense(): should navigate to expense page', () => {
    component.segmentValue = ReportPageSegment.EXPENSES;
    component.erpt$ = of(cloneDeep({ ...expectedAllReports[0], rp_state: 'DRAFT' }));
    fixture.detectChanges();

    const addExpenseButton = getElementBySelector(fixture, '.view-reports--add-more-container') as HTMLElement;
    click(addExpenseButton);

    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'add_edit_expense',
      { rp_id: component.reportId },
    ]);
  });

  describe('showAddExpensesToReportModal():', () => {
    const expense1 = expenseData;
    const expense2 = { ...expenseData, id: 'txcSFe6efB62' };
    it('should show modal to add expense to report', fakeAsync(() => {
      component.segmentValue = ReportPageSegment.EXPENSES;
      component.erpt$ = of(cloneDeep({ ...expectedAllReports[0], rp_state: 'DRAFT', rp_num_transactions: 3 }));
      component.unreportedExpenses = [expense1, expense2];
      fixture.detectChanges();

      const addExpensesToReportModalSpy = jasmine.createSpyObj('addExpensesToReportModal', [
        'onWillDismiss',
        'present',
      ]);
      addExpensesToReportModalSpy.onWillDismiss.and.resolveTo({
        data: {
          selectedExpenseIds: ['txcSFe6efB6R', 'txcSFe6efB62'],
        },
      });

      modalController.create.and.returnValue(Promise.resolve(addExpensesToReportModalSpy));
      modalProperties.getModalDefaultProperties.and.returnValue(fyModalProperties);
      spyOn(component, 'addExpensesToReport').and.returnValue(null);

      const openButton = getElementBySelector(fixture, '.view-reports--add-expenses-container__icon') as HTMLElement;
      click(openButton);
      tick(5000);

      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: AddExpensesToReportComponent,
        componentProps: {
          unreportedExpenses: component.unreportedExpenses,
          reportId: component.reportId,
        },
        mode: 'ios',
        ...fyModalProperties,
      });
      expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
      expect(component.addExpensesToReport).toHaveBeenCalledOnceWith(['txcSFe6efB6R', 'txcSFe6efB62']);
    }));

    it('should not add txns to report if there is no data', fakeAsync(() => {
      component.segmentValue = ReportPageSegment.EXPENSES;
      component.erpt$ = of(cloneDeep({ ...expectedAllReports[0], rp_state: 'DRAFT', rp_num_transactions: 3 }));
      component.unreportedExpenses = [expense1, expense2];
      fixture.detectChanges();

      const addExpensesToReportModalSpy = jasmine.createSpyObj('addExpensesToReportModal', [
        'onWillDismiss',
        'present',
      ]);
      addExpensesToReportModalSpy.onWillDismiss.and.resolveTo(null);

      modalController.create.and.returnValue(Promise.resolve(addExpensesToReportModalSpy));
      modalProperties.getModalDefaultProperties.and.returnValue(fyModalProperties);
      spyOn(component, 'addExpensesToReport').and.returnValue(null);

      const openButton = getElementBySelector(fixture, '.view-reports--add-expenses-container__icon') as HTMLElement;
      click(openButton);
      tick(5000);

      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: AddExpensesToReportComponent,
        componentProps: {
          unreportedExpenses: component.unreportedExpenses,
          reportId: component.reportId,
        },
        mode: 'ios',
        ...fyModalProperties,
      });
      expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
      expect(component.addExpensesToReport).not.toHaveBeenCalled();
    }));
  });

  it('addExpensesToReport(): should add expenses to report', () => {
    const expense1 = expenseData;
    const expense2 = { ...expenseData, id: 'txcSFe6efB62' };
    component.reportId = 'rpFkJ6jUJOyg';
    component.unreportedExpenses = [expense1, expense2];
    fixture.detectChanges();
    reportService.addTransactions.and.returnValue(of(null));

    spyOn(component.loadReportDetails$, 'next');
    spyOn(component.loadReportTxns$, 'next');

    component.addExpensesToReport(['txcSFe6efB62', 'tx3qHxFNgRcZ']);
    expect(reportService.addTransactions).toHaveBeenCalledOnceWith('rpFkJ6jUJOyg', ['txcSFe6efB62', 'tx3qHxFNgRcZ']);
    expect(component.loadReportDetails$.next).toHaveBeenCalledTimes(1);
    expect(component.loadReportTxns$.next).toHaveBeenCalledTimes(1);
    expect(component.unreportedExpenses).toEqual([expenseData]);
  });
});
