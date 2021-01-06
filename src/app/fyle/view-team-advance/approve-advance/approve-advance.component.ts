import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';

@Component({
  selector: 'app-approve-advance',
  templateUrl: './approve-advance.component.html',
  styleUrls: ['./approve-advance.component.scss'],
})
export class ApproveAdvanceComponent implements OnInit {

  @Input() areq;

  constructor(
    private popoverController: PopoverController,
    private advanceRequestService: AdvanceRequestService
  ) { }

  ngOnInit() {
    console.log(this.areq);
  }

  cancel() {
    this.popoverController.dismiss();
  }

  approveAdvanceAfterReview(event) {
    this.advanceRequestService.approve(this.areq.areq_id).subscribe(_ => {
      this.popoverController.dismiss({
        goBack: true
      })
    });
  }
}
