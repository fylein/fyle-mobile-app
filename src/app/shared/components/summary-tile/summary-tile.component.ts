import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { PopoverController } from '@ionic/angular';
import { AdvanceApprover } from 'src/app/core/models/approver.model';
import { AddApproversPopoverComponent } from '../fy-approver/add-approvers-popover/add-approvers-popover.component';
import { Actions } from 'src/app/core/models/actions.model';

@Component({
  selector: 'app-summary-tile',
  templateUrl: './summary-tile.component.html',
  styleUrls: ['./summary-tile.component.scss'],
})
export class FySummaryTileComponent implements OnInit, OnChanges {
  @Input() currency: string;

  @Input() amount: number;

  @Input() purpose: string;

  @Input() status: string;

  @Input() approvals: [];

  @Input() orig_currency: string;

  @Input() actions: Actions;

  @Input() ownerEmail: string;

  @Input() type: string;

  refreshApprovers$ = new Subject();

  approverList$: Observable<AdvanceApprover>;

  constructor(private popoverController: PopoverController) {}

  getApproverEmails(activeApprovals) {
    return activeApprovals.map((approver) => approver.approver_email);
  }

  onUpdateApprover(message: boolean) {
    if (message) {
      this.refreshApprovers$.next();
    }
  }

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
    const { data } = await addApproversPopover.onWillDismiss();
  }

  ngOnChanges() {
    this.status = this.status === 'APPROVAL PENDING' ? 'Pending' : this.status;
  }

  ngOnInit() {}
}
