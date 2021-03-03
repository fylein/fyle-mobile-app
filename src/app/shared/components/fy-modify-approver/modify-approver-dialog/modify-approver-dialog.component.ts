import {Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import {Observable, from, noop, fromEvent} from 'rxjs';
import {LoaderService} from 'src/app/core/services/loader.service';
import {OrgUserService} from 'src/app/core/services/org-user.service';
import {ModalController, PopoverController} from '@ionic/angular';
import {switchMap, reduce, finalize, map, tap, mergeMap, concatMap, startWith, distinctUntilChanged} from 'rxjs/operators';
import {ModifyApproverConfirmationPopoverComponent} from './modify-approver-confirmation-popover/modify-approver-confirmation-popover.component';
import {ReportService} from 'src/app/core/services/report.service';
import { isEqual, cloneDeep } from 'lodash';
import { HttpParameterCodec } from '@angular/common/http';

@Component({
  selector: 'app-modify-approver-dialog',
  templateUrl: './modify-approver-dialog.component.html',
  styleUrls: ['./modify-approver-dialog.component.scss'],
})
export class ModifyApproverDialogComponent implements OnInit, AfterViewInit {

  @ViewChild('searchBar') searchBarRef: ElementRef;
  @Input() approverList;
  @Input() id;
  @Input() from;
  @Input() object;

  searchedApprovers$: Observable<any>;
  intialSelectedApprovers: any[] = [];
  equals = true;
  value;

  constructor(
    private loaderService: LoaderService,
    private orgUserService: OrgUserService,
    private modalController: ModalController,
    private popoverController: PopoverController,
    private reportService: ReportService
  ) {
  }

  closeApproverModal() {
    this.modalController.dismiss();
  }

  async saveUpdatedApproveList() {
    let reportApprovals = [];

    const selectedApprovers = this.approverList.filter(approver => {
      return !this.intialSelectedApprovers.find(intialSelectedApprover => intialSelectedApprover === approver);
    });

    const removedApprovers = this.intialSelectedApprovers.filter(approver => {
      return !this.approverList.find(intialSelectedApprover => intialSelectedApprover === approver);
    });

    this.reportService.getApproversByReportId(this.id).pipe(
      map(res => {
        reportApprovals = res.filter(approval => {
          return removedApprovers.some(removedApprover => {
            return removedApprover === approval.approver_email && approval.state !== 'APPROVAL_DONE';
          });
        });
      })
    ).subscribe(noop);

    const saveApproverConfirmationPopover = await this.popoverController.create({
      component: ModifyApproverConfirmationPopoverComponent,
      componentProps: {
        selectedApprovers,
        removedApprovers
      },
      cssClass: 'dialog-popover'
    });

    saveApproverConfirmationPopover.present();

    const {data} = await saveApproverConfirmationPopover.onWillDismiss();
    if (data && data.message) {

      const selectedApproversTemp = selectedApprovers.map(email => ({email, command: 'add'}));
      const reportApprovalsTemp = reportApprovals.map(eou => ({eou, command: 'remove'}));

      const changedOps = selectedApproversTemp.concat(reportApprovalsTemp);

      from(changedOps).pipe(
        concatMap((res: any) => {
          if (res.command === 'add') {
            return this.reportService.addApprover(this.id, res.email, data.message);
          } else {
            return this.reportService.removeApprover(this.id, res.eou.id);
          }
        }),
        reduce((acc, curr) => {
          return acc.concat(curr);
        }, []),
        finalize(() => {
          this.modalController.dismiss({reload: true});
        })
      ).subscribe(noop);
    }
  }

  getDefaultApproversList() {
    const params: any = {
      order: 'us_email.asc,ou_id',
      us_email: `in.(${this.approverList.join(',')})`
    };

    return from(this.loaderService.showLoader('Loading...')).pipe(
      switchMap(_ => {
        return this.orgUserService.getEmployeesBySearch(params);
      }),
      map(eouc => {
        return eouc.map(eou => {
          eou.checked = this.approverList.indexOf(eou.us_email) > -1;
          return eou;
        });
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    );
  }

  getSearchedApproversList(searchText: string) {
    const params: any = {
      limit: 20,
      order: 'us_email.asc,ou_id',
    };

    if (searchText) {
      params.us_email = `ilike.*${searchText} *`;
    }

    return this.orgUserService.getEmployeesBySearch(params).pipe(
      map(eouc => {
        return eouc.map(eou => {
          eou.checked = this.approverList.indexOf(eou.us_email) > -1;
          return eou;
        });
      })
    );
  }

  getApproversList(searchText) {
    if (searchText) {
      return this.getSearchedApproversList(searchText);
    } else {
      return this.getDefaultApproversList().pipe(
        switchMap(employees => {
          return this.getSearchedApproversList(null).pipe(
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
        return this.getApproversList(searchText);
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
