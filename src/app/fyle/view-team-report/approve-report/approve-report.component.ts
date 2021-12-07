import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ReportService } from 'src/app/core/services/report.service';
import { finalize } from 'rxjs/operators';
import { RefinerService } from 'src/app/core/services/refiner.service';

@Component({
  selector: 'app-approve-report',
  templateUrl: './approve-report.component.html',
  styleUrls: ['./approve-report.component.scss'],
})
export class ApproveReportComponent implements OnInit {
  @Input() erpt;

  @Input() etxns;

  sendBackReason = '';

  numIssues = 0;

  approveReportLoading = false;

  constructor(
    private popoverController: PopoverController,
    private reportService: ReportService,
    private refinerService: RefinerService
  ) {}

  ngOnInit() {
    this.numIssues = this.getNumIssues(this.etxns);
  }

  cancel() {
    this.popoverController.dismiss();
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

  approve(event) {
    this.approveReportLoading = true;
    event.stopPropagation();
    event.preventDefault();

    this.reportService
      .approve(this.erpt.rp_id)
      .pipe(finalize(() => (this.approveReportLoading = false)))
      .subscribe(() => {
        this.popoverController.dismiss({
          goBack: true,
        });
        this.refinerService.startSurvey({ actionName: 'Approve Report' });
      });
  }
}
