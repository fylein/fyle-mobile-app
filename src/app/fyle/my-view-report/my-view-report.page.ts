import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ExtendedReport } from 'src/app/core/models/report.model';
import { Observable, from, noop, concat, Subject } from 'rxjs';
import { ReportService } from 'src/app/core/services/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ExtendedTripRequest } from 'src/app/core/models/extended_trip_request.model';
import { map, switchMap, finalize, shareReplay, takeUntil, tap } from 'rxjs/operators';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { PopoverController } from '@ionic/angular';
import { PopupService } from 'src/app/core/services/popup.service';
import { ShareReportComponent } from './share-report/share-report.component';
import { ResubmitReportPopoverComponent } from './resubmit-report-popover/resubmit-report-popover.component';
import { SubmitReportPopoverComponent } from './submit-report-popover/submit-report-popover.component';
import { NetworkService } from '../../core/services/network.service';
import { TrackingService } from '../../core/services/tracking.service';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { EditReportNamePopoverComponent } from './edit-report-name-popover/edit-report-name-popover.component';

@Component({
  selector: 'app-my-view-report',
  templateUrl: './my-view-report.page.html',
  styleUrls: ['./my-view-report.page.scss'],
})
export class MyViewReportPage implements OnInit {
  erpt$: Observable<ExtendedReport>;

  etxns$: Observable<any[]>;

  sharedWith$: Observable<any[]>;

  reportApprovals$: Observable<any>;

  tripRequest$: Observable<ExtendedTripRequest>;

  hideAllExpenses = true;

  sharedWithLimit = 3;

  canEdit$: Observable<boolean>;

  canDelete$: Observable<boolean>;

  canResubmitReport$: Observable<boolean>;

  navigateBack = false;

  isConnected$: Observable<boolean>;

  onPageExit = new Subject();

