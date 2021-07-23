import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-approve-advance',
  templateUrl: './approve-advance.component.html',
  styleUrls: ['./approve-advance.component.scss'],
})
export class ApproveAdvanceComponent implements OnInit {

  @Input() areq;
  approveAdvanceLoading = false;

  constructor(
    private popoverController: PopoverController,
    private advanceRequestService: AdvanceRequestService
  ) { }

  ngOnInit() { }

  cancel() {
    this.popoverController.dismiss();
  }

  approveAdvanceAfterReview(event) {
    this.approveAdvanceLoading = true;
    this.advanceRequestService.approve(this.areq.areq_id).pipe(
      finalize(() => this.approveAdvanceLoading = false)
    ).subscribe(_ => {
      this.popoverController.dismiss({
        goBack: true
      });
    });
  }
}
