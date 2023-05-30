import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { ReportService } from 'src/app/core/services/report.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NetworkService } from '../../core/services/network.service';
import { TrackingService } from '../../core/services/tracking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { StatusService } from 'src/app/core/services/status.service';
import { RefinerService } from 'src/app/core/services/refiner.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { MyViewReportPage } from './my-view-report.page';
import { ActivatedRoute, Router, UrlSerializer } from '@angular/router';
import { PopoverController, ModalController } from '@ionic/angular';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatIconModule } from '@angular/material/icon';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { FyViewReportInfoComponent } from 'src/app/shared/components/fy-view-report-info/fy-view-report-info.component';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import {
  expenseData1,
  etxncListData,
  perDiemExpenseSingleNumDays,
  expenseData2,
} from 'src/app/core/mock-data/expense.data';
import { expensesWithDependentFields } from 'src/app/core/mock-data/dependent-field-expenses.data';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { expectedAllReports, reportParam } from 'src/app/core/mock-data/report.data';
import { EllipsisPipe } from 'src/app/shared/pipes/ellipses.pipe';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { CurrencyPipe } from '@angular/common';
import { apiReportUpdatedDetails } from 'src/app/core/mock-data/report-v1.data';
import { ShareReportComponent } from './share-report/share-report.component';
import { EditReportNamePopoverComponent } from './edit-report-name-popover/edit-report-name-popover.component';
import { AddExpensesToReportComponent } from './add-expenses-to-report/add-expenses-to-report.component';
import { By } from '@angular/platform-browser';
import { ReportPageSegment } from 'src/app/core/enums/report-page-segment.enum';