  reportName: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
    private transactionService: TransactionService,
    private authService: AuthService,
    private loaderService: LoaderService,
    private router: Router,
    private popupService: PopupService,
    private popoverController: PopoverController,
    private networkService: NetworkService,
    private trackingService: TrackingService
  ) {}

  setupNetworkWatcher() {
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

  ngOnInit() {}

  ionViewWillLeave() {
    this.onPageExit.next();
  }

  getVendorName(etxn) {
    const category = etxn.tx_org_category && etxn.tx_org_category.toLowerCase();
    let vendorName = etxn.tx_vendor || 'Expense';

    if (category === 'mileage') {
      vendorName = etxn.tx_distance || 0;
      vendorName += ' ' + etxn.tx_distance_unit;
    } else if (category === 'per diem') {
      vendorName = etxn.tx_num_days || 0;
      vendorName += ' Days';
    }

    return vendorName;
  }

  getShowViolation(etxn) {
    return (
      etxn.tx_id &&
      (etxn.tx_manual_flag || etxn.tx_policy_flag) &&
      !(typeof etxn.tx_policy_amount === 'number' && etxn.tx_policy_amount < 0.0001)
    );
  }

  ionViewWillEnter() {
    this.setupNetworkWatcher();
    this.navigateBack = !!this.activatedRoute.snapshot.params.navigateBack;
    this.erpt$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => this.reportService.getReport(this.activatedRoute.snapshot.params.id)),
      finalize(() => from(this.loaderService.hideLoader()))
    );

    this.erpt$.subscribe((erpt) => (this.reportName = erpt.rp_purpose));

    this.sharedWith$ = this.reportService.getExports(this.activatedRoute.snapshot.params.id).pipe(
      map((pdfExports) =>
        pdfExports.results
          .sort((a, b) => (a.created_at < b.created_at ? 1 : b.created_at < a.created_at ? -1 : 0))
          .map((pdfExport) => pdfExport.sent_to)
          .filter((item, index, inputArray) => inputArray.indexOf(item) === index)
      )
    );

    this.reportApprovals$ = this.reportService.getApproversByReportId(this.activatedRoute.snapshot.params.id).pipe(
      map((reportApprovals) =>
        reportApprovals
          .filter((approval) => ['APPROVAL_PENDING', 'APPROVAL_DONE'].indexOf(approval.state) > -1)
          .map((approval) => {
            if (approval && approval.state === 'APPROVAL_DONE' && approval.updated_at) {
              approval.approved_at = approval.updated_at;
            }
            return approval;
          })
      )
    );

    this.etxns$ = from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.transactionService.getAllETxnc({
          tx_org_user_id: 'eq.' + eou.ou.id,
          tx_report_id: 'eq.' + this.activatedRoute.snapshot.params.id,
          order: 'tx_txn_dt.desc,tx_id.desc',
        })
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

    const actions$ = this.reportService.actions(this.activatedRoute.snapshot.params.id).pipe(shareReplay(1));

    this.canEdit$ = actions$.pipe(map((actions) => actions.can_edit));
    this.canDelete$ = actions$.pipe(map((actions) => actions.can_delete));
    this.canResubmitReport$ = actions$.pipe(map((actions) => actions.can_resubmit));

    this.etxns$.subscribe(noop);
  }

  goToEditReport() {
    this.router.navigate(['/', 'enterprise', 'my_edit_report', { id: this.activatedRoute.snapshot.params.id }]);
  }

  updateReportName(erpt: ExtendedReport, reportName: string) {
    erpt.rp_purpose = reportName;
    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => this.reportService.updateReportDetails(erpt)),
        finalize(() => this.loaderService.hideLoader()),
        shareReplay(1)
      )
      .subscribe(() => {
        this.reportName = reportName;
      });
  }

  async editReportName() {
    const erpt = await this.erpt$.toPromise();
    const editReportNamePopover = await this.popoverController.create({
      component: EditReportNamePopoverComponent,
      componentProps: {
        reportName: erpt.rp_purpose,
      },
      cssClass: 'fy-dialog-popover',
    });

    await editReportNamePopover.present();
    const { data } = await editReportNamePopover.onWillDismiss();

    if (data && data.reportName) {
      this.updateReportName(erpt, data.reportName);
    }
  }

  async deleteReport() {
    const deleteReportPopover = await this.popoverController.create({
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      backdropDismiss: false,
      componentProps: {
        header: 'Delete Report',
        body: 'Are you sure you want to delete this report?',
        infoMessage: 'Deleting the report will not delete any of the expenses.',
        deleteMethod: () =>
          this.reportService
            .delete(this.activatedRoute.snapshot.params.id)
            .pipe(tap(() => this.trackingService.deleteReport())),
      },
    });

    await deleteReportPopover.present();

    const { data } = await deleteReportPopover.onDidDismiss();

    if (data && data.status === 'success') {
      this.router.navigate(['/', 'enterprise', 'my_reports']);
    }
  }

  async showResubmitReportSummaryPopover() {
    const erpt = await this.erpt$.toPromise();
    const etxns = await this.etxns$.toPromise();
    const popover = await this.popoverController.create({
      componentProps: {
        erpt,
        etxns,
      },
      component: ResubmitReportPopoverComponent,
      cssClass: 'dialog-popover',
    });

    await popover.present();

    const { data } = await popover.onWillDismiss();

    if (data && data.goBack) {
      this.router.navigate(['/', 'enterprise', 'my_reports']);
    }
  }

  async showSubmitReportSummaryPopover() {
    const erpt = await this.erpt$.toPromise();
    const etxns = await this.etxns$.toPromise();
    const popover = await this.popoverController.create({
      componentProps: {
        erpt,
        etxns,
      },
      component: SubmitReportPopoverComponent,
      cssClass: 'dialog-popover',
    });

    await popover.present();

    const { data } = await popover.onWillDismiss();

    if (data && data.goBack) {
      this.router.navigate(['/', 'enterprise', 'my_reports']);
    }
  }

  async goToTransaction(etxn: any) {
    const erpt = await this.erpt$.toPromise();
    const canEdit = this.canEditTxn(etxn.tx_state);
    let category;

    if (etxn.tx_org_category) {
      category = etxn.tx_org_category.toLowerCase();
    }

    if (category === 'activity') {
      this.popupService.showPopup({
        header: 'Cannot Edit Activity',
        message: 'Editing activity is not supported in mobile app.',
        primaryCta: {
          text: 'Cancel',
        },
      });
    }

    let route;

    if (category === 'mileage') {
      route = '/enterprise/my_view_mileage';
      if (canEdit) {
        route = '/enterprise/add_edit_mileage';
      }
    } else if (category === 'per diem') {
      route = '/enterprise/my_view_per_diem';
      if (canEdit) {
        route = '/enterprise/add_edit_per_diem';
      }
    } else {
      route = '/enterprise/my_view_expense';
      if (canEdit) {
        route = '/enterprise/add_edit_expense';
      }
    }
    if (canEdit) {
      this.router.navigate([
        route,
        {
          id: etxn.tx_id,
          navigate_back: true,
          remove_from_report: erpt.rp_num_transactions > 1,
        },
      ]);
    } else {
      this.router.navigate([route, { id: etxn.tx_id }]);
    }
  }

  async shareReport(event) {
    this.trackingService.clickShareReport();

    const popover = await this.popoverController.create({
      component: ShareReportComponent,
      cssClass: 'dialog-popover',
    });

    await popover.present();

    const { data } = await popover.onWillDismiss();

    if (data && data.email) {
      const params = {
        report_ids: [this.activatedRoute.snapshot.params.id],
        email: data.email,
      };
      this.reportService.downloadSummaryPdfUrl(params).subscribe(async () => {
        const message = `We will send ${data.email} a link to download the PDF <br> when it is generated and send you a copy.`;
        await this.loaderService.showLoader(message);
      });
    }
  }

  canEditTxn(txState) {
    return this.canEdit$ && ['DRAFT', 'DRAFT_INQUIRY', 'COMPLETE', 'APPROVER_PENDING'].indexOf(txState) > -1;
  }
}
