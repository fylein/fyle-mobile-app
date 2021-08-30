import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-confirmation-comment-popover',
  templateUrl: './confirmation-comment-popover.component.html',
  styleUrls: ['./confirmation-comment-popover.component.scss'],
})
export class ConfirmationCommentPopoverComponent implements OnInit {
  @Input() selectedApprovers;

  confirmationMessage = '';

  validMessage = true;

  constructor(private popoverController: PopoverController) {}

  closeConfirmationPopover() {
    this.popoverController.dismiss();
  }

  saveUpdatedApproveList() {
    this.popoverController.dismiss({
      message: this.confirmationMessage,
    });
  }

  ngOnInit() {}
}