describe('MyViewReportPage', () => {
  let component: MyViewReportPage;
  let fixture: ComponentFixture<MyViewReportPage>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let reportService: jasmine.SpyObj<ReportService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
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
      'delete',
      'submit',
      'resubmit',
      'downloadSummaryPdfUrl',
      'addTransactions',
    ]);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['getAllETxnc', 'getAllExpenses']);
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
    ]);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const statusServiceSpy = jasmine.createSpyObj('StatusService', ['find', 'createStatusMap', 'post']);
    const refinerServiceSpy = jasmine.createSpyObj('RefinerService', ['startSurvey']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);

    TestBed.configureTestingModule({
      declarations: [MyViewReportPage, EllipsisPipe, HumanizeCurrencyPipe],
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
          provide: TransactionService,
          useValue: transactionServiceSpy,
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
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
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

    component.ionViewWillLeave();
    expect(component.onPageExit.next).toHaveBeenCalledOnceWith(null);
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

  xit('ionViewWillEnter', () => {});

  it('updateReportName(): should update report name', () => {
    component.erpt$ = of(reportParam);
    fixture.detectChanges();
    reportService.updateReportDetails.and.returnValue(of(apiReportUpdatedDetails));
    spyOn(component.loadReportDetails$, 'next');

    component.updateReportName('new report');
    expect(reportService.updateReportDetails).toHaveBeenCalledOnceWith(reportParam);
    expect(component.loadReportDetails$.next).toHaveBeenCalledTimes(1);
  });

  it('editReportName(): shoudl edit report name', fakeAsync(() => {
    component.erpt$ = of(expectedAllReports[0]);
    fixture.detectChanges();

    spyOn(component, 'updateReportName').and.returnValue(null);

    const editReportNamePopoverSpy = jasmine.createSpyObj('editReportNamePopover', ['present', 'onWillDismiss']);
    editReportNamePopoverSpy.onWillDismiss.and.resolveTo({ data: { reportName: 'new name' } });

    popoverController.create.and.returnValue(Promise.resolve(editReportNamePopoverSpy));

    component.editReportName();
    tick(5000);

    expect(popoverController.create).toHaveBeenCalledOnceWith({
      component: EditReportNamePopoverComponent,
      componentProps: {
        reportName: expectedAllReports[0].rp_purpose,
      },
      cssClass: 'fy-dialog-popover',
    });
    expect(component.updateReportName).toHaveBeenCalledOnceWith('new name');
  }));

  it('deleteReport(): should delete report', () => {
    component.erpt$ = of(expectedAllReports[0]);
    fixture.detectChanges();
    spyOn(component, 'deleteReportPopup').and.returnValue(null);

    component.deleteReport();

    expect(component.deleteReportPopup).toHaveBeenCalledOnceWith(expectedAllReports[0]);
  });

  xit('deleteReportPopup', () => {});

  it('resubmitReport(): should resubmit report', () => {
    const properties = {
      data: {
        icon: 'tick-square-filled',
        showCloseButton: true,
        message: 'Report resubmitted successfully.',
      },
      duration: 3000,
    };
    reportService.resubmit.and.returnValue(of(null));
    matSnackBar.openFromComponent.and.callThrough();
    snackbarProperties.setSnackbarProperties.and.returnValue(properties);

    component.resubmitReport();

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
    const properties = {
      data: {
        icon: 'tick-square-filled',
        showCloseButton: true,
        message: 'Report submitted successfully.',
      },
      duration: 3000,
    };
    reportService.submit.and.returnValue(of(null));
    matSnackBar.openFromComponent.and.callThrough();
    snackbarProperties.setSnackbarProperties.and.returnValue(properties);

    component.submitReport();

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
    it('should go to view expense page', () => {
      component.goToTransaction({
        etxn: expenseData1,
        etxnIndex: 0,
      });

      const route = '/enterprise/view_expense';

      expect(trackingService.viewExpenseClicked).toHaveBeenCalledOnceWith({
        view: ExpenseView.individual,
        category: expenseData1.tx_org_category.toLowerCase(),
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        route,
        {
          id: expenseData1.tx_id,
          txnIds: JSON.stringify(component.reportEtxnIds),
          activeIndex: 0,
          view: ExpenseView.individual,
        },
      ]);
    });
    it('should go to view edit expense page', () => {
      component.erpt$ = of(expectedAllReports[0]);

      component.canEditTxn = () => true;
      fixture.detectChanges();
      component.goToTransaction({
        etxn: expenseData1,
        etxnIndex: 0,
      });

      const route = '/enterprise/add_edit_expense';

      expect(router.navigate).toHaveBeenCalledOnceWith([
        route,
        {
          id: expenseData1.tx_id,
          navigate_back: true,
          remove_from_report: expectedAllReports[0].rp_num_transactions > 1,
        },
      ]);
    });

    it('should go to view mileage page', () => {
      component.goToTransaction({
        etxn: etxncListData.data[0],
        etxnIndex: 0,
      });

      const route = '/enterprise/view_mileage';

      expect(trackingService.viewExpenseClicked).toHaveBeenCalledOnceWith({
        view: ExpenseView.individual,
        category: etxncListData.data[0].tx_org_category.toLowerCase(),
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        route,
        {
          id: etxncListData.data[0].tx_id,
          txnIds: JSON.stringify(component.reportEtxnIds),
          activeIndex: 0,
          view: ExpenseView.individual,
        },
      ]);
    });

    it('should go to edit mileage page', () => {
      component.erpt$ = of(expectedAllReports[0]);

      component.canEditTxn = () => true;
      fixture.detectChanges();
      component.goToTransaction({
        etxn: etxncListData.data[0],
        etxnIndex: 0,
      });

      const route = '/enterprise/add_edit_mileage';

      expect(router.navigate).toHaveBeenCalledOnceWith([
        route,
        {
          id: etxncListData.data[0].tx_id,
          navigate_back: true,
          remove_from_report: expectedAllReports[0].rp_num_transactions > 1,
        },
      ]);
    });

    it('should go to view per diem page', () => {
      const perDiemTxn = { ...expenseData1, tx_org_category: 'PER DIEM' };
      component.goToTransaction({
        etxn: perDiemTxn,
        etxnIndex: 0,
      });

      const route = '/enterprise/view_per_diem';

      expect(trackingService.viewExpenseClicked).toHaveBeenCalledOnceWith({
        view: ExpenseView.individual,
        category: perDiemTxn.tx_org_category.toLowerCase(),
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        route,
        {
          id: perDiemTxn.tx_id,
          txnIds: JSON.stringify(component.reportEtxnIds),
          activeIndex: 0,
          view: ExpenseView.individual,
        },
      ]);
    });

    it('should go to edit per diem page', () => {
      const perDiemTxn = { ...expenseData1, tx_org_category: 'PER DIEM' };
      component.erpt$ = of(expectedAllReports[0]);

      component.canEditTxn = () => true;
      fixture.detectChanges();
      component.goToTransaction({
        etxn: perDiemTxn,
        etxnIndex: 0,
      });

      const route = '/enterprise/add_edit_per_diem';

      expect(router.navigate).toHaveBeenCalledOnceWith([
        route,
        {
          id: perDiemTxn.tx_id,
          navigate_back: true,
          remove_from_report: expectedAllReports[0].rp_num_transactions > 1,
        },
      ]);
    });
  });

  it('shareReport(): should share report', async () => {
    const properties = {
      cssClass: 'share-report-modal',
      showBackdrop: true,
      canDismiss: true,
      backdropDismiss: true,
      animated: true,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      handle: false,
    };
    const snackbarPropertiesData = {
      data: {
        icon: 'tick-square-filled',
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
    modalProperties.getModalDefaultProperties.and.returnValue(properties);
    snackbarProperties.setSnackbarProperties.and.returnValue(snackbarPropertiesData);

    await component.shareReport();

    expect(trackingService.clickShareReport).toHaveBeenCalledTimes(1);
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: ShareReportComponent,
      mode: 'ios',
      ...properties,
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
        view: ExpenseView.individual,
      },
      ...properties,
    });
    expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
    expect(trackingService.clickViewReportInfo).toHaveBeenCalledOnceWith({ view: ExpenseView.individual });
  });

  describe('canEditTxn():', () => {
    it('should show whether the user can edit txn', () => {
      component.canEdit$ = of(true);
      fixture.detectChanges();

      const result = component.canEditTxn('DRAFT');
      expect(result).toBeTrue();
    });

    it('should show that the user cannot edit the txn', () => {
      component.canEdit$ = of(false);
      fixture.detectChanges();

      const result = component.canEditTxn('SENT_BACK');
      expect(result).toBeFalse();
    });

    it('should show that the user cannot edit the txn if state does not match', () => {
      component.canEdit$ = of(true);
      fixture.detectChanges();

      const result = component.canEditTxn('SENT_BACK');
      expect(result).toBeFalse();
    });
  });

  it('segmentChanged(): should change segment value', () => {
    component.segmentChanged({
      detail: {
        value: '100',
      },
    });

    expect(component.segmentValue).toEqual(parseInt('100', 10));
  });

  it('addComment(): should add a comment', fakeAsync(() => {
    statusService.post.and.returnValue(of(true));
    spyOn(component.content, 'scrollToBottom');
    spyOn(component.refreshEstatuses$, 'next');
    component.newComment = 'comment';
    component.segmentValue = ReportPageSegment.COMMENTS;
    component.commentInput = fixture.debugElement.query(By.css('.view-comment--text-area'));
    fixture.detectChanges();
    spyOn(component.commentInput.nativeElement, 'focus');

    component.addComment();
    tick(5000);
    expect(statusService.post).toHaveBeenCalledOnceWith(component.objectType, component.reportId, {
      comment: 'comment',
    });
    expect(component.newComment).toBeNull();
    expect(component.isCommentAdded).toBeTrue();
    expect(component.content.scrollToBottom).toHaveBeenCalledOnceWith(500);
    expect(component.refreshEstatuses$.next).toHaveBeenCalledTimes(1);
  }));

  it('addExpense(): should navigate to expense page', () => {
    component.addExpense();

    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'add_edit_expense',
      { rp_id: component.reportId },
    ]);
  });

  it('showAddExpensesToReportModal(): should show modal to add expense to report', fakeAsync(() => {
    const addExpensesToReportModalSpy = jasmine.createSpyObj('addExpensesToReportModal', ['onWillDismiss', 'present']);
    addExpensesToReportModalSpy.onWillDismiss.and.resolveTo({
      data: {
        selectedTxnIds: ['txfCdl3TEZ7K', 'txWphhAUZbq7'],
      },
    });

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

    modalController.create.and.returnValue(Promise.resolve(addExpensesToReportModalSpy));
    modalProperties.getModalDefaultProperties.and.returnValue(properties);
    spyOn(component, 'addEtxnsToReport').and.returnValue(null);

    component.showAddExpensesToReportModal();
    tick(5000);

    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: AddExpensesToReportComponent,
      componentProps: {
        unReportedEtxns: component.unReportedEtxns,
        reportId: component.reportId,
      },
      mode: 'ios',
      ...properties,
    });
    expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
    expect(component.addEtxnsToReport).toHaveBeenCalledOnceWith(['txfCdl3TEZ7K', 'txWphhAUZbq7']);
  }));

  it('addEtxnsToReport(): should add txns to report', () => {
    component.reportId = 'rpFkJ6jUJOyg';
    component.unReportedEtxns = expensesWithDependentFields;
    fixture.detectChanges();
    reportService.addTransactions.and.returnValue(of(null));

    spyOn(component.loadReportDetails$, 'next');
    spyOn(component.loadReportTxns$, 'next');

    component.addEtxnsToReport(['txfCdl3TEZ7K', 'tx3qHxFNgRcZ']);
    expect(reportService.addTransactions).toHaveBeenCalledOnceWith('rpFkJ6jUJOyg', ['txfCdl3TEZ7K', 'tx3qHxFNgRcZ']);
    expect(component.loadReportDetails$.next).toHaveBeenCalledTimes(1);
    expect(component.loadReportTxns$.next).toHaveBeenCalledTimes(1);
    expect(component.unReportedEtxns).toEqual([expensesWithDependentFields[1]]);
  });
});
