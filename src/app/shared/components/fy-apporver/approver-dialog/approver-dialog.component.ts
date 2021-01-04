import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Observable, from, fromEvent } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { switchMap, map, finalize, concatMap, reduce, startWith, distinctUntilChanged } from 'rxjs/operators';
import { ModalController, PopoverController } from '@ionic/angular';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';
import { ConfirmationCommentPopoverComponent } from './confirmation-comment-popover/confirmation-comment-popover.component';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';


@Component({
  selector: 'app-approver-dialog',
  templateUrl: './approver-dialog.component.html',
  styleUrls: ['./approver-dialog.component.scss']
})
export class ApproverDialogComponent implements OnInit, AfterViewInit {

  @ViewChild('searchBar') searchBarRef: ElementRef;

  @Input() approverList;
  @Input() id;
  @Input() from;

  approverList$: Observable<any>;
  searchedApprovers$: Observable<any>;
  selectedApprovers: any[] = [];
  searchTerm;

  constructor(
    private loaderService: LoaderService,
    private orgUserService: OrgUserService,
    private modalController: ModalController,
    private tripRequestsService: TripRequestsService,
    private popoverController: PopoverController,
    private advanceRequestService: AdvanceRequestService
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
    if (data && data.message) {
      if (this.from === 'TRIP_REQUEST') {
        from(this.loaderService.showLoader()).pipe(
          switchMap(() => from(this.selectedApprovers)),
          concatMap(approver => this.tripRequestsService.addApproverETripRequests(this.id, approver.us.email, data.message)),
          reduce((acc, curr) => acc.concat(curr), []),
          finalize(() => from(this.loaderService.hideLoader()))
        ).subscribe(() => {
          this.modalController.dismiss({reload: true});
        });
      }
      if (this.from === 'ADVANCE_REQUEST') {
        from(this.loaderService.showLoader()).pipe(
          switchMap(() => from(this.selectedApprovers)),
          concatMap(approver => this.advanceRequestService.addApprover(this.id, approver.us.email, data.message)),
          reduce((acc, curr) => acc.concat(curr), []),
          finalize(() => from(this.loaderService.hideLoader()))
        ).subscribe(() => {
          this.modalController.dismiss({reload: true});
        });
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
            return this.approverList.indexOf(approver.us.email) < 0;
          });
        }

        if (this.from === 'ADVANCE_REQUEST') {
          return eouc.filter(approver => {
            return this.approverList.indexOf(approver.us.email) < 0;
          });
        }
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    );
  }

  ngAfterViewInit() {
    this.searchedApprovers$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText: any) => {
        return this.approverList$.pipe(map(filteredApprovers => {
          return filteredApprovers.filter(filteredApprover => {
            return !searchText || filteredApprover.us.email.indexOf(searchText.toLowerCase()) > -1;
          });
       }));
      })
    );
  }
}
