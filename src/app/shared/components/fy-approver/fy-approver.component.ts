import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { PopoverController, IonicModule } from '@ionic/angular';
import { AddApproversPopoverComponent } from './add-approvers-popover/add-approvers-popover.component';
import { AdvanceRequestActions } from 'src/app/core/models/advance-request-actions.model';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-fy-approver',
  templateUrl: './fy-approver.component.html',
  styleUrls: ['./fy-approver.component.scss'],
  standalone: true,
  imports: [MatIcon, IonicModule, TranslocoPipe],
})
export class FyApproverComponent {
  @Input() approverEmailsList;

  @Input() id: string;

  @Input() ownerEmail: string;

  @Input() type;

  @Input() actions: AdvanceRequestActions;

  @Output() notify: EventEmitter<string> = new EventEmitter<string>();

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
