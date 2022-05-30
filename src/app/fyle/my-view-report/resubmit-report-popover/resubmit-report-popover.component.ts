import { Component, OnInit, Input } from '@angular/core';
import { isNumber } from 'lodash';
import { PopoverController } from '@ionic/angular';
import { ReportService } from 'src/app/core/services/report.service';
import { RefinerService } from 'src/app/core/services/refiner.service';

@Component({
  selector: 'app-resubmit-report-popover',
  templateUrl: './resubmit-report-popover.component.html',
  styleUrls: ['./resubmit-report-popover.component.scss'],
})
export class ResubmitReportPopoverComponent implements OnInit {
  @Input() erpt;

  @Input() etxns;

  numIssues = 0;

  numCriticalPolicies = 0;

  constructor(
    private popoverController: PopoverController,
    private reportService: ReportService,
    private refinerService: RefinerService
  ) {}

  ngOnInit() {
    this.numCriticalPolicies = this.getCriticalPolicyViolations(this.etxns);
    this.numIssues = this.getNumIssues(this.etxns);
  }

  getCriticalPolicyViolations(etxns) {
    let count = 0;
    etxns.forEach((etxn) => {
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

  resubmitReportAfterReview(event) {
    event.preventDefault();
    event.stopPropagation();

    this.reportService.resubmit(this.erpt.rp_id).subscribe(() => {
      this.popoverController.dismiss({
        goBack: true,
      });

      this.refinerService.startSurvey({ actionName: 'Resubmit Report ' });
    });
  }
}
