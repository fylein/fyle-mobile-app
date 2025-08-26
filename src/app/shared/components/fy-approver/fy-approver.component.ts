import { Component, Input, inject, input, output } from '@angular/core';
import { Observable } from 'rxjs';
import { PopoverController } from '@ionic/angular';
import { AddApproversPopoverComponent } from './add-approvers-popover/add-approvers-popover.component';
import { AdvanceRequestActions } from 'src/app/core/models/advance-request-actions.model';

@Component({
  selector: 'app-fy-approver',
  templateUrl: './fy-approver.component.html',
  styleUrls: ['./fy-approver.component.scss'],
  standalone: false,
})
export class FyApproverComponent {
  private popoverController = inject(PopoverController);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() approverEmailsList;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() id: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() ownerEmail: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() type;

  readonly actions = input<AdvanceRequestActions>(undefined);

  readonly notify = output<string>();

  approverList$: Observable<any>;

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
