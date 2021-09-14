import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { PopoverController } from '@ionic/angular';
import { AddApproversPopoverComponent } from './add-approvers-popover/add-approvers-popover.component';

@Component({
  selector: 'app-fy-apporver',
  templateUrl: './fy-apporver.component.html',
  styleUrls: ['./fy-apporver.component.scss'],
})
export class FyApporverComponent {
  @Input() approverEmailsList;

  @Input() id: string;

  @Input() ownerEmail: string;

  @Input() from;

  @Output() notify: EventEmitter<any> = new EventEmitter<any>();

  approverList$: Observable<any>;

  constructor(
    private popoverController: PopoverController
  ) {}

  async openApproverListDialog() {
    const addApproversPopover = await this.popoverController.create({
      component: AddApproversPopoverComponent,
      componentProps: {
        approverEmailsList: this.approverEmailsList,
        id: this.id,
        from: this.from,
        ownerEmail: this.ownerEmail,
      },
      cssClass: 'dialog-popover',
      backdropDismiss: false
    });

    await addApproversPopover.present();
    const { data } = await addApproversPopover.onWillDismiss();

    if(data) {
      this.notify.emit(data);
    }
  }
}
