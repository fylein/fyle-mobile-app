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
import { approversData1, approversData4, approversData5, approversData6 } from 'src/app/core/mock-data/approver.data';
import {
  etxncListData,
  expenseData1,
  expenseData2,
  perDiemExpenseSingleNumDays,
} from 'src/app/core/mock-data/expense.data';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { apiReportActions } from 'src/app/core/mock-data/report-actions.data';
import { expectedAllReports, expectedReportSingleResponse, newReportParam } from 'src/app/core/mock-data/report.data';
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
  expectedNewStatusData,
  newEstatusData1,
  systemComments1,
  systemCommentsWithSt,
} from 'src/app/core/test-data/status.service.spec.data';
import { FyPopoverComponent } from 'src/app/shared/components/fy-popover/fy-popover.component';
import { FyViewReportInfoComponent } from 'src/app/shared/components/fy-view-report-info/fy-view-report-info.component';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { EllipsisPipe } from 'src/app/shared/pipes/ellipses.pipe';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { NetworkService } from '../../core/services/network.service';
import { TrackingService } from '../../core/services/tracking.service';
import { ShareReportComponent } from './share-report/share-report.component';
import { ViewTeamReportPage } from './view-team-report.page';
import { txnStatusData } from 'src/app/core/mock-data/transaction-status.data';
import { pdfExportData1, pdfExportData2 } from 'src/app/core/mock-data/pdf-export.data';
import { EditReportNamePopoverComponent } from '../my-view-report/edit-report-name-popover/edit-report-name-popover.component';
import { cloneDeep } from 'lodash';
import { platformReportData } from 'src/app/core/mock-data/platform-report.data';

