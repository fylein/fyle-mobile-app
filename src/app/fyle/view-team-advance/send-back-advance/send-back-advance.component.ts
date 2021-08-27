import { Component, OnInit, Input } from '@angular/core';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { PopoverController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-send-back-advance',
  templateUrl: './send-back-advance.component.html',
  styleUrls: ['./send-back-advance.component.scss']
})
export class SendBackAdvanceComponent implements OnInit {
  @Input() areq;

  sendBackReason = '';

  sendBackLoading = false;

  constructor(private popoverController: PopoverController, private advanceRequestService: AdvanceRequestService) {}

  ngOnInit() {}

  cancel() {
    this.popoverController.dismiss();
  }

  sendBack(sendBackInput: NgModel) {
    if (sendBackInput.valid) {
      this.sendBackLoading = true;
      const status = {
        comment: this.sendBackReason
      };

      const statusPayload = {
        status,
        notify: false
      };

      this.advanceRequestService
        .sendBack(this.areq.areq_id, statusPayload)
        .pipe(finalize(() => (this.sendBackLoading = false)))
        .subscribe(() => {
          this.popoverController.dismiss({
            goBack: true
          });
        });
    } else {
      sendBackInput.control.markAsTouched();
    }
  }
}
