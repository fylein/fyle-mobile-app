import { Component, ElementRef, EventEmitter, ViewChild } from '@angular/core';
import { ExtendedReport } from 'src/app/core/models/report.model';
import { Observable, from, noop, concat, Subject, BehaviorSubject } from 'rxjs';
import { ReportService } from 'src/app/core/services/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, shareReplay, takeUntil, tap, startWith, take, finalize } from 'rxjs/operators';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { PopoverController, ModalController, IonContent, SegmentCustomEvent } from '@ionic/angular';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { ShareReportComponent } from './share-report/share-report.component';
import { NetworkService } from '../../core/services/network.service';
import { TrackingService } from '../../core/services/tracking.service';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { getCurrencySymbol } from '@angular/common';
import { FyViewReportInfoComponent } from 'src/app/shared/components/fy-view-report-info/fy-view-report-info.component';
import { EditReportNamePopoverComponent } from './edit-report-name-popover/edit-report-name-popover.component';
import * as dayjs from 'dayjs';
import { StatusService } from 'src/app/core/services/status.service';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';
import { AddExpensesToReportComponent } from './add-expenses-to-report/add-expenses-to-report.component';
import { cloneDeep } from 'lodash';
import { RefinerService } from 'src/app/core/services/refiner.service';
import { Expense } from 'src/app/core/models/expense.model';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { ReportPageSegment } from 'src/app/core/enums/report-page-segment.enum';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { Approver } from 'src/app/core/models/v1/approver.model';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
@Component({
  selector: 'app-my-view-report',
  templateUrl: './my-view-report.page.html',
  styleUrls: ['./my-view-report.page.scss'],
})
export class MyViewReportPage {
  @ViewChild('commentInput') commentInput: ElementRef<HTMLInputElement>;

  @ViewChild(IonContent, { static: false }) content: IonContent;

  erpt$: Observable<ExtendedReport>;

  etxns$: Observable<Expense[]>;

  reportApprovals$: Observable<Approver[]>;

  canEdit$: Observable<boolean>;

  canDelete$: Observable<boolean>;

  canResubmitReport$: Observable<boolean>;

  navigateBack = false;

  isConnected$: Observable<boolean>;

  onPageExit = new Subject();

  reportCurrencySymbol = '';

  estatuses$: Observable<ExtendedStatus[]>;

  refreshEstatuses$: Subject<void> = new Subject();

  systemComments: ExtendedStatus[];

  type: string;

  systemEstatuses: ExtendedStatus[];

  userComments: ExtendedStatus[];

  totalCommentsCount$: Observable<number>;

  newComment: string;

  objectType = 'reports';

  isCommentAdded: boolean;

  unReportedEtxns: Expense[];

  reportEtxnIds: string[];

  isExpensesLoading: boolean;

  reportId: string;

  loadReportDetails$ = new BehaviorSubject<void>(null);

  loadReportTxns$ = new BehaviorSubject<void>(null);

  segmentValue = ReportPageSegment.EXPENSES;

  simplifyReportsSettings$: Observable<{ enabled: boolean }>;

  eou: ExtendedOrgUser;

  reportNameChangeStartTime: number;

  reportNameChangeEndTime: number;

  timeSpentOnEditingReportName: number;

  constructor(
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
    private transactionService: TransactionService,
    private authService: AuthService,
    private loaderService: LoaderService,
    private router: Router,
    private popoverController: PopoverController,
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private networkService: NetworkService,
    private trackingService: TrackingService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private statusService: StatusService,
    private refinerService: RefinerService,
    private orgSettingsService: OrgSettingsService
  ) {}

  get Segment(): typeof ReportPageSegment {
    return ReportPageSegment;
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      takeUntil(this.onPageExit),
      shareReplay(1)
    );

