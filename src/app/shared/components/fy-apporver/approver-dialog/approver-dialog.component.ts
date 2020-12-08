import { Component, OnInit, Input } from '@angular/core';
import { Observable, from, noop } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { switchMap, map, finalize, concatMap } from 'rxjs/operators';
import { ModalController, PopoverController } from '@ionic/angular';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';
import { ConfirmationCommentPopoverComponent } from './confirmation-comment-popover/confirmation-comment-popover.component';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-approver-dialog',
  templateUrl: './approver-dialog.component.html',
  styleUrls: ['./approver-dialog.component.scss']
})
export class ApproverDialogComponent implements OnInit {

  @Input() request;
  @Input() from;

  approverList$: Observable<any>;
  selectedApprovers: any[] = [];

  constructor(
    private loaderService: LoaderService,
    private orgUserService: OrgUserService,
    private modalController: ModalController,
    private tripRequestsService: TripRequestsService,
    private popoverController: PopoverController,
    private advanceRequestService: AdvanceRequestService,
    private router: Router
  ) { }

  closeApproverModal() {
    this.modalController.dismiss();
  }

  async saveUpdatedApproveList() {

    const saveApproverConfirmationPopover = await this.popoverController.create({
      component: ConfirmationCommentPopoverComponent,
      componentProps: {
        selectedApprovers: this.selectedApprovers
      },
      cssClass: 'dialog-popover'
    });

    saveApproverConfirmationPopover.present();

    const { data } = await saveApproverConfirmationPopover.onWillDismiss();
    if (data.message) {
      if (this.from === 'TRIP_REQUEST') {
        from(this.loaderService.showLoader()).pipe(
          switchMap(() => from(this.selectedApprovers)),
          concatMap(approver => this.tripRequestsService.addApproverETripRequests(this.request.trp_id, approver.us.email, data.message)),
          finalize(() => from(this.loaderService.hideLoader()))
        ).subscribe(noop);
        this.modalController.dismiss();
      }
      if (this.from === 'ADVANCE_REQUEST') {
        from(this.loaderService.showLoader()).pipe(
          switchMap(() => from(this.selectedApprovers)),
          concatMap(approver => this.advanceRequestService.addApprover(this.request.areq_id, approver.us.email, data.message)),
          finalize(() => from(this.loaderService.hideLoader()))
        ).subscribe(noop);
        this.modalController.dismiss();
      }
    }
  }

  onSelectApprover(approver, event) {
    if (event.checked) {
      this.selectedApprovers.push(approver);
    }

    if (!event.checked) {
      const index = this.selectedApprovers.indexOf(approver);
      if (index > -1) {
        this.selectedApprovers.splice(index, 1);
      }
    }

  }

  ngOnInit() {
    this.approverList$ = from(this.loaderService.showLoader('Loading Approvers', 10000)).pipe(
      switchMap(() => {
        return this.orgUserService.getAllCompanyEouc();
      }),
      map(eouc => {
        return this.orgUserService.excludeByStatus(eouc, 'DISABLED');
      }),
      map(eouc => {
        if (this.from === 'TRIP_REQUEST') {
          return eouc.filter(approver => {
            return this.request.approvers.indexOf(approver.ou.id) < 0;
          });
        }

        if (this.from === 'ADVANCE_REQUEST') {
          return eouc.filter(approver => {
            return this.request.areq_approvers_ids.indexOf(approver.ou.id) < 0;
          });
        }
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    );
  }
}
