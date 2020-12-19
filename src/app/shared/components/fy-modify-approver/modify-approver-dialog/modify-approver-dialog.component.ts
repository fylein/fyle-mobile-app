import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Observable, from, noop, fromEvent} from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { ModalController, PopoverController } from '@ionic/angular';
import { switchMap, reduce, finalize, map, tap, mergeMap, concatMap, startWith, distinctUntilChanged } from 'rxjs/operators';
import { ModifyApproverConfirmationPopoverComponent } from './modify-approver-confirmation-popover/modify-approver-confirmation-popover.component';
import { ReportService } from 'src/app/core/services/report.service';
import { isEqual } from 'lodash';

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
  searchedApprovers$: Observable<any>;
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

    let reportApprovals: [];
    const selectedApprovers = this.selectedApprovers.filter(approver => this.intialSelectedApprovers.indexOf(approver) === -1);
    const removedApprovers = this.intialSelectedApprovers.filter(approver => this.selectedApprovers.indexOf(approver) === -1);
    this.reportService.getApproversByReportId(this.id).pipe(
      map(res => {
        reportApprovals = res.filter(eou => {
          return removedApprovers.some(removedApprover => {
            return removedApprover.ou.id === eou.approver_id && eou.state !== 'APPROVAL_DONE';
          });
        })
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

    const { data } = await saveApproverConfirmationPopover.onWillDismiss();
    if (data && data.message) {

      const selectedApproversTemp = selectedApprovers.map(eou => ({eou, command: 'add'}));
      const reportApprovalsTemp = reportApprovals.map(eou => ({eou, command: 'remove'}));

      const changedOps = selectedApproversTemp.concat(reportApprovalsTemp);

      from(changedOps).pipe(
        concatMap(res => {
          if (res.command === 'add') {
            return this.reportService.addApprover(this.id, res.eou.us.email, data.message);
          } else {
            return this.reportService.removeApprover(this.id, res.eou.id);
          }
        }),
        reduce((acc, curr) => {
          return acc.concat(curr);
        }, []),
      ).subscribe(() => {
        this.modalController.dismiss({reload: true});
      });
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
    return isEqual(intialSelectedApprovers, selectedApprovers);
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
        return eouc.filter((approver) => {
          if (this.approverList.indexOf(approver.us.email) > -1) {
            approver['checked'] = true;
            this.selectedApprovers.push(approver);
          } else {
            approver['checked'] = false;
          }
          return approver;
        });
      }),
      map(eouc => {
        eouc = eouc.filter(approver => !this.selectedApprovers.includes(approver));
        return this.selectedApprovers.concat(eouc);
      }),
      finalize(() => {
        this.intialSelectedApprovers = [...this.selectedApprovers];
        this.equals = this.checkDifference(this.intialSelectedApprovers, this.selectedApprovers);
        from(this.loaderService.hideLoader());
      })
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
            return !searchText || filteredApprover.us.email.indexOf(searchText) > -1;
          });
       }));
      })
    );
  }
}
