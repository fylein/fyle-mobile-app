import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Observable, from, fromEvent } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { switchMap, map, finalize, concatMap, reduce, startWith, distinctUntilChanged } from 'rxjs/operators';
import { ModalController, PopoverController } from '@ionic/angular';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';
import { ConfirmationCommentPopoverComponent } from './confirmation-comment-popover/confirmation-comment-popover.component';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { Employee } from 'src/app/core/models/employee.model';
import { isEqual, cloneDeep } from 'lodash';
import { ReportService } from 'src/app/core/services/report.service';


@Component({
  selector: 'app-approver-dialog',
  templateUrl: './approver-dialog.component.html',
  styleUrls: ['./approver-dialog.component.scss']
})
export class ApproverDialogComponent implements OnInit, AfterViewInit {

  @ViewChild('searchBar') searchBarRef: ElementRef;

  @Input() approverEmailsList: string[] = [];
  @Input() id: string;
  @Input() ownerEmail: string;
  @Input() from;
  value;

  approverList$: Observable<any>;
  searchedApprovers$: Observable<Employee[]>;
  intialSelectedApproverEmails: string[] = [];
  searchTerm;
  areApproversAdded = true;

  constructor(
    private loaderService: LoaderService,
    private orgUserService: OrgUserService,
    private modalController: ModalController,
    private tripRequestsService: TripRequestsService,
    private popoverController: PopoverController,
    private advanceRequestService: AdvanceRequestService,
    private reportService: ReportService
  ) { }

  closeApproverModal() {
    this.modalController.dismiss();
  }

  async saveUpdatedApproveList() {

    const newAddedApprovers = this.approverEmailsList.filter(approver => this.intialSelectedApproverEmails.indexOf(approver) === -1);

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
      from(this.loaderService.showLoader()).pipe(
        switchMap(() => from(newAddedApprovers)),
        concatMap(approver => {
          if (this.from === 'TRIP_REQUEST') {
            return this.tripRequestsService.addApproverETripRequests(this.id, approver, data.message);
          } else if (this.from === 'ADVANCE_REQUEST')  {
            return this.advanceRequestService.addApprover(this.id, approver, data.message);
          }
          else {
            return this.reportService.addApprover(this.id, approver, data.message);
          }
        }),
        reduce((acc, curr) => acc.concat(curr), []),
        finalize(() => from(this.loaderService.hideLoader()))
      ).subscribe(() => {
        this.modalController.dismiss({reload: true});
      });
    }
  }

  onSelectApprover(approver: Employee, event: { checked: boolean; }) {
    if (event.checked) {
      this.approverEmailsList.push(approver.us_email);
    } else {
      const index = this.approverEmailsList.indexOf(approver.us_email);
      this.approverEmailsList.splice(index, 1);
    }

    this.areApproversAdded = isEqual(this.intialSelectedApproverEmails, this.approverEmailsList);

  }

  getDefaultUsersList() {
    const params: any = {
      order: 'us_full_name.asc,us_email.asc,ou_id',
    };

    if (this.approverEmailsList.length > 0) {
      params.us_email = `in.(${this.approverEmailsList.join(',')})`;
    } else {
      params.limit = 20;
    }

    return from(this.loaderService.showLoader('Loading...')).pipe(
      switchMap(_ => {
        return this.orgUserService.getEmployeesBySearch(params);
      }),
      map(approvers => {
        return approvers.map(approver => {
          approver.is_selected = true;
          return approver;
        });
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    );
  }

  getSearchedUsersList(searchText?: string) {
    const params: any = {
      limit: 20,
      order: 'us_full_name.asc,us_email.asc,ou_id',
    };

    if (searchText) {
      params.or = `(us_email.ilike.*${searchText}*,us_full_name.ilike.*${searchText}*)`;
    }

    return this.orgUserService.getEmployeesBySearch(params).pipe(
      map(eouc => {
        return eouc.filter(eou => {
          return this.approverEmailsList.indexOf(eou.us_email) === -1;
        });
      }),
      map(eouc => {
        return eouc.map(eou => {
          eou.is_selected = this.approverEmailsList.indexOf(eou.us_email) > -1;
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
          employees = employees.filter(employee => this.intialSelectedApproverEmails.indexOf(employee.us_email) === -1);
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
    this.intialSelectedApproverEmails = cloneDeep(this.approverEmailsList);
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
