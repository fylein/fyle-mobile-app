import { Component, Input } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { switchMap, finalize, concatMap, reduce } from 'rxjs/operators';
import { from } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ApproverDialogComponent } from './approver-dialog/approver-dialog.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { ApproverReportsService } from 'src/app/core/services/platform/v1/approver/reports.service';
import { Approver } from './models/approver.model';
import { AdvanceRequests } from 'src/app/core/models/advance-requests.model';
import { Report } from 'src/app/core/models/platform/v1/report.model';
import { TranslocoService } from '@jsverse/transloco';
@Component({
  selector: 'app-add-approvers-popover',
  templateUrl: './add-approvers-popover.component.html',
  styleUrls: ['./add-approvers-popover.component.scss'],
})
export class AddApproversPopoverComponent {
  @Input() approverEmailsList: string[];

  @Input() id: string;

  @Input() ownerEmail: string;

  @Input() type: string;

  selectedApproversList: Approver[] = [];

  displayValue: string;

  confirmationMessage = '';

  constructor(
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private popoverController: PopoverController,
    private advanceRequestService: AdvanceRequestService,
    private loaderService: LoaderService,
    private approverReportsService: ApproverReportsService,
    private translocoService: TranslocoService
  ) {}

  async openModal(): Promise<void> {
    const approversListModal = await this.modalController.create({
      component: ApproverDialogComponent,
      componentProps: {
        approverEmailsList: this.approverEmailsList.slice(),
        initialApproverList: this.selectedApproversList.slice(),
        id: this.id,
        type: this.type,
        ownerEmail: this.ownerEmail,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await approversListModal.present();

    const { data } = await approversListModal.onWillDismiss<{ selectedApproversList: Approver[] }>();

    if (data && data.selectedApproversList) {
      this.selectedApproversList = data.selectedApproversList;
      this.displayValue = data.selectedApproversList
        .map((selectedApprover) => selectedApprover.name)
        .slice(0, 3)
        .join(', ');
      if (this.selectedApproversList && this.selectedApproversList.length > 3) {
        this.displayValue = this.displayValue + this.translocoService.translate('addApproversPopover.moreEllipsis');
      }
    }
  }

  saveUpdatedApproversList(): void {
    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => from(this.selectedApproversList.map((selectedApprover) => selectedApprover.email))),
        concatMap((approver) => {
          if (this.type === 'ADVANCE_REQUEST') {
            return this.advanceRequestService.addApprover(this.id, approver, this.confirmationMessage);
          } else {
            return this.approverReportsService.addApprover(this.id, approver, this.confirmationMessage);
          }
        }),
        reduce((acc: AdvanceRequests[] | Report[], curr: AdvanceRequests | Report) => {
          if (this.type === 'ADVANCE_REQUEST') {
            return (acc as AdvanceRequests[]).concat(curr as AdvanceRequests);
          } else {
            return (acc as Report[]).concat(curr as Report);
          }
        }, []),
        finalize(() => from(this.loaderService.hideLoader()))
      )
      .subscribe(() => {
        this.popoverController.dismiss({ reload: true });
      });
  }

  closeAddApproversPopover(): void {
    this.popoverController.dismiss();
  }
}