describe('ViewTeamReportPage', () => {
  let component: ViewTeamReportPage;
  let fixture: ComponentFixture<ViewTeamReportPage>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let reportService: jasmine.SpyObj<ReportService>;
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
  let refinerService: jasmine.SpyObj<RefinerService>;
  let statusService: jasmine.SpyObj<StatusService>;
  let humanizeCurrency: jasmine.SpyObj<HumanizeCurrencyPipe>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;

  beforeEach(waitForAsync(() => {
    const reportServiceSpy = jasmine.createSpyObj('ReportService', [
      'getReport',
      'getTeamReport',
      'getExports',
      'getApproversByReportId',
      'getReportETxnc',
      'actions',
      'delete',
      'approve',
      'downloadSummaryPdfUrl',
      'inquire',
      'approverUpdateReportPurpose',
    ]);
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
    ]);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const refinerServiceSpy = jasmine.createSpyObj('RefinerService', ['startSurvey', '']);
    const statusServiceSpy = jasmine.createSpyObj('StatusService', ['find', 'createStatusMap', 'post']);
    const humanizeCurrencySpy = jasmine.createSpyObj('HumanizeCurrencyPipe', ['transform']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);

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
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(ViewTeamReportPage);
    component = fixture.componentInstance;

    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
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
    loaderService.showLoader.and.returnValue(Promise.resolve());
    reportService.getReport.and.returnValue(of(expectedAllReports[0]));
    loaderService.hideLoader.and.returnValue(Promise.resolve());

    component
      .loadReports()
      .pipe(
        finalize(() => {
          expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        })
      )
      .subscribe((res) => {
        expect(res).toEqual(expectedAllReports[0]);
        expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
        expect(reportService.getReport).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);
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
      const result = component.getReportClosureSettings({ ...orgSettingsData, getReportClosureSettings: undefined });
      expect(result).toBeUndefined();
    });

    it('should return undefined if org settings are not present', () => {
      const result = component.getReportClosureSettings(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe('ionViewWillEnter():', () => {
    it('should initialize the variables and load reports and statuses', fakeAsync(() => {
      spyOn(component, 'setupNetworkWatcher');
      spyOn(component, 'getApprovalSettings').and.returnValue(true);
      spyOn(component, 'getReportClosureSettings').and.returnValue(true);
      spyOn(component, 'getVendorName');
      spyOn(component, 'getShowViolation');
      spyOn(component, 'isUserActiveInCurrentSeqApprovalQueue').and.returnValue(null);
      loaderService.showLoader.and.returnValue(Promise.resolve());
      spyOn(component, 'loadReports').and.returnValue(of(expectedAllReports[0]));
      loaderService.hideLoader.and.returnValue(Promise.resolve());
      authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
      statusService.find.and.returnValue(of(newEstatusData1));
      orgSettingsService.get.and.returnValue(of(orgSettingsData));
      statusService.createStatusMap.and.returnValue(systemCommentsWithSt);
      reportService.getTeamReport.and.returnValue(of(expectedAllReports[0]));
      reportService.getExports.and.returnValue(
        of({
          results: pdfExportData1,
        })
      );
      reportService.getApproversByReportId.and.returnValue(of(approversData1));
      reportService.getReportETxnc.and.returnValue(of(etxncListData.data));
      reportService.actions.and.returnValue(of(apiReportActions));

      component.ionViewWillEnter();
      tick(2000);

      component.eou$.subscribe((res) => {
        expect(res).toEqual(apiEouRes);
      });

      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
      expect(component.loadReports).toHaveBeenCalledTimes(1);
      expect(authService.getEou).toHaveBeenCalledTimes(2);
      expect(statusService.find).toHaveBeenCalledOnceWith(component.objectType, component.objectId);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(2);

      component.estatuses$.subscribe((res) => {
        expect(res).toEqual(expectedNewStatusData);
      });

      component.simplifyReportsSettings$.subscribe((res) => {
        expect(res).toEqual({
          enabled: true,
        });
      });

      expect(reportService.getTeamReport).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);
      expect(statusService.createStatusMap).toHaveBeenCalledOnceWith(component.systemComments, component.type);

      component.totalCommentsCount$.subscribe((res) => {
        expect(res).toEqual(3);
      });

      component.erpt$.subscribe((res) => {
        expect(res).toEqual(expectedAllReports[0]);
      });

      expect(component.systemComments).toEqual(systemComments1);

      expect(component.objectType).toEqual('reports');

      expect(component.systemEstatuses).toEqual(systemCommentsWithSt);

      expect(component.userComments).toEqual([expectedNewStatusData[2], expectedNewStatusData[3]]);

      expect(reportService.getExports).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);
      expect(reportService.getApproversByReportId).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);

      expect(reportService.getReportETxnc).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id, apiEouRes.ou.id);
      expect(component.getVendorName).toHaveBeenCalledTimes(2);
      expect(component.getVendorName).toHaveBeenCalledWith(etxncListData.data[0]);
      expect(component.getVendorName).toHaveBeenCalledWith(etxncListData.data[1]);
      expect(component.getShowViolation).toHaveBeenCalledTimes(2);
      expect(component.getShowViolation).toHaveBeenCalledWith(etxncListData.data[0]);
      expect(component.getShowViolation).toHaveBeenCalledWith(etxncListData.data[1]);

      component.etxnAmountSum$.subscribe((res) => {
        expect(res).toEqual(310.65);
      });

      component.sharedWith$.subscribe((res) => {
        expect(res).toEqual(['ajain@fyle.in', 'arjun.m@fyle.in']);
      });

      component.reportApprovals$.subscribe((res) => {
        expect(res).toEqual([approversData1[0]]);
      });

      component.actions$.subscribe((res) => {
        expect(res).toEqual(apiReportActions);
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

      expect(reportService.actions).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);
      expect(component.getApprovalSettings).toHaveBeenCalledOnceWith(orgSettingsData);
      expect(component.isUserActiveInCurrentSeqApprovalQueue).toHaveBeenCalledOnceWith(apiEouRes, [approversData1[0]]);

      expect(component.reportEtxnIds).toEqual(['txZ1nfsXb5Xs', 'txnYF8lUl3Sr']);
      expect(component.isSequentialApprovalEnabled).toBeTrue();
      expect(component.canApprove).toBeNull();
      expect(component.canShowTooltip).toBeTrue();
    }));

    it('should load reports when object type is expenses', fakeAsync(() => {
      component.objectType = 'Transactions';
      spyOn(component, 'setupNetworkWatcher');
      spyOn(component, 'getVendorName');
      spyOn(component, 'getShowViolation');
      spyOn(component, 'getApprovalSettings').and.returnValue(false);
      spyOn(component, 'getReportClosureSettings').and.returnValue(true);
      spyOn(component, 'isUserActiveInCurrentSeqApprovalQueue').and.returnValue(null);
      loaderService.showLoader.and.returnValue(Promise.resolve());
      spyOn(component, 'loadReports').and.returnValue(of(expectedAllReports[0]));
      loaderService.hideLoader.and.returnValue(Promise.resolve());
      authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
      statusService.find.and.returnValue(of(newEstatusData1));
      orgSettingsService.get.and.returnValue(of(orgSettingsData));
      statusService.createStatusMap.and.returnValue(systemCommentsWithSt);
      reportService.getTeamReport.and.returnValue(of(expectedAllReports[0]));
      reportService.getExports.and.returnValue(
        of({
          results: pdfExportData2,
        })
      );
      reportService.getApproversByReportId.and.returnValue(of(approversData1));
      reportService.getReportETxnc.and.returnValue(of(etxncListData.data));
      reportService.actions.and.returnValue(of(apiReportActions));
      fixture.detectChanges();

      component.ionViewWillEnter();
      tick(2000);

      component.eou$.subscribe((res) => {
        expect(res).toEqual(apiEouRes);
      });

      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
      expect(component.loadReports).toHaveBeenCalledTimes(1);
      expect(authService.getEou).toHaveBeenCalledTimes(2);
      expect(statusService.find).toHaveBeenCalledOnceWith(component.objectType, component.objectId);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(2);

      component.estatuses$.subscribe((res) => {
        expect(res).toEqual(expectedNewStatusData);
      });

      component.simplifyReportsSettings$.subscribe((res) => {
        expect(res).toEqual({
          enabled: true,
        });
      });

      expect(reportService.getTeamReport).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);
      expect(statusService.createStatusMap).toHaveBeenCalledOnceWith(component.systemComments, component.type);

      component.totalCommentsCount$.subscribe((res) => {
        expect(res).toEqual(3);
      });

      component.erpt$.subscribe((res) => {
        expect(res).toEqual(expectedAllReports[0]);
      });

      expect(component.systemComments).toEqual(systemComments1);

      expect(component.objectType).toEqual('Transactions');

      expect(component.systemEstatuses).toEqual(systemCommentsWithSt);

      expect(component.userComments).toEqual([expectedNewStatusData[2], expectedNewStatusData[3]]);

      expect(reportService.getExports).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);
      expect(reportService.getApproversByReportId).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);

      expect(reportService.getReportETxnc).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id, apiEouRes.ou.id);
      expect(component.getVendorName).toHaveBeenCalledTimes(2);
      expect(component.getVendorName).toHaveBeenCalledWith(etxncListData.data[0]);
      expect(component.getVendorName).toHaveBeenCalledWith(etxncListData.data[1]);
      expect(component.getShowViolation).toHaveBeenCalledTimes(2);
      expect(component.getShowViolation).toHaveBeenCalledWith(etxncListData.data[0]);
      expect(component.getShowViolation).toHaveBeenCalledWith(etxncListData.data[1]);

      component.etxnAmountSum$.subscribe((res) => {
        expect(res).toEqual(310.65);
      });

      component.sharedWith$.subscribe((res) => {
        expect(res).toEqual(['arjun.m@fyle.in', 'ajain@fyle.in']);
      });

      component.reportApprovals$.subscribe((res) => {
        expect(approversData1[0]);
      });

      component.actions$.subscribe((res) => {
        expect(res).toEqual(apiReportActions);
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

      expect(reportService.actions).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);
      expect(component.getApprovalSettings).toHaveBeenCalledOnceWith(orgSettingsData);

      expect(component.reportEtxnIds).toEqual(['txZ1nfsXb5Xs', 'txnYF8lUl3Sr']);
      expect(component.isSequentialApprovalEnabled).toBeFalse();
      expect(component.canApprove).toBeTrue();
      expect(component.canShowTooltip).toBeTrue();
    }));
  });

  it('setupNetworkWatcher(): should setup network watcher', () => {
    networkService.connectivityWatcher.and.returnValue(new EventEmitter(true));
    networkService.isOnline.and.returnValue(of(false));

    component.setupNetworkWatcher();
    expect(networkService.isOnline).toHaveBeenCalledTimes(1);
    expect(networkService.connectivityWatcher).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard']);
  });

  describe('getVendorName():', () => {
    it('should get vendors name from expense', () => {
      const result = component.getVendorName(expenseData1);

      expect(result).toEqual(expenseData1.tx_vendor);
    });

    it("should get vendor's name if the expense is a mileage", () => {
      const result = component.getVendorName(etxncListData.data[0]);

      expect(result).toEqual(etxncListData.data[0].tx_distance + ' ' + etxncListData.data[0].tx_distance_unit);
    });

    it("should get vendor's name if the expense is a per-diem", () => {
      const result = component.getVendorName(perDiemExpenseSingleNumDays);

      expect(result).toEqual(perDiemExpenseSingleNumDays.tx_num_days + ' Days');
    });
  });

  it('getApproverEmails(): should get approver emails', () => {
    const result = component.getApproverEmails(approversData1);

    expect(result).toEqual(['ashutosh.m@fyle.in', '123@fye.in', 'chethan.m+90@fyle.in']);
  });

  describe('getShowViolation():', () => {
    it('should show expense violation', () => {
      const result = component.getShowViolation(expenseData2);

      expect(result).toBeFalse();
    });

    it('should show the policy flag in expense', () => {
      const result = component.getShowViolation({
        ...expenseData2,
        tx_policy_flag: true,
        tx_manual_flag: false,
        tx_policy_amount: '1000',
      });

      expect(result).toBeTrue();
    });
  });

  it('toggleTooltip(): should toggle tooltip', () => {
    component.canShowTooltip = false;
    fixture.detectChanges();

    component.toggleTooltip();
    expect(component.canShowTooltip).toBeTrue();
  });

  describe('isUserActiveInCurrentSeqApprovalQueue(): ', () => {
    it('should check whether the user is active', () => {
      const result = component.isUserActiveInCurrentSeqApprovalQueue(apiEouRes, approversData4);

      expect(result).toBeFalse();
    });

    it('should return false if no approvers match', () => {
      const result = component.isUserActiveInCurrentSeqApprovalQueue(apiEouRes, []);

      expect(result).toBeFalse();
    });

    it('should return whethere the user is active after comparing ranks', () => {
      const result = component.isUserActiveInCurrentSeqApprovalQueue(apiEouRes, approversData5);

      expect(result).toBeTrue();
    });

    it("should return false when approver's rank less than minimum rank", () => {
      const result = component.isUserActiveInCurrentSeqApprovalQueue(apiEouRes, approversData6);

      expect(result).toBeFalse();
    });
  });

  it('deleteReport(): should delete report', async () => {
    popupService.showPopup.and.returnValue(Promise.resolve('primary'));
    loaderService.showLoader.and.returnValue(Promise.resolve());
    reportService.delete.and.returnValue(of(undefined));
    loaderService.hideLoader.and.returnValue(Promise.resolve());

    await component.deleteReport();

    expect(popupService.showPopup).toHaveBeenCalledOnceWith({
      header: 'Delete Report',
      message: `
        <p class="highlight-info">
          On deleting this report, all the associated expenses will be moved to <strong>My Expenses</strong> list.
        </p>
        <p>
          Are you sure, you want to delete this report?
        </p>
      `,
      primaryCta: {
        text: 'Delete Report',
      },
    });
    expect(reportService.delete).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);
    expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'team_reports']);
  });

  describe('approveReport(): ', () => {
    it('should open the modal and approve the report', async () => {
      humanizeCurrency.transform.and.callThrough();
      const popoverSpy = jasmine.createSpyObj('popover', ['present', 'onWillDismiss']);
      popoverSpy.onWillDismiss.and.returnValue(
        Promise.resolve({
          data: {
            action: 'approve',
          },
        })
      );

      popoverController.create.and.returnValue(Promise.resolve(popoverSpy));
      reportService.approve.and.returnValue(of(undefined));
      refinerService.startSurvey.and.returnValue(null);

      component.erpt$ = of(expectedReportSingleResponse);
      component.etxns$ = of(etxncListData.data);
      fixture.detectChanges();

      await component.approveReport();

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        componentProps: {
          etxns: etxncListData.data,
          title: 'Approve Report',
          message: '3 expenses of amount undefined will be approved',
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
        expectedReportSingleResponse.rp_amount,
        expectedReportSingleResponse.rp_currency,
        false
      );
      expect(reportService.approve).toHaveBeenCalledOnceWith(expectedReportSingleResponse.rp_id);
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
      component.reportEtxnIds = ['rpDyD26O3qpV', 'rpqzKD4bPXpW'];
      fixture.detectChanges();

      component.goToTransaction({
        etxn: expenseData1,
        etxnIndex: 0,
      });

      const route = '/enterprise/view_expense';

      expect(trackingService.viewExpenseClicked).toHaveBeenCalledOnceWith({
        view: ExpenseView.team,
        category: 'groceries',
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        route,
        {
          id: expenseData1.tx_id,
          txnIds: JSON.stringify(component.reportEtxnIds),
          activeIndex: 0,
          view: ExpenseView.team,
        },
      ]);
    });

    it('it should go to view MILEAGE page and display the expense', () => {
      component.reportEtxnIds = ['rpDyD26O3qpV', 'rpqzKD4bPXpW'];
      fixture.detectChanges();

      component.goToTransaction({
        etxn: etxncListData.data[0],
        etxnIndex: 0,
      });

      const route = '/enterprise/view_mileage';

      expect(trackingService.viewExpenseClicked).toHaveBeenCalledOnceWith({
        view: ExpenseView.team,
        category: 'mileage',
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        route,
        {
          id: etxncListData.data[0].tx_id,
          txnIds: JSON.stringify(component.reportEtxnIds),
          activeIndex: 0,
          view: ExpenseView.team,
        },
      ]);
    });

    it('it should go to view PER DIEM page and display the expense', () => {
      component.reportEtxnIds = ['rpDyD26O3qpV', 'rpqzKD4bPXpW'];
      fixture.detectChanges();

      component.goToTransaction({
        etxn: perDiemExpenseSingleNumDays,
        etxnIndex: 0,
      });

      const route = '/enterprise/view_per_diem';

      expect(trackingService.viewExpenseClicked).toHaveBeenCalledOnceWith({
        view: ExpenseView.team,
        category: 'per diem',
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        route,
        {
          id: perDiemExpenseSingleNumDays.tx_id,
          txnIds: JSON.stringify(component.reportEtxnIds),
          activeIndex: 0,
          view: ExpenseView.team,
        },
      ]);
    });
  });

  it('shareReport(): should open share report modal', async () => {
    const popoverSpy = jasmine.createSpyObj('popover', ['present', 'onWillDismiss']);
    popoverSpy.onWillDismiss.and.returnValue(
      Promise.resolve({
        data: {
          email: 'ajn@fyle.in',
        },
      })
    );
    popoverController.create.and.returnValue(Promise.resolve(popoverSpy));

    reportService.downloadSummaryPdfUrl.and.returnValue(of({ report_url: 'encodedcontent' }));

    await component.shareReport(new Event('event'));
    expect(popoverController.create).toHaveBeenCalledOnceWith({
      component: ShareReportComponent,
      cssClass: 'dialog-popover',
    });
    expect(reportService.downloadSummaryPdfUrl).toHaveBeenCalledOnceWith({
      report_ids: [activatedRoute.snapshot.params.id],
      email: 'ajn@fyle.in',
    });
    expect(loaderService.showLoader).toHaveBeenCalledOnceWith(
      'We will send ajn@fyle.in a link to download the PDF <br> when it is generated and send you a copy.'
    );
  });

  it('sendBack(): should open send back modal', async () => {
    const properties = {
      data: {
        icon: 'tick-square-filled',
        showCloseButton: true,
        message: 'Report Sent Back successfully',
      },
      duration: 3000,
    };
    const popoverSpy = jasmine.createSpyObj('popover', ['present', 'onWillDismiss']);
    popoverSpy.onWillDismiss.and.returnValue(
      Promise.resolve({
        data: {
          comment: 'comment',
        },
      })
    );

    popoverController.create.and.returnValue(Promise.resolve(popoverSpy));
    reportService.inquire.and.returnValue(of(undefined));
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
    expect(reportService.inquire).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id, {
      status: {
        comment: 'comment',
      },
      notify: false,
    });
    expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
      ToastContent: 'Report Sent Back successfully',
    });
    expect(refinerService.startSurvey).toHaveBeenCalledOnceWith({ actionName: 'Send Back Report' });
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'team_reports']);
  });

  it('openViewReportInfoModal(): should open report info modal', async () => {
    const viewInfoModalSpy = jasmine.createSpyObj('viewInfoModal', ['onWillDismiss', 'present']);
    viewInfoModalSpy.onWillDismiss.and.returnValue(Promise.resolve());

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

    modalController.create.and.returnValue(Promise.resolve(viewInfoModalSpy));
    modalProperties.getModalDefaultProperties.and.returnValue(properties);

    await component.openViewReportInfoModal();
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: FyViewReportInfoComponent,
      componentProps: {
        erpt$: component.erpt$,
        etxns$: component.etxns$,
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
    statusService.post.and.returnValue(of(txnStatusData));
    spyOn(component.content, 'scrollToBottom');
    spyOn(component.refreshEstatuses$, 'next');
    component.isCommentsView = true;
    component.newComment = 'comment';
    component.commentInput = fixture.debugElement.query(By.css('.view-comment--text-area'));
    fixture.detectChanges();
    spyOn(component.commentInput.nativeElement, 'focus');

    component.addComment();
    expect(statusService.post).toHaveBeenCalledOnceWith(component.objectType, component.objectId, {
      comment: 'comment',
    });
    expect(component.isCommentAdded).toBeTrue();
    expect(component.newComment).toBeNull();
    expect(component.commentInput.nativeElement.focus).toHaveBeenCalledTimes(1);
    expect(component.refreshEstatuses$.next).toHaveBeenCalledTimes(1);
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

    component.actions$ = of({ ...apiReportActions, can_approve: true });
    component.isCommentsView = false;
    component.isReportReported = true;
    fixture.detectChanges();

    const approveReportButton = getElementBySelector(fixture, '.view-reports--primary-cta') as HTMLElement;
    click(approveReportButton);

    expect(component.approveReport).toHaveBeenCalledTimes(1);
  });

  it('should show report information correctly', () => {
    spyOn(component, 'openViewReportInfoModal');
    component.erpt$ = of(expectedAllReports[0]);
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.view-reports--employee-name__name'))).toEqual(
      expectedAllReports[0].us_full_name
    );
    expect(getTextContent(getElementBySelector(fixture, '.view-reports--submitted-date__date'))).toEqual(
      'Feb 01, 2023'
    );
    expect(getTextContent(getElementBySelector(fixture, '.view-reports--purpose-amount-block__amount'))).toEqual(
      '0.00'
    );

    const openButton = getElementBySelector(fixture, '.view-reports--view-info') as HTMLElement;
    click(openButton);

    expect(component.openViewReportInfoModal).toHaveBeenCalledTimes(1);
  });

  it('updateReportName(): should update report name', () => {
    component.erpt$ = of(newReportParam);
    fixture.detectChanges();
    reportService.approverUpdateReportPurpose.and.returnValue(of(platformReportData));
    spyOn(component.loadReportDetails$, 'next');

    component.updateReportName('#3:  Jul 2023 - Office expense');
    expect(reportService.approverUpdateReportPurpose).toHaveBeenCalledOnceWith(newReportParam);
    expect(component.loadReportDetails$.next).toHaveBeenCalledTimes(1);
  });

  describe('editReportName(): ', () => {
    it('should edit report name', fakeAsync(() => {
      component.erpt$ = of(cloneDeep({ ...expectedAllReports[0] }));
      component.canEdit$ = of(true);
      fixture.detectChanges();

      spyOn(component, 'updateReportName').and.returnValue(null);

      const editReportNamePopoverSpy = jasmine.createSpyObj('editReportNamePopover', ['present', 'onWillDismiss']);
      editReportNamePopoverSpy.onWillDismiss.and.resolveTo({ data: { reportName: 'new name' } });

      popoverController.create.and.returnValue(Promise.resolve(editReportNamePopoverSpy));

      const editReportButton = getElementBySelector(fixture, '.view-reports--card ion-icon') as HTMLElement;
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
      component.erpt$ = of(cloneDeep({ ...expectedAllReports[0] }));
      component.canEdit$ = of(true);
      fixture.detectChanges();

      spyOn(component, 'updateReportName').and.returnValue(null);

      const editReportNamePopoverSpy = jasmine.createSpyObj('editReportNamePopover', ['present', 'onWillDismiss']);
      editReportNamePopoverSpy.onWillDismiss.and.resolveTo();

      popoverController.create.and.returnValue(Promise.resolve(editReportNamePopoverSpy));

      const editReportButton = getElementBySelector(fixture, '.view-reports--card ion-icon') as HTMLElement;
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
});
