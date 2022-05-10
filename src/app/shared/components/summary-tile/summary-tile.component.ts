import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { from, Subject, forkJoin } from 'rxjs';
import { PopoverController } from '@ionic/angular';
import { AddApproversPopoverComponent } from '../fy-approver/add-approvers-popover/add-approvers-popover.component';
@Component({
  selector: 'app-summary-tile',
  templateUrl: './summary-tile.component.html',
  styleUrls: ['./summary-tile.component.scss'],
})
export class FySummaryTileComponent implements OnInit {
  @Output() notify: EventEmitter<any> = new EventEmitter<any>();

  @Input() category: string;

  @Input() merchant: string;

  @Input() project: string;

  @Input() currency: string;

  @Input() amount: number;

  @Input() paymentModeIcon: string;

  @Input() purpose: string;

  @Input() status: string;

  @Input() approvals: [];

  @Input() orig_currency: string;

  @Input() actions: Object;

  @Input() approverEmailsList: string[];

  @Input() id: string;

  @Input() ownerEmail: string;

  @Input() type: string;

  refreshApprovers$ = new Subject();

  approverList$: Observable<any>;

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

  ngOnInit() {}
}
