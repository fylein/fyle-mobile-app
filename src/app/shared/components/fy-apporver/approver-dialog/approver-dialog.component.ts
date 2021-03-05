import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Observable, from, fromEvent, noop } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { switchMap, map, finalize, concatMap, reduce, startWith, distinctUntilChanged, tap } from 'rxjs/operators';
import { ModalController, PopoverController } from '@ionic/angular';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';
import { ConfirmationCommentPopoverComponent } from './confirmation-comment-popover/confirmation-comment-popover.component';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { Employee } from 'src/app/core/models/employee.model';
import { isEqual, cloneDeep } from 'lodash';
import { AuthService } from 'src/app/core/services/auth.service';


@Component({
  selector: 'app-approver-dialog',
  templateUrl: './approver-dialog.component.html',
  styleUrls: ['./approver-dialog.component.scss']
})
export class ApproverDialogComponent implements OnInit, AfterViewInit {

  @ViewChild('searchBar') searchBarRef: ElementRef;

  @Input() approverList: any[] = [];
  @Input() id: string;
  @Input() ownerEmail: string;
  @Input() from;
  value;

  approverList$: Observable<any>;
  searchedApprovers$: Observable<Employee[]>;
  selectedApprovers: any[] = [];
  intialSelectedApprovers: any[] = [];
  searchTerm;
  equals = true;

  constructor(
    private loaderService: LoaderService,
    private orgUserService: OrgUserService,
    private modalController: ModalController,
    private tripRequestsService: TripRequestsService,
    private popoverController: PopoverController,
    private advanceRequestService: AdvanceRequestService,
    private authService: AuthService
  ) { }

  closeApproverModal() {
    this.modalController.dismiss();
  }

  async saveUpdatedApproveList() {

    const newAddedApprovers = this.approverList.filter(approver => this.intialSelectedApprovers.indexOf(approver) < 0);

    const saveApproverConfirmationPopover = await this.popoverController.create({
      component: ConfirmationCommentPopoverComponent,
      componentProps: {
        selectedApprovers: newAddedApprovers
      },
      cssClass: 'dialog-popover'
    });

    saveApproverConfirmationPopover.present();

    const { data } = await saveApproverConfirmationPopover.onWillDismiss();
    if (data && data.message) {
      if (this.from === 'TRIP_REQUEST') {
        from(this.loaderService.showLoader()).pipe(
          switchMap(() => from(newAddedApprovers)),
          concatMap(approver => this.tripRequestsService.addApproverETripRequests(this.id, approver, data.message)),
          reduce((acc, curr) => acc.concat(curr), []),
          finalize(() => from(this.loaderService.hideLoader()))
        ).subscribe(() => {
          this.modalController.dismiss({reload: true});
        });
      }
      if (this.from === 'ADVANCE_REQUEST') {
        from(this.loaderService.showLoader()).pipe(
          switchMap(() => from(newAddedApprovers)),
          concatMap(approver => this.advanceRequestService.addApprover(this.id, approver, data.message)),
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
      this.approverList.push(approver.us_email);
    } else {
      const index = this.approverList.indexOf(approver.us_email);
      this.approverList.splice(index, 1);
    }

    this.approverList.sort((a, b) => a < b ? -1 : 1);

    this.equals = isEqual(this.intialSelectedApprovers, this.approverList);

  }

  getDefaultUsersList() {
    const params: any = {
      order: 'us_email.asc,ou_id',
    };

    if (this.approverList.length > 0) {
      params.us_email = `in.(${this.approverList.join(',')})`;
    } else {
      params.limit = 20;
    }

    return from(this.loaderService.showLoader('Loading...')).pipe(
      switchMap(_ => {
        return this.orgUserService.getEmployeesBySearch(params);
      }),
      map(approvers => {
        return approvers.map(approver => {
          approver.checked = true;
          return approver;
        });
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    );
  }

  getSearchedUsersList(searchText: string) {
    const params: any = {
      limit: 20,
      order: 'us_email.asc,ou_id',
    };

    if (searchText) {
      params.or = `(us_email.ilike.*${searchText}*,us_full_name.ilike.*${searchText}*)`;
    }

    return this.orgUserService.getEmployeesBySearch(params).pipe(
      map(eouc => {
        return eouc.filter(eou => {
          return this.approverList.indexOf(eou.us_email) < 0;
        });
      }),
      map(eouc => {
        return eouc.map(eou => {
          eou.checked = this.approverList.indexOf(eou.us_email) > -1;
          return eou;
        }).filter(employee => employee.us_email !== this.ownerEmail);
      })
    );
  }

  getUsersList(searchText) {
    if (searchText) {
      return this.getSearchedUsersList(searchText);
    } else {
      return this.getDefaultUsersList().pipe(
        switchMap(employees => {
          employees = employees.filter(employee => this.intialSelectedApprovers.indexOf(employee.us_email) < 0);
          return this.getSearchedUsersList(null).pipe(
            map(searchedEmployees => {
              searchedEmployees = searchedEmployees.filter(searchedEmployee => {
                return !employees.find(employee => employee.us_email === searchedEmployee.us_email);
              });
              return employees.concat(searchedEmployees);
            })
          );
        })
      );
    }
  }

  ngOnInit() {
    this.intialSelectedApprovers = cloneDeep(this.approverList);
    this.intialSelectedApprovers.sort((a, b) => a < b ? -1 : 1);
  }

  ngAfterViewInit() {
    this.searchedApprovers$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText: any) => {
        return this.getUsersList(searchText);
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
