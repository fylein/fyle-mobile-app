import { Injectable } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AddApproversPopoverComponent } from '../../shared/components/fy-approver/add-approvers-popover/add-approvers-popover.component';

@Injectable({
  providedIn: 'root',
})
export class openApproverListDialog {
  ownerEmail: string;

  type: string;

  constructor(private popoverController: PopoverController) {}

  async openApproverListDialog() {
    const addApproversPopover = await this.popoverController.create({
      component: AddApproversPopoverComponent,
      componentProps: {
        type: this.type,
        ownerEmail: this.ownerEmail,
      },
      cssClass: 'fy-dialog-popover',
      backdropDismiss: false,
    });

    await addApproversPopover.present();
  }
}
