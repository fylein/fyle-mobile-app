import { Component, Input, inject } from '@angular/core';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, PopoverController } from '@ionic/angular/standalone';
import { ApprovalState } from 'src/app/core/models/platform/approval-state.enum';
import { ReportApprovals } from 'src/app/core/models/platform/report-approvals.model';
import { MatIcon } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { EllipsisPipe } from '../../../pipes/ellipses.pipe';

@Component({
  selector: 'app-show-all-approvers-popover',
  templateUrl: './show-all-approvers-popover.component.html',
  styleUrls: ['./show-all-approvers-popover.component.scss'],
  imports: [
    EllipsisPipe,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
    MatIcon,
    NgClass,
    TranslocoPipe
  ],
})
export class ShowAllApproversPopoverComponent {
  private popoverController = inject(PopoverController);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() approvals: ReportApprovals[];

  approvalState: typeof ApprovalState = ApprovalState;

  closePopover(): void {
    this.popoverController.dismiss();
  }
}
