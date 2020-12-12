import { Component, OnInit, Input } from '@angular/core';
import { Observable, from } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { ModalController, PopoverController } from '@ionic/angular';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { switchMap, concatMap, reduce, finalize, map, tap } from 'rxjs/operators';
import { ModifyApproverConfirmationPopoverComponent } from './modify-approver-confirmation-popover/modify-approver-confirmation-popover.component';
import { ReportService } from 'src/app/core/services/report.service';

@Component({
  selector: 'app-modify-approver-dialog',
  templateUrl: './modify-approver-dialog.component.html',
  styleUrls: ['./modify-approver-dialog.component.scss'],
})
export class ModifyApproverDialogComponent implements OnInit {

  @Input() approverList;
  @Input() id;
  @Input() from;

  approverList$: Observable<any>;
  selectedApprovers: any[] = [];
  intialSelectedApprovers: any[] = [];
  equals: boolean = false;

  constructor(
    private loaderService: LoaderService,
    private orgUserService: OrgUserService,
    private modalController: ModalController,
    private popoverController: PopoverController,
    private reportService: ReportService
  ) { }

  closeApproverModal() {
    this.modalController.dismiss();
  }

  async saveUpdatedApproveList() {

    const selectedApprovers = this.selectedApprovers.filter(approver => this.intialSelectedApprovers.indexOf(approver) === -1);

    const saveApproverConfirmationPopover = await this.popoverController.create({
      component: ModifyApproverConfirmationPopoverComponent,
      componentProps: {
        selectedApprovers: selectedApprovers
      },
      cssClass: 'dialog-popover'
    });

    saveApproverConfirmationPopover.present();

    const { data } = await saveApproverConfirmationPopover.onWillDismiss();
    if (data && data.message) {
      if (this.from === 'TRIP_REQUEST') {
        // from(this.loaderService.showLoader()).pipe(
        //   switchMap(() => from(this.selectedApprovers)),
        //   concatMap(approver => this.reportService.addApproverETripRequests(this.id, approver.us.email, data.message)),
        //   reduce((acc, curr) => acc.concat(curr), []),
        //   finalize(() => from(this.loaderService.hideLoader()))
        // ).subscribe(() => {
        //   this.modalController.dismiss({reload: true});
        // });
      }
    }
  }

  onSelectApprover(approver, event) {
    if (event.checked) {
      approver.checked = true;
      this.selectedApprovers.push(approver);
    }

    if (!event.checked) {
      approver.checked = false;
      const index = this.selectedApprovers.indexOf(approver);
      if (index > -1) {
        this.selectedApprovers.splice(index, 1);
      }
    }
    this.equals = this.checkDifference(this.intialSelectedApprovers, this.selectedApprovers);
  }

  checkDifference(intialSelectedApprovers, selectedApprovers) {
    return intialSelectedApprovers.some(approver => {
      return selectedApprovers.some(selectedApprover => {
        return approver.ou.id !== selectedApprover.ou.id;
      });
    });
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
        eouc.filter(approver => {
          if (this.approverList.indexOf(approver.ou.id) > -1) {
            approver['checked'] = true;
            this.selectedApprovers.push(approver)
          } else {
            approver['checked'] = false;
          }
        });
        return this.selectedApprovers.concat(eouc);
      }),
      tap(() => {
        this.intialSelectedApprovers = [...this.selectedApprovers];
        this.equals = this.checkDifference(this.intialSelectedApprovers, this.selectedApprovers);
      }),
      finalize(() => {
        from(this.loaderService.hideLoader());
      })
    );
  }
}
