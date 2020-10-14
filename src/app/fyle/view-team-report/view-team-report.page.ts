import { Component, OnInit } from '@angular/core';
import { Observable, from, noop } from 'rxjs';
import { ExtendedReport } from 'src/app/core/models/report.model';
import { ExtendedTripRequest } from 'src/app/core/models/extended_trip_request.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from 'src/app/core/services/report.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AlertController } from '@ionic/angular';
import { switchMap, finalize, map, shareReplay, tap } from 'rxjs/operators';

@Component({
  selector: 'app-view-team-report',
  templateUrl: './view-team-report.page.html',
  styleUrls: ['./view-team-report.page.scss'],
})
export class ViewTeamReportPage implements OnInit {

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
  isReportReported: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
    private transactionService: TransactionService,
    private authService: AuthService,
    private loaderService: LoaderService,
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
  }

  getVendorName(etxn) {
    const category = etxn.tx_org_category && etxn.tx_org_category.toLowerCase();
    let vendorName = etxn.tx_vendor || 'Expense';

    if (category === 'mileage') {
      vendorName = etxn.tx_distance;
      vendorName += ' ' + etxn.tx_distance_unit;
    } else if (category === 'per diem') {
      vendorName = etxn.tx_num_days;
      vendorName += ' Days';
    }

    return vendorName;
  }

  getShowViolation(etxn) {
    return etxn.tx_id &&
      (etxn.tx_manual_flag ||
        etxn.tx_policy_flag) &&
      !((typeof (etxn.tx_policy_amount) === 'number')
        && etxn.tx_policy_amount < 0.0001);
  }

  ionViewWillEnter() {
    this.erpt$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => this.reportService.getTeamReport(this.activatedRoute.snapshot.params.id)),
      tap(res => {
        this.isReportReported = ['APPROVER_PENDING'].indexOf(res.rp_state) > -1;
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    );

    this.sharedWith$ = this.reportService.getExports(this.activatedRoute.snapshot.params.id).pipe(
      map(pdfExports => {
        return pdfExports.results.sort((a, b) => {
          return (a.created_at < b.created_at) ? 1 : ((b.created_at < a.created_at) ? -1 : 0);
        }).map((pdfExport) => {
          return pdfExport.sent_to;
        }).filter((item, index, inputArray) => {
          return inputArray.indexOf(item) === index;
        });
      })
    );

    this.reportApprovals$ = this.reportService.getApproversByReportId(this.activatedRoute.snapshot.params.id).pipe(
      map(reportApprovals => {
        return reportApprovals.filter((approval) => {
          return ['APPROVAL_PENDING', 'APPROVAL_DONE'].indexOf(approval.state) > -1;
        }).map((approval) => {
          if (approval && approval.state === 'APPROVAL_DONE' && approval.updated_at) {
            approval.approved_at = approval.updated_at;
          }
          return approval;
        });
      })
    );

    this.etxns$ = from(this.authService.getEou()).pipe(
      switchMap(eou => {
        return this.transactionService.getAllETxnc({
          tx_report_id: 'eq.' + this.activatedRoute.snapshot.params.id,
          order: 'tx_txn_dt.desc,tx_id.desc'
        });
      }),
      map(
        etxns => etxns.map(etxn => {
          etxn.vendor = this.getVendorName(etxn);
          etxn.violation = this.getShowViolation(etxn);
          return etxn;
        })
      ),
      shareReplay()
    );

    const actions$ = this.reportService.actions(this.activatedRoute.snapshot.params.id).pipe(shareReplay());

    this.canEdit$ = actions$.pipe(map(actions => actions.can_edit));
    this.canDelete$ = actions$.pipe(map(actions => actions.can_delete));
    this.canResubmitReport$ = actions$.pipe(map(actions => actions.can_resubmit), tap(console.log));

    this.etxns$.subscribe(noop);
  }

  goToEditReport() {
    // TODO
    // this.router.navigate(['/', 'enterprise', 'edit_report', { id: this.activatedRoute.snapshot.params.id }]);
  }

  async deleteReport() {
    const message = `
    <p class="highlight-info">
    On deleting this report, all the associated expenses will be moved to <strong>"My Expenses"</strong> list.</p>
    <p>Are you sure, you want to delete this report?</p>`;
    const alert = await this.alertController.create({
      header: 'Delete Report',
      message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: noop
        }, {
          text: 'Okay',
          handler: () => {
            from(this.loaderService.showLoader()).pipe(
              switchMap(() => {
                return this.reportService.delete(this.activatedRoute.snapshot.params.id)
              }),
              finalize(() => from(this.loaderService.hideLoader()))
            ).subscribe(() => {
              this.router.navigate(['/', 'enterprise', 'my_reports']);
            })
          }
        }
      ]
    });

    await alert.present();
  }

  showResubmitReportSummaryPopover() {

  }

  showSubmitReportSummaryPopover() {

  }

  goToTransaction(etxn: any) {
    this.router.navigate(['/', 'enterprise', 'my_view_expense', { id: etxn.tx_id }]);
  }

  async shareReport(event) {
    const alert = await this.alertController.create({
      header: 'Share Report',
      message: 'Share report via email',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email ID'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: noop
        }, {
          text: 'Okay',
          handler: (e) => {
            const data = {
              report_ids: [this.activatedRoute.snapshot.params.id],
              email: e.email
            };
            this.reportService.downloadSummaryPdfUrl(data).subscribe(async () => {
              const message = `We will send ${e.email} a link to download the PDF <br> when it is generated and send you a copy.`;
              await this.loaderService.showLoader(message);
            });
          }
        }
      ]
    });

    await alert.present();
  }
}
