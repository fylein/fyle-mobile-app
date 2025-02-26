import { Component, Input, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { ApprovalState } from 'src/app/core/models/platform/approval-state.enum';
import { ReportApprovals } from 'src/app/core/models/platform/report-approvals.model';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';

@Component({
  selector: 'app-show-all-approvers-popover',
  templateUrl: './show-all-approvers-popover.component.html',
  styleUrls: ['./show-all-approvers-popover.component.scss'],
})
export class ShowAllApproversPopoverComponent implements OnInit {
  @Input() approvals: ReportApprovals[];

  approvalState: typeof ApprovalState = ApprovalState;

  constructor(
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private popoverController: PopoverController
  ) {}

  ngOnInit(): void {
    if (this.approvals) {
      this.approvals.sort((a, b) => a.rank - b.rank);
    }
  }

  closePopover(): void {
    this.popoverController.dismiss();
  }
}
