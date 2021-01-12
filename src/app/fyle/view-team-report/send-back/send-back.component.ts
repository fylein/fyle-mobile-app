import {Component, OnInit, Input} from '@angular/core';
import {PopoverController} from '@ionic/angular';
import {ReportService} from 'src/app/core/services/report.service';
import {finalize} from 'rxjs/operators';
import {NgModel} from '@angular/forms';

@Component({
  selector: 'app-send-back',
  templateUrl: './send-back.component.html',
  styleUrls: ['./send-back.component.scss'],
})
export class SendBackComponent implements OnInit {
  sendBackReason = '';

  @Input() erpt;
  @Input() etxns;
  numIssues = 0;
  sendBackLoading = false;

  constructor(
    private popoverController: PopoverController,
    private reportService: ReportService
  ) {
  }

  ngOnInit() {
    this.numIssues = this.getNumIssues(this.etxns);
  }

  cancel() {
    this.popoverController.dismiss();
  }

  getNumIssues(etxns) {
    let count = 0;

    for (const etxn of etxns) {
      if (etxn.tx_policy_flag) {
        count = count + 1;
      }
    }

    for (const etxn of etxns) {
      if (etxn.tx_manual_flag) {
        count = count + 1;
      }
    }

    return count;
  }


  sendBack(ngmodel: NgModel) {
    if (ngmodel.valid) {
      const status = {
        comment: this.sendBackReason
      };

      const statusPayload = {
        status,
        notify: false
      };

      this.reportService.inquire(this.erpt.rp_id, statusPayload).pipe(
        finalize(() => this.sendBackLoading = false)
      ).subscribe(() => {
        this.popoverController.dismiss({
          goBack: true
        });
      });
    } else {
      ngmodel.control.markAsTouched();
    }
  }
}
