import { CurrencyPipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ModalController, PopoverController } from '@ionic/angular';
import { finalize, of } from 'rxjs';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { apiReportPermissions } from 'src/app/core/mock-data/report-permissions.data';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { RefinerService } from 'src/app/core/services/refiner.service';
import { ReportService } from 'src/app/core/services/report.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { StatusService } from 'src/app/core/services/status.service';
import { orgSettingsData } from 'src/app/core/test-data/accounts.service.spec.data';
import {
  newEstatusData1,
  systemComments1,
  systemCommentsWithSt,
  userComments,
} from 'src/app/core/test-data/status.service.spec.data';
import { FyPopoverComponent } from 'src/app/shared/components/fy-popover/fy-popover.component';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { EllipsisPipe } from 'src/app/shared/pipes/ellipses.pipe';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { NetworkService } from '../../core/services/network.service';
import { TrackingService } from '../../core/services/tracking.service';
import { ViewTeamReportPage } from './view-team-report.page';
import { pdfExportData1, pdfExportData2 } from 'src/app/core/mock-data/pdf-export.data';
import { EditReportNamePopoverComponent } from '../my-view-report/edit-report-name-popover/edit-report-name-popover.component';
import { cloneDeep } from 'lodash';
import {
  allReportsPaginated1,
  allReportsPaginatedWithApproval,
  expectedReportsSinglePage,
  platformReportData,
  reportWithExpenses,
} from 'src/app/core/mock-data/platform-report.data';
import {
  expenseData,
  expenseResponseData,
  expenseResponseData2,
  mileageExpense,
  perDiemExpenseWithSingleNumDays,
} from 'src/app/core/mock-data/platform/v1/expense.data';
import { ExpensesService as ApproverExpensesService } from 'src/app/core/services/platform/v1/approver/expenses.service';
import { FyViewReportInfoComponent } from 'src/app/shared/components/fy-view-report-info/fy-view-report-info.component';
import { ApproverReportsService } from 'src/app/core/services/platform/v1/approver/reports.service';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';

