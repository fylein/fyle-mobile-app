import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Observable, from, fromEvent } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { switchMap, map, finalize, concatMap, reduce, startWith, distinctUntilChanged } from 'rxjs/operators';
import { ModalController, PopoverController } from '@ionic/angular';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';
import { ConfirmationCommentPopoverComponent } from './confirmation-comment-popover/confirmation-comment-popover.component';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import {ExtendedOrgUser} from '../../../../core/models/extended-org-user.model';


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
  value;

  approverList$: Observable<any>;
  searchedApprovers$: Observable<ExtendedOrgUser[]>;
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
    this.approverList$ = from(this.loaderService.showLoader('Loading Approvers')).pipe(
      switchMap(() => {
        const params: any = {
          limit: 20,
          order: 'us_email.asc,ou_id',
        }
        return this.orgUserService.getEmployeesBySearch(params);
      }),
      map(eouc => {
        return eouc.filter(approver => {
          return this.approverList.indexOf(approver.us.email) < 0;
        });
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

        const params: any = {
          limit: 20,
          order: 'us_email.asc,ou_id',
        };

        if (searchText) {
          params.us_email = 'ilike.*' + searchText + '*';
        }

        return this.orgUserService.getEmployeesBySearch(params).pipe(
          map(filteredApprovers => {
            return filteredApprovers.filter(approver => {
              return this.approverList.indexOf(approver.us.email) < 0;
            });
        }));
      })
    );
  }

  clearValue() {
    this.value = '';
    const searchInput = this.searchBarRef.nativeElement as HTMLInputElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }
}
