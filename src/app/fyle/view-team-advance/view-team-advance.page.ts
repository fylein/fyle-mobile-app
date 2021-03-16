import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';
import { File } from 'src/app/core/models/file.model';
import { Approval } from 'src/app/core/models/approval.model';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { FileService } from 'src/app/core/services/file.service';
import { from, Subject, forkJoin } from 'rxjs';
import { switchMap, finalize, shareReplay, concatMap, map, reduce, startWith, take, tap } from 'rxjs/operators';
import { PopupService } from 'src/app/core/services/popup.service';
import { PopoverController } from '@ionic/angular';
import { AdvanceActionsComponent } from './advance-actions/advance-actions.component';
import { ApproveAdvanceComponent } from './approve-advance/approve-advance.component';
import { SendBackAdvanceComponent } from './send-back-advance/send-back-advance.component';
import { RejectAdvanceComponent } from './reject-advance/reject-advance.component';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AdvanceRequestsCustomFieldsService } from 'src/app/core/services/advance-requests-custom-fields.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-view-team-advance',
  templateUrl: './view-team-advance.page.html',
  styleUrls: ['./view-team-advance.page.scss'],
})
export class ViewTeamAdvancePage implements OnInit {

  advanceRequest$: Observable<ExtendedAdvanceRequest>;
  actions$: Observable<any>;
  approvals$: Observable<Approval[]>;
  activeApprovals$: Observable<Approval[]>;
  attachedFiles$: Observable<File[]>;
  advanceRequestCustomFields$: Observable<CustomField[]>;
  refreshApprovers$ = new Subject();
  showAdvanceActions$: Observable<boolean>;
  customFields$: Observable<any>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private advanceRequestService: AdvanceRequestService,
    private fileService: FileService,
    private router: Router,
    private popupService: PopupService,
    private popoverController: PopoverController,
    private loaderService: LoaderService,
    private advanceRequestsCustomFieldsService: AdvanceRequestsCustomFieldsService,
    private authService: AuthService
  ) { }

  ionViewWillEnter() {
    const id = this.activatedRoute.snapshot.params.id;
    this.advanceRequest$ = this.refreshApprovers$.pipe(
      startWith(true),
      switchMap(() => {
        return from(this.loaderService.showLoader()).pipe(
          switchMap(() => {
            return this.advanceRequestService.getAdvanceRequest(id);
          })
        );
      }),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay(1)
    );

    this.actions$ = this.advanceRequestService.getActions(id).pipe(
      shareReplay(1)
    );

    this.showAdvanceActions$ = this.actions$.pipe(map(advanceActions => advanceActions.can_approve || advanceActions.can_inquire || advanceActions.can_reject))

    this.actions$.subscribe(console.log);

    this.approvals$ = this.advanceRequestService.getActiveApproversByAdvanceRequestId(id);

    this.activeApprovals$ = this.refreshApprovers$.pipe(
      startWith(true),
      switchMap(() => {
        return this.approvals$;
      }),
      map(approvals => approvals.filter(approval => approval.state !== 'APPROVAL_DISABLED'))
    );

    this.attachedFiles$ = this.fileService.findByAdvanceRequestId(id).pipe(
      switchMap(res => {
        return from(res);
      }),
      concatMap(file => {
        return this.fileService.downloadUrl(file.id).pipe(
          map(url => {
            file.file_download_url = url;
            return file as File;
          })
        )
      }),
      reduce((acc, curr) => {
        return acc.concat(curr);
      }, [] as File[])
    );

    this.customFields$ = this.advanceRequestsCustomFieldsService.getAll();

    this.advanceRequestCustomFields$ = forkJoin({
      advanceRequest: this.advanceRequest$.pipe(take(1)),
      customFields: this.customFields$,
      eou: from(this.authService.getEou())
    }).pipe(
      map(res => {
        if (res.eou.ou.org_id === res.advanceRequest.ou_org_id) {
          let customFieldValues = [];
          if ((res.advanceRequest.areq_custom_field_values !== null) && (res.advanceRequest.areq_custom_field_values.length > 0)) {
            customFieldValues = this.advanceRequestService.modifyAdvanceRequestCustomFields(JSON.parse(res.advanceRequest.areq_custom_field_values));
          }

          res.customFields.map(customField => {
            customFieldValues.filter(customFieldValue => {
              if (customField.id === customFieldValue.id) {
                customField.value = customFieldValue.value;
              }
            });
          });
          return res.customFields;

        } else {
          return this.advanceRequestService.modifyAdvanceRequestCustomFields(JSON.parse(res.advanceRequest.areq_custom_field_values));
        }
      })
    );
  }

  edit() {
    this.router.navigate(['/', 'enterprise', 'add_edit_advance_request', { id: this.activatedRoute.snapshot.params.id, from: 'TEAM_ADVANCE' }]);
  }

  getApproverEmails(activeApprovals) {
    return activeApprovals.map(approver => {
      return approver.approver_email;
    });
  }

  onUpdateApprover(message: boolean) {
    if (message) {
      this.refreshApprovers$.next();
    }
  }

  async delete() {
    const id = this.activatedRoute.snapshot.params.id;

    const popupResults = await this.popupService.showPopup({
      header: 'Confirm',
      message: 'Are you sure you want to delete this Advance Request',
      primaryCta: {
        text: 'Delete Advance Request'
      }
    });

    if (popupResults === 'primary') {
      this.advanceRequestService.delete(id).subscribe(() => {
        this.router.navigate(['/', 'enterprise', 'team_advance']);
      });
    }
  }

  async openAdvanceActionsPopover() {
    const actions = await this.actions$.toPromise();
    const areq = await this.advanceRequest$.pipe(take(1)).toPromise();

    const advanceActions = await this.popoverController.create({
      componentProps: {
        actions,
        areq
      },
      component: AdvanceActionsComponent,
      cssClass: 'dialog-popover'
    });

    await advanceActions.present();

    const { data } = await advanceActions.onWillDismiss();

    if (data && data.command === 'approveAdvance') {
      await this.showApproveAdvanceSummaryPopover();
    } else if (data && data.command === 'sendBackAdvance') {
      await this.showSendBackAdvanceSummaryPopover();
    } else if (data && data.command === 'rejectAdvance') {
      await this.showRejectAdvanceSummaryPopup();
    }
  }

  async showApproveAdvanceSummaryPopover() {
    const areq = await this.advanceRequest$.pipe(take(1)).toPromise();
    const showApprover = await this.popoverController.create({
      component: ApproveAdvanceComponent,
      cssClass: 'dialog-popover',
      componentProps: {
        areq: areq
      }
    });

    await showApprover.present();

    const { data } = await showApprover.onWillDismiss();

    if (data && data.goBack) {
      this.router.navigate(['/', 'enterprise', 'team_advance']);
    }
  }

  async showSendBackAdvanceSummaryPopover() {
    const areq = await this.advanceRequest$.pipe(take(1)).toPromise();
    const showApprover = await this.popoverController.create({
      component: SendBackAdvanceComponent,
      cssClass: 'dialog-popover',
      componentProps: {
        areq: areq
      }
    });

    await showApprover.present();

    const { data } = await showApprover.onWillDismiss();

    if (data && data.goBack) {
      this.router.navigate(['/', 'enterprise', 'team_advance']);
    }
  }

  async showRejectAdvanceSummaryPopup() {
    const areq = await this.advanceRequest$.pipe(take(1)).toPromise();
    const showApprover = await this.popoverController.create({
      component: RejectAdvanceComponent,
      cssClass: 'dialog-popover',
      componentProps: {
        areq: areq
      }
    });

    await showApprover.present();

    const { data } = await showApprover.onWillDismiss();

    if (data && data.goBack) {
      this.router.navigate(['/', 'enterprise', 'team_advance']);
    }
  }

  ngOnInit() {
  }
}