describe('ViewTeamReportPageV2', () => {
  let component: ViewTeamReportPage;
  let fixture: ComponentFixture<ViewTeamReportPage>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let reportService: jasmine.SpyObj<ReportService>;
  let approverExpensesService: jasmine.SpyObj<ApproverExpensesService>;
  let authService: jasmine.SpyObj<AuthService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let router: jasmine.SpyObj<Router>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let popupService: jasmine.SpyObj<PopupService>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let launchDarklyService: jasmine.SpyObj<LaunchDarklyService>;
  let refinerService: jasmine.SpyObj<RefinerService>;
  let statusService: jasmine.SpyObj<StatusService>;
  let humanizeCurrency: jasmine.SpyObj<HumanizeCurrencyPipe>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let approverReportsService: jasmine.SpyObj<ApproverReportsService>;

  beforeEach(waitForAsync(() => {
    const approverExpensesServiceSpy = jasmine.createSpyObj('ApproverExpensesService', [
      'getReportExpenses',
      'getExpenses',
      'getExpensesCount',
    ]);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', ['approverUpdateReportPurpose']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'viewExpenseClicked',
      'showToastMessage',
      'clickViewReportInfo',
      'reportNameChange',
    ]);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const statusServiceSpy = jasmine.createSpyObj('StatusService', ['find', 'createStatusMap', 'post']);
    const humanizeCurrencySpy = jasmine.createSpyObj('HumanizeCurrencyPipe', ['transform']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const approverReportsServiceSpy = jasmine.createSpyObj('ApproverReportsService', [
      'getReportById',
      'permissions',
      'postComment',
      'sendBack',
      'approve',
    ]);
    const launchDarklyServiceSpy = jasmine.createSpyObj('LaunchDarklyService', ['getVariation']);
    const refinerServiceSpy = jasmine.createSpyObj('RefinerService', ['startSurvey', '']);

    TestBed.configureTestingModule({
      declarations: [ViewTeamReportPage, EllipsisPipe, HumanizeCurrencyPipe],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [
        FyCurrencyPipe,
        CurrencyPipe,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                id: 'rpFE5X1Pqi9P',
                navigate_back: true,
              },
            },
          },
        },
        {
          provide: ApproverExpensesService,
          useValue: approverExpensesServiceSpy,
        },
        {
          provide: ReportService,
          useValue: reportServiceSpy,
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
          provide: PopupService,
          useValue: popupServiceSpy,
        },
        {
          provide: NetworkService,
          useValue: networkServiceSpy,
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
          provide: LaunchDarklyService,
          useValue: launchDarklyServiceSpy,
        },
        {
          provide: RefinerService,
          useValue: refinerServiceSpy,
        },
        {
          provide: StatusService,
          useValue: statusServiceSpy,
        },
        {
          provide: HumanizeCurrencyPipe,
          useValue: humanizeCurrencySpy,
        },
        {
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        {
          provide: ApproverReportsService,
          useValue: approverReportsServiceSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(ViewTeamReportPage);
    component = fixture.componentInstance;

    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    approverExpensesService = TestBed.inject(ApproverExpensesService) as jasmine.SpyObj<ApproverExpensesService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    popupService = TestBed.inject(PopupService) as jasmine.SpyObj<PopupService>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    refinerService = TestBed.inject(RefinerService) as jasmine.SpyObj<RefinerService>;
    statusService = TestBed.inject(StatusService) as jasmine.SpyObj<StatusService>;
    humanizeCurrency = TestBed.inject(HumanizeCurrencyPipe) as jasmine.SpyObj<HumanizeCurrencyPipe>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    approverReportsService = TestBed.inject(ApproverReportsService) as jasmine.SpyObj<ApproverReportsService>;
    launchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;

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

  it('loadReports(): should load reports', (done) => {
    loaderService.showLoader.and.resolveTo();
    approverReportsService.getReportById.and.returnValue(of(expectedReportsSinglePage[0]));
    loaderService.hideLoader.and.resolveTo();

    component
      .loadReports()
      .pipe(
        finalize(() => {
          expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        })
      )
      .subscribe((res) => {
        expect(res).toEqual(expectedReportsSinglePage[0]);
        expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
        expect(approverReportsService.getReportById).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);
        done();
      });
  });

  describe('getApprovalSettings():', () => {
    it('should return approval_settings', () => {
      const result = component.getApprovalSettings(orgSettingsData);
      expect(result).toBeFalse();
    });

    it('should return undefined if approval settings not present', () => {
      const result = component.getApprovalSettings({ ...orgSettingsData, approval_settings: undefined });
      expect(result).toBeUndefined();
    });

    it('should return undefined if org settings are not present', () => {
      const result = component.getApprovalSettings(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe('getReportClosureSettings():', () => {
    it('should return closure settings', () => {
      const result = component.getReportClosureSettings({
        ...orgSettingsData,
        simplified_report_closure_settings: {
          enabled: true,
        },
      });
      expect(result).toBeTrue();
    });

    it('should return undefined if approval settings not present', () => {
      const result = component.getReportClosureSettings({
        ...orgSettingsData,
        simplified_report_closure_settings: undefined,
      });
      expect(result).toBeUndefined();
    });

    it('should return undefined if org settings are not present', () => {
      const result = component.getReportClosureSettings(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe('ionViewWillEnter():', () => {
    it('should initialize the variables and load reports and statuses', fakeAsync(() => {
      spyOn(component, 'loadReports').and.returnValue(of(expectedReportsSinglePage[0]));
      spyOn(component, 'setupNetworkWatcher');
      spyOn(component, 'getApprovalSettings').and.returnValue(true);
      spyOn(component, 'getReportClosureSettings').and.returnValue(true);
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();
      authService.getEou.and.resolveTo(apiEouRes);
      const mockStatus = cloneDeep(newEstatusData1);
      orgSettingsService.get.and.returnValue(of(orgSettingsData));
      statusService.createStatusMap.and.returnValue(systemCommentsWithSt);
      approverReportsService.getReportById.and.returnValues(of(expectedReportsSinglePage[0]));
      const mockPdfExportData = cloneDeep(pdfExportData1);

      approverExpensesService.getReportExpenses.and.returnValue(of(expenseResponseData2));
      approverReportsService.permissions.and.returnValue(of(apiReportPermissions));

      component.ionViewWillEnter();
      tick(2000);

      component.eou$.subscribe((res) => {
        expect(res).toEqual(apiEouRes);
      });

      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
      expect(component.loadReports).toHaveBeenCalledTimes(1);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(2);

      component.simplifyReportsSettings$.subscribe((res) => {
        expect(res).toEqual({
          enabled: true,
        });
      });

      expect(component.getApprovalSettings).toHaveBeenCalledOnceWith(orgSettingsData);
      expect(approverReportsService.getReportById).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);
      expect(statusService.createStatusMap).toHaveBeenCalledOnceWith(
        component.convertToEstatus(component.systemComments),
        component.type
      );

      component.report$.subscribe((res) => {
        expect(res).toEqual(expectedReportsSinglePage[0]);
      });

      expect(component.eou).toEqual(apiEouRes);

      expect(component.convertToEstatus(component.systemComments)).toEqual(systemComments1);

      expect(component.objectType).toEqual('reports');

      expect(component.systemEstatuses).toEqual(systemCommentsWithSt);

      expect(approverExpensesService.getReportExpenses).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);

      component.expensesAmountSum$.subscribe((res) => {
        expect(res).toEqual(20);
      });

      component.report$.subscribe((res) => {
        expect(res).toEqual(expectedReportsSinglePage[0]);
      });

      component.permissions$.subscribe((res) => {
        expect(res).toEqual(apiReportPermissions);
      });

      component.canEdit$.subscribe((res) => {
        expect(res).toBeTrue();
      });

      component.canDelete$.subscribe((res) => {
        expect(res).toBeTrue();
      });

      component.canResubmitReport$.subscribe((res) => {
        expect(res).toBeFalse();
      });

      expect(approverReportsService.permissions).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);

      expect(component.reportExpensesIds).toEqual(['txcSFe6efB6R', 'txcSFe6efB6R']);
      expect(component.isSequentialApprovalEnabled).toBeTrue();
      expect(component.canApprove).toBeFalse();
      expect(component.canShowTooltip).toBeTrue();
    }));

    it('should load reports when object type is expenses', fakeAsync(() => {
      component.objectType = 'Transactions';
      spyOn(component, 'setupNetworkWatcher');
      spyOn(component, 'getApprovalSettings').and.returnValue(false);
      spyOn(component, 'getReportClosureSettings').and.returnValue(true);
      loaderService.showLoader.and.resolveTo();
      spyOn(component, 'loadReports').and.returnValue(of(expectedReportsSinglePage[0]));
      loaderService.hideLoader.and.resolveTo();
      authService.getEou.and.resolveTo(apiEouRes);
      const mockStatus = cloneDeep(newEstatusData1);
      orgSettingsService.get.and.returnValue(of(orgSettingsData));
      statusService.createStatusMap.and.returnValue(systemCommentsWithSt);
      approverReportsService.getReportById.and.returnValue(of(expectedReportsSinglePage[0]));
      const mockPdfExportData = cloneDeep(pdfExportData2);
      approverExpensesService.getReportExpenses.and.returnValue(of(expenseResponseData2));
      approverReportsService.permissions.and.returnValue(of(apiReportPermissions));
      fixture.detectChanges();

      component.ionViewWillEnter();
      tick(2000);

      component.eou$.subscribe((res) => {
        expect(res).toEqual(apiEouRes);
      });

      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
      expect(component.loadReports).toHaveBeenCalledTimes(1);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(2);

      component.simplifyReportsSettings$.subscribe((res) => {
        expect(res).toEqual({
          enabled: true,
        });
      });

      expect(approverReportsService.getReportById).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);
      expect(statusService.createStatusMap).toHaveBeenCalledOnceWith(
        component.convertToEstatus(component.systemComments),
        component.type
      );

      expect(component.totalCommentsCount).toEqual(3);

      component.report$.subscribe((res) => {
        expect(res).toEqual(expectedReportsSinglePage[0]);
      });

      expect(component.convertToEstatus(component.systemComments)).toEqual(systemComments1);

      expect(component.objectType).toEqual('Transactions');

      expect(component.systemEstatuses).toEqual(systemCommentsWithSt);

      expect(component.userComments).toEqual(userComments);

      expect(approverExpensesService.getReportExpenses).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);

      component.expensesAmountSum$.subscribe((res) => {
        expect(res).toEqual(20);
      });

      component.permissions$.subscribe((res) => {
        expect(res).toEqual(apiReportPermissions);
      });

      component.canEdit$.subscribe((res) => {
        expect(res).toBeTrue();
      });

      component.canDelete$.subscribe((res) => {
        expect(res).toBeTrue();
      });

      component.canResubmitReport$.subscribe((res) => {
        expect(res).toBeFalse();
      });

      expect(approverReportsService.permissions).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);
      expect(component.getApprovalSettings).toHaveBeenCalledOnceWith(orgSettingsData);

      expect(component.reportExpensesIds).toEqual(['txcSFe6efB6R', 'txcSFe6efB6R']);
      expect(component.isSequentialApprovalEnabled).toBeFalse();
      expect(component.canApprove).toBeTrue();
      expect(component.canShowTooltip).toBeTrue();
    }));
  });

  describe('setupComments():', () => {
    it('should set estatuses to an empty array in case of a null report', () => {
      component.eou$ = of(apiEouRes);
      component.setupComments(null);
      expect(component.estatuses).toEqual([]);
    });

    it('should set estatuses to an empty array in case of a null comments', () => {
      component.eou$ = of(apiEouRes);
      component.setupComments({ ...platformReportData, comments: null });
      expect(component.estatuses).toEqual([]);
    });
  });

  it('setupNetworkWatcher(): should setup network watcher', () => {
    networkService.connectivityWatcher.and.returnValue(new EventEmitter(true));
    networkService.isOnline.and.returnValue(of(false));

    component.setupNetworkWatcher();
    expect(networkService.isOnline).toHaveBeenCalledTimes(1);
    expect(networkService.connectivityWatcher).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard']);
  });

  it('getApproverEmails(): should get approver emails', () => {
    const result = component.getApproverEmails(allReportsPaginatedWithApproval.data[0].approvals);

    expect(result).toEqual(['aditya.b@fyle.in', 'aastha.b@fyle.in']);
  });

  it('toggleTooltip(): should toggle tooltip', () => {
    component.canShowTooltip = false;
    fixture.detectChanges();

    component.toggleTooltip();
    expect(component.canShowTooltip).toBeTrue();
  });

  describe('approveReport(): ', () => {
    it('should open the modal and approve the report', async () => {
      humanizeCurrency.transform.and.callThrough();
      const popoverSpy = jasmine.createSpyObj('popover', ['present', 'onWillDismiss']);
      popoverSpy.onWillDismiss.and.resolveTo({
        data: {
          action: 'approve',
        },
      });

      popoverController.create.and.resolveTo(popoverSpy);
      approverReportsService.approve.and.returnValue(of(undefined));
      refinerService.startSurvey.and.returnValue(null);

      component.report$ = of(reportWithExpenses);
      component.expenses$ = of(expenseResponseData);
      launchDarklyService.getVariation.and.returnValue(of(true));
      fixture.detectChanges();

      await component.approveReport();

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        componentProps: {
          title: 'Approve Report',
          message: '3 expenses of amount undefined will be approved',
          flaggedExpensesCount: 0,
          primaryCta: {
            text: 'Approve',
            action: 'approve',
          },
          secondaryCta: {
            text: 'Cancel',
            action: 'cancel',
          },
        },
        component: PopupAlertComponent,
        cssClass: 'pop-up-in-center',
      });
      expect(humanizeCurrency.transform).toHaveBeenCalledOnceWith(
        reportWithExpenses.amount,
        reportWithExpenses.currency,
        false
      );
      expect(approverReportsService.approve).toHaveBeenCalledOnceWith(platformReportData.id);
      expect(launchDarklyService.getVariation).toHaveBeenCalledOnceWith('nps_survey', false);
      expect(refinerService.startSurvey).toHaveBeenCalledOnceWith({ actionName: 'Approve Report' });
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'team_reports']);
    });

    it('should toggle tooltip if approval priviledge is not provided', async () => {
      spyOn(component, 'toggleTooltip');
      component.canApprove = false;
      fixture.detectChanges();

      await component.approveReport();
      expect(component.toggleTooltip).toHaveBeenCalledTimes(1);
    });
  });

  it('onUpdateApprover(): should refresh approval on approver update', () => {
    spyOn(component.refreshApprovals$, 'next');

    component.onUpdateApprover(true);
    expect(component.refreshApprovals$.next).toHaveBeenCalledOnceWith(null);
  });

  describe('goToTransaction(): ', () => {
    it('it should go to view EXPENSE page and display the expense', () => {
      component.reportExpensesIds = ['rpDyD26O3qpV', 'rpqzKD4bPXpW'];
      fixture.detectChanges();

      component.goToTransaction({
        expense: expenseData,
        expenseIndex: 0,
      });

      const route = '/enterprise/view_expense';

      expect(trackingService.viewExpenseClicked).toHaveBeenCalledOnceWith({
        view: ExpenseView.team,
        category: expenseData.category.name.toLowerCase(),
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        route,
        {
          id: expenseData.id,
          txnIds: JSON.stringify(component.reportExpensesIds),
          activeIndex: 0,
          view: ExpenseView.team,
        },
      ]);
    });

    it('it should go to view MILEAGE page and display the expense', () => {
      component.reportExpensesIds = ['rpDyD26O3qpV', 'rpqzKD4bPXpW'];
      fixture.detectChanges();

      component.goToTransaction({
        expense: mileageExpense,
        expenseIndex: 0,
      });

      const route = '/enterprise/view_mileage';

      expect(trackingService.viewExpenseClicked).toHaveBeenCalledOnceWith({
        view: ExpenseView.team,
        category: 'mileage',
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        route,
        {
          id: mileageExpense.id,
          txnIds: JSON.stringify(component.reportExpensesIds),
          activeIndex: 0,
          view: ExpenseView.team,
        },
      ]);
    });

    it('it should go to view PER DIEM page and display the expense', () => {
      component.reportExpensesIds = ['rpDyD26O3qpV', 'rpqzKD4bPXpW'];
      fixture.detectChanges();

      component.goToTransaction({
        expense: perDiemExpenseWithSingleNumDays,
        expenseIndex: 0,
      });

      const route = '/enterprise/view_per_diem';

      expect(trackingService.viewExpenseClicked).toHaveBeenCalledOnceWith({
        view: ExpenseView.team,
        category: 'per diem',
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        route,
        {
          id: perDiemExpenseWithSingleNumDays.id,
          txnIds: JSON.stringify(component.reportExpensesIds),
          activeIndex: 0,
          view: ExpenseView.team,
        },
      ]);
    });
  });

  it('sendBack(): should open send back modal', async () => {
    const properties = {
      data: {
        icon: 'check-square-fill',
        showCloseButton: true,
        message: 'Report Sent Back successfully',
      },
      duration: 3000,
    };
    const popoverSpy = jasmine.createSpyObj('popover', ['present', 'onWillDismiss']);
    popoverSpy.onWillDismiss.and.resolveTo({
      data: {
        comment: 'comment',
      },
    });

    popoverController.create.and.resolveTo(popoverSpy);
    approverReportsService.sendBack.and.returnValue(of(undefined));
    snackbarProperties.setSnackbarProperties.and.returnValue(properties);

    await component.sendBack();
    expect(popoverController.create).toHaveBeenCalledOnceWith({
      component: FyPopoverComponent,
      componentProps: {
        title: 'Send Back',
        formLabel: 'Reason for sending back',
      },
      cssClass: 'fy-dialog-popover',
    });
    expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('success', {
      message: 'Report Sent Back successfully',
    });
    expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      ...properties,
      panelClass: ['msb-success-with-camera-icon'],
    });
    expect(approverReportsService.sendBack).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id, 'comment');
    expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
      ToastContent: 'Report Sent Back successfully',
    });
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'team_reports']);
  });

  it('openViewReportInfoModal(): should open report info modal', async () => {
    const viewInfoModalSpy = jasmine.createSpyObj('viewInfoModal', ['onWillDismiss', 'present']);
    viewInfoModalSpy.onWillDismiss.and.resolveTo();

    const properties = {
      cssClass: 'fy-modal',
      showBackdrop: true,
      canDismiss: true,
      backdropDismiss: true,
      animated: true,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      handle: false,
    };

    modalController.create.and.resolveTo(viewInfoModalSpy);
    modalProperties.getModalDefaultProperties.and.returnValue(properties);

    await component.openViewReportInfoModal();
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: FyViewReportInfoComponent,
      componentProps: {
        report$: component.report$,
        expenses$: component.expenses$,
        view: ExpenseView.team,
      },
      ...properties,
    });
    expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
    expect(trackingService.clickViewReportInfo).toHaveBeenCalledOnceWith({ view: ExpenseView.team });
  });

  describe('segmentChanged():', () => {
    it('should show expense tab', () => {
      component.segmentChanged({
        detail: {
          value: 'expenses',
        },
      });

      expect(component.isExpensesView).toBeTrue();
      expect(component.isCommentsView).toBeFalse();
      expect(component.isHistoryView).toBeFalse();

      const expenseTab = fixture.debugElement.query(By.css('.view-reports-expense-card-block'));
      expect(expenseTab).toBeDefined();
    });

    it('should show comments tab', fakeAsync(() => {
      spyOn(component.content, 'scrollToBottom');
      component.segmentChanged({
        detail: {
          value: 'comments',
        },
      });

      tick(1000);
      expect(component.isExpensesView).toBeFalse();
      expect(component.isCommentsView).toBeTrue();
      expect(component.isHistoryView).toBeFalse();
      expect(component.content.scrollToBottom).toHaveBeenCalledOnceWith(500);

      const commentTab = fixture.debugElement.query(By.css('.view-comment--container'));
      expect(commentTab).toBeDefined();
    }));

    it('should show history tab', () => {
      component.segmentChanged({
        detail: {
          value: 'history',
        },
      });

      expect(component.isExpensesView).toBeFalse();
      expect(component.isCommentsView).toBeFalse();
      expect(component.isHistoryView).toBeTrue();

      const historyTab = fixture.debugElement.query(By.css('.view-reports--history-container'));
      expect(historyTab).toBeDefined();
    });
  });

  it('addComment(): should add a comment', () => {
    approverReportsService.postComment.and.returnValue(of(allReportsPaginated1.data[0].comments[0]));
    spyOn(component.content, 'scrollToBottom');
    spyOn(component.refreshApprovals$, 'next');
    component.isCommentsView = true;
    component.newComment = 'comment';
    component.commentInput = fixture.debugElement.query(By.css('.view-comment--text-area'));
    fixture.detectChanges();
    spyOn(component.commentInput.nativeElement, 'focus');

    component.addComment();
    expect(approverReportsService.postComment).toHaveBeenCalledOnceWith(component.objectId, 'comment');
    expect(component.isCommentAdded).toBeTrue();
    expect(component.newComment).toBeNull();
    expect(component.refreshApprovals$.next).toHaveBeenCalledOnceWith(null);
    expect(component.commentInput.nativeElement.focus).toHaveBeenCalledTimes(1);
  });

  it('should send back the report on clicking the SEND BACK button', () => {
    spyOn(component, 'sendBack');
    component.isReportReported = true;
    fixture.detectChanges();

    const sendBackButton = getElementBySelector(fixture, '.view-reports--send-back') as HTMLElement;
    click(sendBackButton);

    expect(component.sendBack).toHaveBeenCalledTimes(1);
  });

  it('should add new comment on clicking the Add Comment button', () => {
    spyOn(component, 'addComment');
    component.isCommentsView = true;
    fixture.detectChanges();

    const addCommentButton = getElementBySelector(fixture, '.view-comment--send-icon') as HTMLElement;
    click(addCommentButton);

    expect(component.addComment).toHaveBeenCalledTimes(1);
  });

  it('should approve the report  on clicking the Approve Report Button', () => {
    spyOn(component, 'approveReport');

    component.permissions$ = of({ ...apiReportPermissions, can_approve: true });
    component.isCommentsView = false;
    component.isReportReported = true;
    fixture.detectChanges();

    const approveReportButton = getElementBySelector(fixture, '.view-reports--primary-cta') as HTMLElement;
    click(approveReportButton);

    expect(component.approveReport).toHaveBeenCalledTimes(1);
  });

  it('should show report information correctly', () => {
    spyOn(component, 'openViewReportInfoModal');
    component.report$ = of(expectedReportsSinglePage[0]);
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.view-reports--employee-name__name'))).toEqual(
      expectedReportsSinglePage[0].employee.user.full_name
    );
    expect(getTextContent(getElementBySelector(fixture, '.view-reports--submitted-date__date'))).toEqual(
      'Feb 01, 2023'
    );
    expect(getTextContent(getElementBySelector(fixture, '.view-reports--purpose-amount-block__amount'))).toEqual(
      '100.00'
    );

    const openButton = getElementBySelector(fixture, '.view-reports--view-info') as HTMLElement;
    click(openButton);

    expect(component.openViewReportInfoModal).toHaveBeenCalledTimes(1);
  });

  it('updateReportName(): should update report name', () => {
    const mockReport = cloneDeep(platformReportData);
    component.report$ = of(mockReport);
    fixture.detectChanges();
    reportService.approverUpdateReportPurpose.and.returnValue(of(platformReportData));
    spyOn(component.loadReportDetails$, 'next');

    component.updateReportName('#3:  Jul 2023 - Office expense');
    expect(reportService.approverUpdateReportPurpose).toHaveBeenCalledOnceWith(mockReport);
    expect(component.loadReportDetails$.next).toHaveBeenCalledTimes(1);
  });

  it('trackReportNameChange(): should track report name change', () => {
    component.eou = null;
    component.trackReportNameChange();
    expect(trackingService.reportNameChange).toHaveBeenCalledOnceWith({
      Time_spent: component.timeSpentOnEditingReportName,
      Roles: null,
    });
  });

  it('trackReportNameChange(): should track report name change', () => {
    component.eou = apiEouRes;
    component.trackReportNameChange();
    expect(trackingService.reportNameChange).toHaveBeenCalledOnceWith({
      Time_spent: component.timeSpentOnEditingReportName,
      Roles: apiEouRes.ou.roles,
    });
  });

  describe('editReportName(): ', () => {
    beforeEach(() => {
      component.report$ = of(cloneDeep({ ...expectedReportsSinglePage[0] }));
      spyOn(component, 'updateReportName').and.returnValue(null);
    });

    it('should edit report name', fakeAsync(() => {
      const editReportNamePopoverSpy = jasmine.createSpyObj('editReportNamePopover', ['present', 'onWillDismiss']);
      editReportNamePopoverSpy.onWillDismiss.and.resolveTo({ data: { reportName: 'new name' } });
      popoverController.create.and.resolveTo(editReportNamePopoverSpy);

      component.editReportName();
      tick(100);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: EditReportNamePopoverComponent,
        componentProps: {
          reportName: expectedReportsSinglePage[0].purpose,
        },
        cssClass: 'fy-dialog-popover',
      });
      expect(component.updateReportName).toHaveBeenCalledOnceWith('new name');
    }));

    it('should not edit report name if data does not contain name', fakeAsync(() => {
      const editReportNamePopoverSpy = jasmine.createSpyObj('editReportNamePopover', ['present', 'onWillDismiss']);
      editReportNamePopoverSpy.onWillDismiss.and.resolveTo();
      popoverController.create.and.resolveTo(editReportNamePopoverSpy);

      component.editReportName();
      tick(100);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: EditReportNamePopoverComponent,
        componentProps: {
          reportName: expectedReportsSinglePage[0].purpose,
        },
        cssClass: 'fy-dialog-popover',
      });
      expect(component.updateReportName).not.toHaveBeenCalled();
    }));
  });
});
