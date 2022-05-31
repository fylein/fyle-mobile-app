import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { PopoverController } from '@ionic/angular';
import { AddApproversPopoverComponent } from './add-approvers-popover/add-approvers-popover.component';

@Component({
  selector: 'app-fy-approver',
  templateUrl: './fy-approver.component.html',
  styleUrls: ['./fy-approver.component.scss'],
})
export class FyApproverComponent {
  @Input() approverEmailsList;

  @Input() id: string;

  @Input() ownerEmail: string;

  @Input() type;

  @Output() notify: EventEmitter<any> = new EventEmitter<any>();

  approverList$: Observable<any>;

  constructor(private popoverController: PopoverController) {}

  async openApproverListDialog() {
    const addApproversPopover = await this.popoverController.create({
      component: AddApproversPopoverComponent,
      componentProps: {
        approverEmailsList: this.approverEmailsList,
        id: this.id,
        type: this.type,
        ownerEmail: this.ownerEmail,
      },
      cssClass: 'fy-dialog-popover',
      backdropDismiss: false,
    });

    await addApproversPopover.present();
    const { data } = await addApproversPopover.onWillDismiss();

    if (data) {
      this.notify.emit(data);
    }
  }
}
