import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ReportService } from 'src/app/core/services/report.service';

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

  constructor(
    private popoverController: PopoverController,
    private reportService: ReportService
  ) { }

  ngOnInit() {
    this.numIssues = this.getNumIssues(this.etxns);
  }

  cancel() {
    this.popoverController.dismiss();
  }

  getNumIssues(etxns) {
    let count = 0;

    for (var i = 0; i < etxns.length; i++) {
      var etxn = etxns[i];
      if (etxn.tx_policy_flag) {
        count = count + 1;
      }
    }

    for (var i = 0; i < etxns.length; i++) {
      var etxn = etxns[i];
      if (etxn.tx_manual_flag) {
        count = count + 1;
      }
    }

    return count;
  }


  sendBack(event) {
    event.stopPropagation();
    event.preventDefault();

    var status = {
      comment: this.sendBackReason
    };

    var statusPayload = {
      status: status,
      notify: false
    };

     this.reportService.inquire(this.erpt.rp_id, statusPayload).subscribe(()=> {
       this.popoverController.dismiss({
         goBack: true
       });
     })
  }
}