    this.isConnected$.subscribe((isOnline) => {
      if (!isOnline) {
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
      }
    });
  }

  ionViewWillLeave(): void {
    this.onPageExit.next(null);
  }

  getVendorName(etxn: Expense): string {
    const category = etxn.tx_org_category && etxn.tx_org_category.toLowerCase();
    let vendorName = etxn.tx_vendor || 'Expense';

    if (category === 'mileage') {
      vendorName = (etxn.tx_distance || 0).toString();
      vendorName += ' ' + etxn.tx_distance_unit;
    } else if (category === 'per diem') {
      vendorName = (etxn.tx_num_days || 0).toString();
      vendorName += ' Days';
    }

    return vendorName;
  }

  getShowViolation(etxn: Expense): boolean {
    return (
      etxn.tx_id &&
      (etxn.tx_manual_flag || etxn.tx_policy_flag) &&
      !(typeof etxn.tx_policy_amount === 'number' && etxn.tx_policy_amount < 0.0001)
    );
  }

  getSimplifyReportSettings(orgSettings: OrgSettings): boolean {
    return orgSettings?.simplified_report_closure_settings?.enabled;
  }

  ionViewWillEnter(): void {
    this.setupNetworkWatcher();
    this.reportId = this.activatedRoute.snapshot.params.id as string;
    this.navigateBack = !!this.activatedRoute.snapshot.params.navigateBack;

    this.segmentValue = ReportPageSegment.EXPENSES;

    this.erpt$ = this.loadReportDetails$.pipe(
      tap(() => this.loaderService.showLoader()),
      switchMap(() =>
        this.reportService.getReport(this.reportId).pipe(finalize(() => this.loaderService.hideLoader()))
      ),
      shareReplay(1)
    );
    const eou$ = from(this.authService.getEou());

    eou$.subscribe((eou) => (this.eou = eou));

    this.estatuses$ = this.refreshEstatuses$.pipe(
      startWith(0),
      switchMap(() => eou$),
      switchMap((eou) =>
        this.statusService.find(this.objectType, this.reportId).pipe(
          map((res) =>
            res.map((status) => {
              status.isBotComment = status && ['SYSTEM', 'POLICY'].indexOf(status.st_org_user_id) > -1;
              status.isSelfComment = status && eou && eou.ou && status.st_org_user_id === eou.ou.id;
              status.isOthersComment = status && eou && eou.ou && status.st_org_user_id !== eou.ou.id;
              return status;
            })
          ),
          map((res) => res.sort((a, b) => a.st_created_at.valueOf() - b.st_created_at.valueOf()))
        )
      )
    );

    this.estatuses$.subscribe((estatuses) => {
      this.systemComments = estatuses.filter((status) => ['SYSTEM', 'POLICY'].indexOf(status.st_org_user_id) > -1);

      this.type =
        this.objectType.toLowerCase() === 'transactions'
          ? 'Expense'
          : this.objectType.substring(0, this.objectType.length - 1);

      this.systemEstatuses = this.statusService.createStatusMap(this.systemComments, this.type);

      this.userComments = estatuses.filter((status) => status.us_full_name);

      for (let i = 0; i < this.userComments.length; i++) {
        const prevCommentDt = dayjs(this.userComments[i - 1] && this.userComments[i - 1].st_created_at);
        const currentCommentDt = dayjs(this.userComments[i] && this.userComments[i].st_created_at);
        if (dayjs(prevCommentDt).isSame(currentCommentDt, 'day')) {
          this.userComments[i].show_dt = false;
        } else {
          this.userComments[i].show_dt = true;
        }
      }
    });

    this.totalCommentsCount$ = this.estatuses$.pipe(
      map((res) => res.filter((estatus) => estatus.st_org_user_id !== 'SYSTEM').length)
    );

    this.erpt$.pipe(take(1)).subscribe((erpt) => {
      this.reportCurrencySymbol = getCurrencySymbol(erpt?.rp_currency, 'wide');

      //For sent back reports, show the comments section instead of expenses when opening the report
      if (erpt?.rp_state === 'APPROVER_INQUIRY') {
        this.segmentValue = ReportPageSegment.COMMENTS;
      }
    });

    this.reportApprovals$ = this.reportService
      .getApproversByReportId(this.reportId)
      .pipe(map((reportApprovals) => reportApprovals));

    this.etxns$ = this.loadReportTxns$.pipe(
      tap(() => (this.isExpensesLoading = true)),
      switchMap(() => this.authService.getEou()),
      switchMap((eou) =>
        this.transactionService
          .getAllETxnc({
            tx_org_user_id: 'eq.' + eou.ou.id,
            tx_report_id: 'eq.' + this.reportId,
            order: 'tx_txn_dt.desc,tx_id.desc',
          })
          .pipe(finalize(() => (this.isExpensesLoading = false)))
      ),
      map((etxns) =>
        etxns.map((etxn) => {
          etxn.vendor = this.getVendorName(etxn);
          etxn.violation = this.getShowViolation(etxn);
          return etxn;
        })
      ),
      shareReplay(1)
    );

    const actions$ = this.reportService.actions(this.reportId).pipe(shareReplay(1));

    this.canEdit$ = actions$.pipe(map((actions) => actions.can_edit));
    this.canDelete$ = actions$.pipe(map((actions) => actions.can_delete));
    this.canResubmitReport$ = actions$.pipe(map((actions) => actions.can_resubmit));

    this.etxns$.subscribe((etxns) => (this.reportEtxnIds = etxns.map((etxn) => etxn.tx_id)));

    const queryParams = {
      tx_report_id: 'is.null',
      tx_state: 'in.(COMPLETE)',
      order: 'tx_txn_dt.desc',
      or: ['(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)'],
    };

    this.transactionService
      .getAllExpenses({ queryParams })
      .pipe(
        map((etxns) => cloneDeep(etxns)),
        map((etxns: Expense[]) => {
          etxns.forEach((etxn, i) => {
            etxn.vendorDetails = this.getVendorName(etxn);
            etxn.showDt = true;
            etxn.isSelected = false;
            if (i > 0 && etxn.tx_txn_dt === etxns[i - 1].tx_txn_dt) {
              etxn.showDt = false;
            }
          });
          this.unReportedEtxns = etxns;
        })
      )
      .subscribe(noop);

    const orgSettings$ = this.orgSettingsService.get();
    this.simplifyReportsSettings$ = orgSettings$.pipe(
      map((orgSettings) => ({ enabled: this.getSimplifyReportSettings(orgSettings) }))
    );
  }

  trackReportNameChange(): void {
    this.reportNameChangeEndTime = new Date().getTime();
    this.timeSpentOnEditingReportName = (this.reportNameChangeEndTime - this.reportNameChangeStartTime) / 1000;
    this.trackingService.reportNameChange({
      Time_spent: this.timeSpentOnEditingReportName,
      Roles: this.eou?.ou.roles,
    });
  }

  showReportNameChangeSuccessToast(): void {
    const message = 'Report name changed successfully.';
    this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties('success', { message }),
      panelClass: ['msb-success'],
    });
    this.trackingService.showToastMessage({ ToastContent: message });
  }

  updateReportName(reportName: string): void {
    this.erpt$
      .pipe(
        take(1),
        switchMap((erpt) => {
          erpt.rp_purpose = reportName;
          return this.reportService.updateReportPurpose(erpt);
        })
      )
      .subscribe(() => {
        this.loadReportDetails$.next();
        this.showReportNameChangeSuccessToast();
        this.trackReportNameChange();
      });
  }

  editReportName(): void {
    this.reportNameChangeStartTime = new Date().getTime();
    this.erpt$
      .pipe(take(1))
      .pipe(
        switchMap((erpt) => {
          const editReportNamePopover = this.popoverController.create({
            component: EditReportNamePopoverComponent,
            componentProps: {
              reportName: erpt.rp_purpose,
            },
            cssClass: 'fy-dialog-popover',
          });
          return editReportNamePopover;
        }),
        tap((editReportNamePopover) => editReportNamePopover.present()),
        switchMap(
          (editReportNamePopover) => editReportNamePopover?.onWillDismiss() as Promise<{ data: { reportName: string } }>
        )
      )
      .subscribe((editReportNamePopoverDetails) => {
        const newReportName = editReportNamePopoverDetails?.data?.reportName;
        if (newReportName) {
          this.updateReportName(newReportName);
        }
      });
  }

  deleteReport(): void {
    this.erpt$.pipe(take(1)).subscribe((res) => this.deleteReportPopup(res));
  }

  getDeleteReportPopupParams(erpt: ExtendedReport): {
    component: typeof FyDeleteDialogComponent;
    cssClass: string;
    backdropDismiss: boolean;
    componentProps: {
      header: string;
      body: string;
      infoMessage: string;
      deleteMethod: () => Observable<void>;
    };
  } {
    return {
      component: FyDeleteDialogComponent,
      cssClass: 'pop-up-in-center',
      backdropDismiss: false,
      componentProps: {
        header: 'Delete Report',
        body: 'Are you sure you want to delete this report?',
        infoMessage:
          erpt.rp_state === 'DRAFT' && erpt.rp_num_transactions === 0
            ? null
            : 'Deleting the report will not delete any of the expenses.',
        deleteMethod: (): Observable<void> =>
          this.reportService.delete(this.reportId).pipe(tap(() => this.trackingService.deleteReport())),
      },
    };
  }

  async deleteReportPopup(erpt: ExtendedReport): Promise<void> {
    const deleteReportPopover = await this.popoverController.create(this.getDeleteReportPopupParams(erpt));

    await deleteReportPopover.present();

    const { data } = (await deleteReportPopover?.onDidDismiss()) as { data: { status: string } };

    if (data && data.status === 'success') {
      this.router.navigate(['/', 'enterprise', 'my_reports']);
    }
  }

  resubmitReport(): void {
    this.reportService.resubmit(this.reportId).subscribe(() => {
      this.refinerService.startSurvey({ actionName: 'Resubmit Report ' });
      this.router.navigate(['/', 'enterprise', 'my_reports']);
      const message = `Report resubmitted successfully.`;
      this.matSnackBar.openFromComponent(ToastMessageComponent, {
        ...this.snackbarProperties.setSnackbarProperties('success', { message }),
        panelClass: ['msb-success-with-camera-icon'],
      });
      this.trackingService.showToastMessage({ ToastContent: message });
    });
  }

  submitReport(): void {
    this.reportService.submit(this.reportId).subscribe(() => {
      this.refinerService.startSurvey({ actionName: 'Submit Report' });
      this.router.navigate(['/', 'enterprise', 'my_reports']);
      const message = `Report submitted successfully.`;
      this.matSnackBar.openFromComponent(ToastMessageComponent, {
        ...this.snackbarProperties.setSnackbarProperties('success', { message }),
        panelClass: ['msb-success-with-camera-icon'],
      });
      this.trackingService.showToastMessage({ ToastContent: message });
    });
  }

  goToTransaction({ etxn, etxnIndex }: { etxn: Expense; etxnIndex: number }): void {
    const canEdit = this.canEditTxn(etxn.tx_state);
    let category: string;

    if (etxn.tx_org_category) {
      category = etxn.tx_org_category.toLowerCase();
    }

    let route: string;

    if (category === 'mileage') {
      route = '/enterprise/view_mileage';
      if (canEdit) {
        route = '/enterprise/add_edit_mileage';
      }
    } else if (category === 'per diem') {
      route = '/enterprise/view_per_diem';
      if (canEdit) {
        route = '/enterprise/add_edit_per_diem';
      }
    } else {
      route = '/enterprise/view_expense';
      if (canEdit) {
        route = '/enterprise/add_edit_expense';
      }
    }
    if (canEdit) {
      this.erpt$.pipe(take(1)).subscribe((erpt) =>
        this.router.navigate([
          route,
          {
            id: etxn.tx_id,
            navigate_back: true,
            remove_from_report: erpt.rp_num_transactions > 1,
          },
        ])
      );
    } else {
      this.trackingService.viewExpenseClicked({ view: ExpenseView.individual, category });
      this.router.navigate([
        route,
        {
          id: etxn.tx_id,
          txnIds: JSON.stringify(this.reportEtxnIds),
          activeIndex: etxnIndex,
          view: ExpenseView.individual,
        },
      ]);
    }
  }

  async shareReport(): Promise<void> {
    this.trackingService.clickShareReport();

    const shareReportModal = await this.modalController.create({
      component: ShareReportComponent,
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
      cssClass: 'share-report-modal',
    });

    await shareReportModal.present();

    const { data } = (await shareReportModal?.onWillDismiss()) as { data: { email: string } };

    if (data && data.email) {
      const params = {
        report_ids: [this.reportId],
        email: data.email,
      };
      this.reportService.downloadSummaryPdfUrl(params).subscribe(() => {
        const message = `PDF download link has been emailed to ${data.email}`;
        this.matSnackBar.openFromComponent(ToastMessageComponent, {
          ...this.snackbarProperties.setSnackbarProperties('success', { message }),
          panelClass: ['msb-success-with-report-btn'],
        });
        this.trackingService.showToastMessage({ ToastContent: message });
      });
    }
  }

  async openViewReportInfoModal(): Promise<void> {
    const viewInfoModal = await this.modalController.create({
      component: FyViewReportInfoComponent,
      componentProps: {
        erpt$: this.erpt$,
        etxns$: this.etxns$,
        view: ExpenseView.individual,
      },
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await viewInfoModal.present();
    await viewInfoModal?.onWillDismiss();

    this.trackingService.clickViewReportInfo({ view: ExpenseView.individual });
  }

  canEditTxn(txState: string): boolean {
    return this.canEdit$ && ['DRAFT', 'DRAFT_INQUIRY', 'COMPLETE', 'APPROVER_PENDING'].indexOf(txState) > -1;
  }

  segmentChanged(event: SegmentCustomEvent): void {
    if (event?.detail?.value) {
      this.segmentValue = parseInt(event.detail.value, 10);
    }
  }

  addComment(): void {
    if (this.newComment) {
      const data = {
        comment: this.newComment,
      };

      this.newComment = null;
      this.commentInput.nativeElement.focus();
      this.isCommentAdded = true;

      this.statusService
        .post(this.objectType, this.reportId, data)
        .pipe()
        .subscribe(() => {
          this.refreshEstatuses$.next();
          setTimeout(() => {
            this.content.scrollToBottom(500);
          }, 500);
        });
    }
  }

  addExpense(): void {
    this.router.navigate(['/', 'enterprise', 'add_edit_expense', { rp_id: this.reportId }]);
  }

  showAddExpensesToReportModal(): void {
    const addExpensesToReportModal = this.modalController.create({
      component: AddExpensesToReportComponent,
      componentProps: {
        unReportedEtxns: this.unReportedEtxns,
        reportId: this.reportId,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
    });

    from(addExpensesToReportModal)
      .pipe(
        tap((addExpensesToReportModal) => addExpensesToReportModal.present()),
        switchMap(
          (addExpensesToReportModal) =>
            addExpensesToReportModal?.onWillDismiss() as Promise<{ data: { selectedTxnIds: string[] } }>
        )
      )
      .subscribe((addExpensesToReportModalDetails) => {
        const selectedTxnIds = addExpensesToReportModalDetails?.data?.selectedTxnIds;
        if (selectedTxnIds?.length > 0) {
          this.addEtxnsToReport(selectedTxnIds);
        }
      });
  }

  addEtxnsToReport(selectedEtxnIds: string[]): void {
    this.isExpensesLoading = true;
    this.reportService.addTransactions(this.reportId, selectedEtxnIds).subscribe(() => {
      this.loadReportDetails$.next();
      this.loadReportTxns$.next();
      this.trackingService.addToExistingReport();
      this.unReportedEtxns = this.unReportedEtxns.filter(
        (unReportedEtxn) => !selectedEtxnIds.includes(unReportedEtxn.tx_id)
      );
    });
  }
}
