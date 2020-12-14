import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';

@Component({
  selector: 'app-reject-advance',
  templateUrl: './reject-advance.component.html',
  styleUrls: ['./reject-advance.component.scss'],
})
export class RejectAdvanceComponent implements OnInit {
  rejectReason = '';

  @Input() areq;

  constructor(
    private popoverController: PopoverController,
    private advanceRequestService: AdvanceRequestService
  ) { }

  ngOnInit() { }

  cancel() {
    this.popoverController.dismiss();
  }

  reject(event) {
    var status = {
      comment: this.rejectReason
    };

    var statusPayload = {
      status: status,
      notify: false
    };

    this.advanceRequestService.reject(this.areq.areq_id, statusPayload).subscribe(_ => {
      this.popoverController.dismiss({
        goBack: true
      })
    });
  }
}
