import { Component, OnInit, Input } from '@angular/core';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { PopoverController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-send-back-advance',
  templateUrl: './send-back-advance.component.html',
  styleUrls: ['./send-back-advance.component.scss'],
})
export class SendBackAdvanceComponent implements OnInit {

  sendBackReason = '';
  sendBackLoading = false;

  @Input() areq;

  constructor(
    private popoverController: PopoverController,
    private advanceRequestService: AdvanceRequestService
  ) { }

  ngOnInit() { }

  cancel() {
    this.popoverController.dismiss();
  }

  sendBack(event) {
    this.sendBackLoading = true;
    var status = {
      comment: this.sendBackReason
    };

    var statusPayload = {
      status: status,
      notify: false
    };

    this.advanceRequestService.sendBack(this.areq.areq_id, statusPayload).pipe(
      finalize(() => this.sendBackLoading = false)
    ).subscribe(() => {
      this.popoverController.dismiss({
        goBack: true
      });
    });
  }
}
