import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-modify-approver-confirmation-popover',
  templateUrl: './modify-approver-confirmation-popover.component.html',
  styleUrls: ['./modify-approver-confirmation-popover.component.scss'],
})
export class ModifyApproverConfirmationPopoverComponent implements OnInit {

  @Input() selectedApprovers;
  @Input() removedApprovers;
  confirmationMessage = '';
  validMessage = true;

  constructor(
    private popoverController: PopoverController
  ) { }

  closeConfirmationPopover() {
    this.popoverController.dismiss();
  }

  saveUpdatedApproveList() {
    this.popoverController.dismiss({
      message: this.confirmationMessage
    });
  }

  ngOnInit() {
  }

}
