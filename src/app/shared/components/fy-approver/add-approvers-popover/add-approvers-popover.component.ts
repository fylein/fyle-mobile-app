import { Component, Input } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { switchMap, finalize, concatMap, reduce } from 'rxjs/operators';
import { from } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ApproverDialogComponent } from './approver-dialog/approver-dialog.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { ReportService } from 'src/app/core/services/report.service';

@Component({
  selector: 'app-add-approvers-popover',
  templateUrl: './add-approvers-popover.component.html',
  styleUrls: ['./add-approvers-popover.component.scss'],
})
export class AddApproversPopoverComponent {
  @Input() approverEmailsList;

  @Input() id: string;

  @Input() ownerEmail: string;

  @Input() type;

  selectedApproversList = [];

  displayValue: string;

  confirmationMessage = '';

  constructor(
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private popoverController: PopoverController,
    private advanceRequestService: AdvanceRequestService,
    private reportService: ReportService,
    private loaderService: LoaderService,
    private tripRequestsService: TripRequestsService
  ) {}

  async openModal() {
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

    const { data } = await approversListModal.onWillDismiss();

    if (data && data.selectedApproversList) {
      this.selectedApproversList = data.selectedApproversList;
      this.displayValue = data.selectedApproversList
        .map((selectedApprover) => selectedApprover.name)
        .slice(0, 3)
        .join(', ');
      if (this.selectedApproversList && this.selectedApproversList.length > 3) {
        this.displayValue = this.displayValue + ', ...';
      }
    }
  }

  saveUpdatedApproversList() {
    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => from(this.selectedApproversList.map((selectedApprover) => selectedApprover.email))),
        concatMap((approver) => {
          if (this.type === 'TRIP_REQUEST') {
            return this.tripRequestsService.addApproverETripRequests(this.id, approver, this.confirmationMessage);
          } else if (this.type === 'ADVANCE_REQUEST') {
            return this.advanceRequestService.addApprover(this.id, approver, this.confirmationMessage);
          } else {
            return this.reportService.addApprover(this.id, approver, this.confirmationMessage);
          }
        }),
        reduce((acc, curr) => acc.concat(curr), []),
        finalize(() => from(this.loaderService.hideLoader()))
      )
      .subscribe(() => {
        this.popoverController.dismiss({ reload: true });
      });
  }

  closeAddApproversPopover() {
    this.popoverController.dismiss();
  }
}
