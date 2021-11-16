import { Component, Inject, OnInit } from '@angular/core';
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
import { PopoverController, ModalController, ActionSheetController } from '@ionic/angular';
import { ApproveAdvanceComponent } from './approve-advance/approve-advance.component';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AdvanceRequestsCustomFieldsService } from 'src/app/core/services/advance-requests-custom-fields.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { TrackingService } from '../../core/services/tracking.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { MIN_SCREEN_WIDTH } from 'src/app/app.module';
import { FyPopoverComponent } from 'src/app/shared/components/fy-popover/fy-popover.component';

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

  isDeviceWidthSmall = window.innerWidth < this.minScreenWidth;

  actionSheetButtons = [];

  sendBackLoading = false;

  rejectLoading = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private advanceRequestService: AdvanceRequestService,
    private fileService: FileService,
    private router: Router,
    private popupService: PopupService,
    private popoverController: PopoverController,
    private actionSheetController: ActionSheetController,
    private loaderService: LoaderService,
    private advanceRequestsCustomFieldsService: AdvanceRequestsCustomFieldsService,
    private authService: AuthService,
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private trackingService: TrackingService,
    @Inject(MIN_SCREEN_WIDTH) public minScreenWidth: number
  ) {}

  ionViewWillEnter() {
    const id = this.activatedRoute.snapshot.params.id;
    this.advanceRequest$ = this.refreshApprovers$.pipe(
      startWith(true),
      switchMap(() =>
        from(this.loaderService.showLoader()).pipe(switchMap(() => this.advanceRequestService.getAdvanceRequest(id)))
      ),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay(1)
    );

    this.actions$ = this.advanceRequestService.getActions(id).pipe(shareReplay(1));

    this.showAdvanceActions$ = this.actions$.pipe(
      map((advanceActions) => advanceActions.can_approve || advanceActions.can_inquire || advanceActions.can_reject)
    );

    this.approvals$ = this.advanceRequestService.getActiveApproversByAdvanceRequestId(id);

    this.activeApprovals$ = this.refreshApprovers$.pipe(
      startWith(true),
      switchMap(() => this.approvals$),
      map((approvals) => approvals.filter((approval) => approval.state !== 'APPROVAL_DISABLED'))
    );

    this.attachedFiles$ = this.fileService.findByAdvanceRequestId(id).pipe(
      switchMap((res) => from(res)),
      concatMap((file) =>
        this.fileService.downloadUrl(file.id).pipe(
          map((url) => {
            file.file_download_url = url;
            return file as File;
          })
        )
      ),
      reduce((acc, curr) => acc.concat(curr), [] as File[])
    );

    this.customFields$ = this.advanceRequestsCustomFieldsService.getAll();

    this.advanceRequestCustomFields$ = forkJoin({
      advanceRequest: this.advanceRequest$.pipe(take(1)),
      customFields: this.customFields$,
      eou: from(this.authService.getEou()),
    }).pipe(
      map((res) => {
        if (res.eou.ou.org_id === res.advanceRequest.ou_org_id) {
          let customFieldValues = [];
          if (
            res.advanceRequest.areq_custom_field_values !== null &&
            res.advanceRequest.areq_custom_field_values.length > 0
          ) {
            customFieldValues = this.advanceRequestService.modifyAdvanceRequestCustomFields(
              JSON.parse(res.advanceRequest.areq_custom_field_values)
            );
          }

          res.customFields.map((customField) => {
            customFieldValues.filter((customFieldValue) => {
              if (customField.id === customFieldValue.id) {
                customField.value = customFieldValue.value;
              }
            });
          });
          return res.customFields;
        } else {
          return this.advanceRequestService.modifyAdvanceRequestCustomFields(
            JSON.parse(res.advanceRequest.areq_custom_field_values)
          );
        }
      })
    );

    this.setupActionScheet();
  }

  edit() {
    this.router.navigate([
      '/',
      'enterprise',
      'add_edit_advance_request',
      {
        id: this.activatedRoute.snapshot.params.id,
        from: 'TEAM_ADVANCE',
      },
    ]);
  }

  getApproverEmails(activeApprovals) {
    return activeApprovals.map((approver) => approver.approver_email);
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
        text: 'Delete Advance Request',
      },
    });

    if (popupResults === 'primary') {
      this.advanceRequestService.delete(id).subscribe(() => {
        this.router.navigate(['/', 'enterprise', 'team_advance']);
      });
    }
  }

  async setupActionScheet() {
    const actions = await this.actions$.toPromise();
    if (actions.can_approve) {
      await this.actionSheetButtons.push({
        text: 'Approve Advance',
        handler: () => {
          this.showApproveAdvanceSummaryPopover();
        },
      });
    }

    if (actions.can_inquire) {
      await this.actionSheetButtons.push({
        text: 'Send Back Advance',
        handler: () => {
          this.showSendBackAdvanceSummaryPopover();
        },
      });
    }

    if (actions.can_reject) {
      await this.actionSheetButtons.push({
        text: 'Reject Advance',
        handler: () => {
          this.showRejectAdvanceSummaryPopup();
        },
      });
    }
  }

  async openActionSheet() {
    const that = this;
    const actionSheet = await this.actionSheetController.create({
      header: 'ADD EXPENSE',
      mode: 'md',
      cssClass: 'fy-action-sheet advances-action-sheet',
      buttons: that.actionSheetButtons,
    });
    await actionSheet.present();
  }

  async showApproveAdvanceSummaryPopover() {
    const areq = await this.advanceRequest$.pipe(take(1)).toPromise();
    const showApprover = await this.popoverController.create({
      component: ApproveAdvanceComponent,
      cssClass: 'dialog-popover',
      componentProps: {
        areq,
      },
    });

    await showApprover.present();

    const { data } = await showApprover.onWillDismiss();

    if (data && data.goBack) {
      this.router.navigate(['/', 'enterprise', 'team_advance']);
    }
  }

  async showSendBackAdvanceSummaryPopover() {
    const showApprover = await this.popoverController.create({
      component: FyPopoverComponent,
      cssClass: 'fy-dialog-popover',
      componentProps: {
        title: 'Send Back',
        formLabel: 'Reason For Sending Back Advance',
      },
    });

    await showApprover.present();

    const { data } = await showApprover.onWillDismiss();

    const id = this.activatedRoute.snapshot.params.id;

    if (data) {
      this.sendBackLoading = true;
      const status = data;

      const statusPayload = {
        status,
        notify: false,
      };

      this.advanceRequestService
        .sendBack(id, statusPayload)
        .pipe(
          finalize(() => {
            this.sendBackLoading = false;
            this.trackingService.sendBackAdvance({ Asset: 'Mobile' });
          })
        )
        .subscribe(() => {
          this.router.navigate(['/', 'enterprise', 'team_advance']);
        });
    }
  }

  async showRejectAdvanceSummaryPopup() {
    const showApprover = await this.popoverController.create({
      component: FyPopoverComponent,
      cssClass: 'fy-dialog-popover',
      componentProps: {
        title: 'Reject',
        formLabel: 'Please mention the reason for rejecting the advance request',
      },
    });

    await showApprover.present();

    const { data } = await showApprover.onWillDismiss();

    const id = this.activatedRoute.snapshot.params.id;

    if (data) {
      this.rejectLoading = true;
      const status = data;
      const statusPayload = {
        status,
        notify: false,
      };

      this.advanceRequestService
        .reject(id, statusPayload)
        .pipe(
          finalize(() => {
            this.rejectLoading = false;
            this.trackingService.rejectAdvance({ Asset: 'Mobile' });
          })
        )
        .subscribe(() => {
          this.router.navigate(['/', 'enterprise', 'team_advance']);
        });
    }
  }

  async openCommentsModal() {
    const advanceRequestId = this.activatedRoute.snapshot.params.id;
    const modal = await this.modalController.create({
      component: ViewCommentComponent,
      componentProps: {
        objectType: 'advance_requests',
        objectId: advanceRequestId,
      },
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data && data.updated) {
      this.trackingService.addComment();
    } else {
      this.trackingService.viewComment();
    }
  }

  ngOnInit() {}
}
