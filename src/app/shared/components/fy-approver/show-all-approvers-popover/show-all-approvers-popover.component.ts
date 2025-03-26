import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ApprovalState } from 'src/app/core/models/platform/approval-state.enum';
import { ReportApprovals } from 'src/app/core/models/platform/report-approvals.model';

@Component({
  selector: 'app-show-all-approvers-popover',
  templateUrl: './show-all-approvers-popover.component.html',
  styleUrls: ['./show-all-approvers-popover.component.scss'],
})
export class ShowAllApproversPopoverComponent {
  @Input() approvals: ReportApprovals[];

  approvalState: typeof ApprovalState = ApprovalState;

  constructor(private popoverController: PopoverController) {}

  closePopover(): void {
    this.popoverController.dismiss();
  }
}
