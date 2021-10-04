import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-reject-advance',
  templateUrl: './reject-advance.component.html',
  styleUrls: ['./reject-advance.component.scss'],
})
export class RejectAdvanceComponent implements OnInit {
  @Input() areq;

  rejectReason = '';

  showReasonError = false;

  rejectLoading = false;

  constructor(private popoverController: PopoverController, private advanceRequestService: AdvanceRequestService) {}

  ngOnInit() {}

  cancel() {
    this.popoverController.dismiss();
  }

  reject(event) {
    this.showReasonError = false;
    if (this.rejectReason.trim().length > 0) {
      this.rejectLoading = true;
      const status = {
        comment: this.rejectReason,
      };

      const statusPayload = {
        status,
        notify: false,
      };

      this.advanceRequestService
        .reject(this.areq.areq_id, statusPayload)
        .pipe(finalize(() => (this.rejectLoading = false)))
        .subscribe((_) => {
          this.popoverController.dismiss({
            goBack: true,
          });
        });
    } else {
      this.showReasonError = true;
    }
  }
}
