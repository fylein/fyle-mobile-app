import {Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import {Observable, from, noop, fromEvent} from 'rxjs';
import {LoaderService} from 'src/app/core/services/loader.service';
import {OrgUserService} from 'src/app/core/services/org-user.service';
import {ModalController, PopoverController} from '@ionic/angular';
import {switchMap, reduce, finalize, map, tap, mergeMap, concatMap, startWith, distinctUntilChanged} from 'rxjs/operators';
import {ModifyApproverConfirmationPopoverComponent} from './modify-approver-confirmation-popover/modify-approver-confirmation-popover.component';
import {ReportService} from 'src/app/core/services/report.service';
import {isEqual} from 'lodash';
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

  approverList$: Observable<any>;
  approverListCopy$: Observable<any>;
  searchedApprovers$: Observable<any>;
  selectedApprovers: any[] = [];
  intialSelectedApprovers: any[] = [];
  equals = false;
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

    const selectedApprovers = this.selectedApprovers.filter(approver => {
      return !this.intialSelectedApprovers.find(x => x.us_email === approver.us_email);
    });

    const removedApprovers = this.intialSelectedApprovers.filter(approver => {
      return !this.selectedApprovers.find(x => x.us_email === approver.us_email);
    });

    this.reportService.getApproversByReportId(this.id).pipe(
      map(res => {
        reportApprovals = res.filter(approval => {
          return removedApprovers.some(removedApprover => {
            return removedApprover.us_email === approval.approver_email && approval.state !== 'APPROVAL_DONE';
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

      const selectedApproversTemp = selectedApprovers.map(eou => ({eou, command: 'add'}));
      const reportApprovalsTemp = reportApprovals.map(eou => ({eou, command: 'remove'}));

      const changedOps = selectedApproversTemp.concat(reportApprovalsTemp);

      from(changedOps).pipe(
        concatMap(res => {
          if (res.command === 'add') {
            return this.reportService.addApprover(this.id, res.eou.us_email, data.message);
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

  onSelectApprover(approver, event) {
    if (event.checked) {
      approver.checked = true;
      this.selectedApprovers.push(approver);
    }

    if (!event.checked) {
      approver.checked = false;
      const unSelectedApprover = this.selectedApprovers.find(selectedApprover => selectedApprover.us_email === approver.us_email);
      const index = this.selectedApprovers.indexOf(unSelectedApprover);
      if (index > -1) {
        this.selectedApprovers.splice(index, 1);
      }
    }

    // soting this bcz loadash isEquals deep compares the object
    this.intialSelectedApprovers.sort((a, b) => a.us_email < b.us_email ? -1 : 1);
    this.selectedApprovers.sort((a, b) => a.us_email < b.us_email ? -1 : 1);

    this.equals = isEqual(this.intialSelectedApprovers, this.selectedApprovers);
  }

  ngOnInit() {
    this.approverList$ = from(
      this.loaderService.showLoader('Loading Approvers', 10000)
    ).pipe(
      switchMap(() => {
        const params: any = {
          us_email: 'in.(' + this.approverList.join(',') + ')',
          order: 'us_email.asc,ou_id',
        };
        return this.orgUserService.getEmployeesBySearch(params).pipe(
          map(employees => {
            return employees.map(employee => {
              employee.checked = true;
              return employee;
            });
          })
        );
      }),
      switchMap(selectedEous => {
        const params: any = {
          limit: 20,
          order: 'us_email.asc,ou_id',
        };
        return this.orgUserService.getEmployeesBySearch(params).pipe(
          map(employees => {
            return selectedEous
              .filter(selectedEou => !employees.find(employee => selectedEou.us_email === employee.us_email)).concat(employees);
          })
        );
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    );

    this.approverListCopy$ = this.approverList$;

    this.approverList$.subscribe((eouc) => {
      eouc.forEach((approver) => {
        if (this.approverList.indexOf(approver.us_email) > -1) {
          this.selectedApprovers.push(approver);
        }
      });

      this.intialSelectedApprovers = [...this.selectedApprovers];

      // soting this bcz loadash isEquals deep compares the object
      this.intialSelectedApprovers.sort((a, b) => a.us_email < b.us_email ? -1 : 1);
      this.selectedApprovers.sort((a, b) => a.us_email < b.us_email ? -1 : 1);

      this.equals = isEqual(this.intialSelectedApprovers, this.selectedApprovers);
    });
  }

  checkUpdatesInApproverList(eouc) {
    return eouc.map(eou => {
      eou.checked = this.selectedApprovers
        .map(x => x.us_email)
        .indexOf(eou.
          email) > -1;
      return eou;
    });
  }

  ngAfterViewInit() {
    this.searchedApprovers$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText: any) => {
        if (!searchText) {
          return this.approverListCopy$.pipe(
            map(eouc => {
              return eouc.map(eou => {
                eou.checked = this.selectedApprovers
                  .map(x => x.us_email)
                  .indexOf(eou.us_email) > -1;
                return eou;
              });
            })
          );
        }

        const params: any = {
          limit: 20,
          us_email: 'in.(' + this.approverList.join(',') + ')',
          order: 'us_email.asc,ou_id',
        };

        if (searchText) {
          params.us_email = 'ilike.*' + searchText + '*';
        }

        return this.orgUserService.getEmployeesBySearch(params).pipe(
          map(eouc => {
            return eouc.map(eou => {
              eou.checked = this.selectedApprovers.map(x => x.us.email).indexOf(eou.us_email) > -1;
              return eou;
            });
          })
        );
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
