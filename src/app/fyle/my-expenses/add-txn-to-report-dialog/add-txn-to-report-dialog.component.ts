import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable, from, noop } from 'rxjs';
import { ReportService } from 'src/app/core/services/report.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { switchMap, finalize, tap } from 'rxjs/operators';

@Component({
  selector: 'app-add-txn-to-report-dialog',
  templateUrl: './add-txn-to-report-dialog.component.html',
  styleUrls: ['./add-txn-to-report-dialog.component.scss'],
})
export class AddTxnToReportDialogComponent implements OnInit {

  @Input() txId;
  approverPendingReports$: Observable<any>;


  constructor(
    private modalController: ModalController,
    private reportService: ReportService,
    private loaderService: LoaderService
  ) { }

  closeAddToReportModal() {
    this.modalController.dismiss();
  }

  addTransactionToReport(reportId) {
    from(this.loaderService.showLoader('Adding transaction to report')).pipe(
      switchMap(() => {
        return this.reportService.addTransactions(reportId, [this.txId]);
      }),
      finalize(() => this.loaderService.hideLoader())
    ).subscribe(() => {
      this.modalController.dismiss({reload: true});
    });
  }

  ngOnInit() {
    const queryParams = { rp_state: 'in.(DRAFT,APPROVER_PENDING)' };
    this.approverPendingReports$ = from(this.loaderService.showLoader('Loading Reports')).pipe(
      switchMap(() => {
        return this.reportService.getAllExtendedReports({
          queryParams
        });
      }),
      finalize(() => this.loaderService.hideLoader())
    );
  }

}
