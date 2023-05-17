import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ReportService } from 'src/app/core/services/report.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { NetworkService } from '../../core/services/network.service';
import { TrackingService } from '../../core/services/tracking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { RefinerService } from 'src/app/core/services/refiner.service';
import { StatusService } from 'src/app/core/services/status.service';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { ViewTeamReportPage } from './view-team-report.page';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController, ModalController } from '@ionic/angular';
import {
  etxncListData,
  expenseData1,
  expenseData2,
  perDiemExpenseSingleNumDays,
} from 'src/app/core/mock-data/expense.data';
import { approversData1 } from 'src/app/core/mock-data/approver.data';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { FyViewReportInfoComponent } from 'src/app/shared/components/fy-view-report-info/fy-view-report-info.component';
import { FyPopoverComponent } from 'src/app/shared/components/fy-popover/fy-popover.component';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { ShareReportComponent } from './share-report/share-report.component';

fdescribe('ViewTeamReportPage', () => {
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
      declarations: [ViewTeamReportPage],
      imports: [IonicModule.forRoot()],
      providers: [
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

  it('getShowViolation(): should show expense violation', () => {
    const result = component.getShowViolation(expenseData2);

    expect(result).toBeFalse();
  });

  xit('ionViewWillEnter', () => {});

  it('toggleTooltip(): should toggle tooltip', () => {
    component.canShowTooltip = false;
    fixture.detectChanges();

    component.toggleTooltip();
    expect(component.canShowTooltip).toBeTrue();
  });

  xit('isUserActiveInCurrentSeqApprovalQueue', () => {});

  xit('deleteReport(): should delete report', () => {});

  describe('approveReport(): ', () => {
    it('should open the modal and approve the report', async () => {});

    it('should toggle tooltip if approval privledge', async () => {
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

  it('shareReport(): shoudl open share report modal', async () => {
    const popoverSpy = jasmine.createSpyObj('popover', ['present', 'onWillDismiss']);
    popoverSpy.onWillDismiss.and.returnValue(
      Promise.resolve({
        data: {
          email: 'ajn@fyle.in',
        },
      })
    );
    popoverController.create.and.returnValue(Promise.resolve(popoverSpy));

    reportService.downloadSummaryPdfUrl.and.returnValue(of('encodedcontent'));

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
    reportService.inquire.and.returnValue(of(true));
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

  xit('addComment', () => {});
});
