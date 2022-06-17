import { Component, OnInit, Input } from '@angular/core';
import { isNumber } from 'lodash';
import { PopoverController } from '@ionic/angular';
import { iif, of } from 'rxjs';
import { concatMap, finalize } from 'rxjs/operators';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ReportService } from 'src/app/core/services/report.service';
import { RefinerService } from 'src/app/core/services/refiner.service';

@Component({
  selector: 'app-submit-report-popover',
  templateUrl: './submit-report-popover.component.html',
  styleUrls: ['./submit-report-popover.component.scss'],
})
export class SubmitReportPopoverComponent implements OnInit {
  @Input() erpt;

  @Input() etxns;

  numIssues = 0;

  numCriticalPolicies = 0;

  submitReportLoading = false;

  constructor(
    private popoverController: PopoverController,
    private transactionService: TransactionService,
    private reportService: ReportService,
    private refinerService: RefinerService
  ) {}

  ngOnInit() {
    this.numCriticalPolicies = this.getCriticalPolicyViolations(this.etxns);
    this.numIssues = this.getNumIssues(this.etxns);
  }

  getCriticalPolicyViolations(etxns) {
    let count = 0;
    etxns.forEach(function (etxn) {
      if (etxn.tx_policy_flag && isNumber(etxn.tx_policy_amount) && etxn.tx_policy_amount < 0.0001) {
        count = count + 1;
      }
    });
    return count;
  }

  getNumIssues(etxns) {
    let count = 0;

    for (let i = 0; i < etxns.length; i++) {
      const etxn = etxns[i];
      if (etxn.tx_policy_flag) {
        count = count + 1;
      }
    }

    for (let i = 0; i < etxns.length; i++) {
      const etxn = etxns[i];
      if (etxn.tx_manual_flag) {
        count = count + 1;
      }
    }

    return count;
  }

  cancel() {
    this.popoverController.dismiss();
  }

  filterCriticalViolations(etxn) {
    return etxn.tx_policy_flag && isNumber(etxn.tx_policy_amount) && etxn.tx_policy_amount < 0.0001;
  }

  excludeCriticalViolations(etxn) {
    return !etxn.tx.policy_flag && !(isNumber(etxn.tx.policy_amount) && etxn.tx.policy_amount < 0.0001);
  }

  submitReportAfterReview(event) {
    event.preventDefault();
    event.stopPropagation();
    this.submitReportLoading = true;

    const txnIdsCriticalViolations = this.etxns
      .filter((etxn) => this.filterCriticalViolations(etxn))
      .map((etxn) => etxn.tx_id);

    iif(
      () => txnIdsCriticalViolations.length > 0,
      this.transactionService.removeTxnsFromRptInBulk(txnIdsCriticalViolations),
      of(null)
    )
      .pipe(
        concatMap(() => this.reportService.submit(this.erpt.rp_id)),
        finalize(() => {
          this.submitReportLoading = false;
        })
      )
      .subscribe(() => {
        this.popoverController.dismiss({
          goBack: true,
        });

        this.refinerService.startSurvey({ actionName: 'Submit Report' });
      });
  }
}
