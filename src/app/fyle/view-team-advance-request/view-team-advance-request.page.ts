import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetButton, ActionSheetController, ModalController, PopoverController, IonicModule } from '@ionic/angular';
import { EMPTY, Subject, forkJoin, from } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, concatMap, finalize, map, reduce, shareReplay, startWith, switchMap, take } from 'rxjs/operators';
import { MIN_SCREEN_WIDTH } from 'src/app/app.module';
import { AdvanceRequestActions } from 'src/app/core/models/advance-request-actions.model';
import { ApprovalPublic } from 'src/app/core/models/approval-public.model';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { File } from 'src/app/core/models/file.model';
import { ExpenseField } from 'src/app/core/models/v1/expense-field.model';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';

import { AuthService } from 'src/app/core/services/auth.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { FileService } from 'src/app/core/services/file.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { FyPopoverComponent } from 'src/app/shared/components/fy-popover/fy-popover.component';
import { StatisticTypes } from 'src/app/shared/components/fy-statistic/statistic-type.enum';
import { FyViewAttachmentComponent } from 'src/app/shared/components/fy-view-attachment/fy-view-attachment.component';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { TrackingService } from '../../core/services/tracking.service';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { AdvanceRequestsCustomFields } from 'src/app/core/models/advance-requests-custom-fields.model';
import { NgClass, AsyncPipe, DatePipe } from '@angular/common';
import { FySummaryTileComponent } from '../../shared/components/summary-tile/summary-tile.component';
import { ReceiptPreviewThumbnailComponent } from '../../shared/components/receipt-preview-thumbnail/receipt-preview-thumbnail.component';
import { FyStatisticComponent } from '../../shared/components/fy-statistic/fy-statistic.component';
import { SnakeCaseToSpaceCase } from '../../shared/pipes/snake-case-to-space-case.pipe';

@Component({
    selector: 'app-view-team-advance',
    templateUrl: './view-team-advance-request.page.html',
    styleUrls: ['./view-team-advance-request.page.scss'],
    imports: [
        IonicModule,
        NgClass,
        FySummaryTileComponent,
        ReceiptPreviewThumbnailComponent,
        FyStatisticComponent,
        AsyncPipe,
        DatePipe,
        SnakeCaseToSpaceCase,
    ],
})
export class ViewTeamAdvanceRequestPage implements OnInit {
  private activatedRoute = inject(ActivatedRoute);

  private advanceRequestService = inject(AdvanceRequestService);

  private fileService = inject(FileService);

  private router = inject(Router);

  private popoverController = inject(PopoverController);

  private actionSheetController = inject(ActionSheetController);

  private authService = inject(AuthService);

  private modalController = inject(ModalController);

  private modalProperties = inject(ModalPropertiesService);

  private trackingService = inject(TrackingService);

  private expenseFieldsService = inject(ExpenseFieldsService);

  private humanizeCurrency = inject(HumanizeCurrencyPipe);

  minScreenWidth = inject(MIN_SCREEN_WIDTH);

  advanceRequest$: Observable<ExtendedAdvanceRequest>;

  actions$: Observable<AdvanceRequestActions>;

  approvals$: Observable<ApprovalPublic[]>;

  activeApprovals$: Observable<ApprovalPublic[]>;

  attachedFiles$: Observable<File[] | FileObject[]>;

  advanceRequestCustomFields$: Observable<CustomField[] | AdvanceRequestsCustomFields[]>;

  refreshApprovers$ = new Subject();

  showAdvanceActions$: Observable<boolean>;

  customFields$: Observable<CustomField[] | AdvanceRequestsCustomFields[]>;

  isDeviceWidthSmall = window.innerWidth < this.minScreenWidth;

  actionSheetButtons = [];

  sendBackLoading = false;

  rejectLoading = false;

  projectFieldName: string;

  get StatisticTypes(): typeof StatisticTypes {
    return StatisticTypes;
  }

  async getAndUpdateProjectName(): Promise<ExpenseField> {
    const expenseFields = await this.expenseFieldsService.getAllEnabled().toPromise();
    return expenseFields.filter((expenseField) => expenseField.column_name === 'project_id')[0];
  }

  getAttachedReceipts(id: string): Observable<FileObject[]> {
    return this.fileService.findByAdvanceRequestIdForTeamAdvance(id).pipe(
      switchMap((res) => from(res)),
      concatMap((fileObj: FileObject) =>
        this.fileService.downloadUrlForTeamAdvance(fileObj.id).pipe(
          map((downloadUrl) => {
            fileObj.url = downloadUrl;
            const details = this.fileService.getReceiptsDetails(fileObj.name, fileObj.url);
            fileObj.type = details.type;
            fileObj.thumbnail = details.thumbnail;
            return fileObj;
          }),
        ),
      ),
      reduce((acc, curr) => acc.concat(curr), [] as FileObject[]),
    );
  }

  ionViewWillEnter(): void {
    const id = this.activatedRoute.snapshot.params.id as string;
    this.advanceRequest$ = this.refreshApprovers$.pipe(
      startWith(true),
      switchMap(() => this.advanceRequestService.getApproverAdvanceRequest(id)),
      shareReplay(1),
    );

    this.actions$ = this.advanceRequestService.getApproverPermissions(id).pipe(shareReplay(1));

    this.showAdvanceActions$ = this.actions$.pipe(
      map((advanceActions) => advanceActions.can_approve || advanceActions.can_inquire || advanceActions.can_reject),
    );

    this.approvals$ = this.advanceRequestService.getActiveApproversByAdvanceRequestIdPlatformForApprover(id);

    this.activeApprovals$ = this.refreshApprovers$.pipe(
      startWith(true),
      switchMap(() => this.approvals$),
      map((approvals) => approvals.filter((approval) => approval.state !== 'APPROVAL_DISABLED')),
    );

    this.attachedFiles$ = this.getAttachedReceipts(id);

    this.customFields$ = this.advanceRequestService.getCustomFieldsForApprover(this.activatedRoute.snapshot.params.id as string);

    this.advanceRequestCustomFields$ = forkJoin({
      advanceRequest: this.advanceRequest$.pipe(take(1)),
      customFields: this.customFields$,
      eou: from(this.authService.getEou()),
    }).pipe(
      map((res: { advanceRequest: ExtendedAdvanceRequest; customFields: CustomField[]; eou: ExtendedOrgUser }) => {
        if (res.eou.ou.org_id === res.advanceRequest.ou_org_id) {
          let customFieldValues = [];
          if (
            res.advanceRequest.areq_custom_field_values !== null &&
            res.advanceRequest.areq_custom_field_values.length > 0
          ) {
            customFieldValues = this.advanceRequestService.modifyAdvanceRequestCustomFields(
              res.advanceRequest.areq_custom_field_values,
            );
          }

          res.customFields.map((customField) => {
            customFieldValues.filter((customFieldValue: CustomField) => {
              if (customField.id === customFieldValue.id) {
                customField.value = customFieldValue.value;
              }
            });
          });
          return res.customFields;
        } else {
          return this.advanceRequestService.modifyAdvanceRequestCustomFields(
            res.advanceRequest.areq_custom_field_values,
          );
        }
      }),
    );

    this.setupActionSheet();
    this.getAndUpdateProjectName().then((projectField) => (this.projectFieldName = projectField.field_name));
  }

  edit(): void {
    this.router.navigate([
      '/',
      'enterprise',
      'add_edit_advance_request',
      {
        id: this.activatedRoute.snapshot.params.id as string,
        from: 'TEAM_ADVANCE',
      },
    ]);
  }

  getApproverEmails(activeApprovals: ApprovalPublic[]): string[] {
    return activeApprovals?.map((approver) => approver.approver_email);
  }

  onUpdateApprover(message: boolean): void {
    if (message) {
      this.refreshApprovers$.next(null);
    }
  }

  setupActionSheet(): void {
    this.actions$.subscribe((actions) => {
      if (actions.can_approve) {
        this.actionSheetButtons.push({
          text: 'Approve advance',
          handler: () => {
            this.showApproveAdvanceSummaryPopover();
          },
        });
      }

      if (actions.can_inquire) {
        this.actionSheetButtons.push({
          text: 'Send back advance',
          handler: () => {
            this.showSendBackAdvanceSummaryPopover();
          },
        });
      }

      if (actions.can_reject) {
        this.actionSheetButtons.push({
          text: 'Reject advance',
          handler: () => {
            this.showRejectAdvanceSummaryPopup();
          },
        });
      }
    });
  }

  async openActionSheet(): Promise<void> {
    const that = this;
    const actionSheet = await this.actionSheetController.create({
      header: 'ADVANCE ACTIONS',
      mode: 'md',
      cssClass: 'fy-action-sheet advances-action-sheet',
      buttons: that.actionSheetButtons as ActionSheetButton[],
    });
    await actionSheet.present();
  }

  async showApproveAdvanceSummaryPopover(): Promise<void> {
    const areq = await this.advanceRequest$.pipe(take(1)).toPromise();
    const advanceAmount = this.humanizeCurrency.transform(areq.areq_amount, areq.areq_currency, false);
    const showApprover = await this.popoverController.create({
      component: PopupAlertComponent,
      cssClass: 'pop-up-in-center',
      componentProps: {
        title: 'Review Advance',
        message: 'Advance request by ' + areq.us_full_name + ' of amount ' + advanceAmount + ' will be approved',
        primaryCta: {
          text: 'Approve',
          action: 'approve',
        },
        secondaryCta: {
          text: 'Cancel',
          action: 'cancel',
        },
      },
    });

    await showApprover.present();

    const { data } = (await showApprover.onWillDismiss()) as {
      data: {
        action: string;
      };
    };

    if (data && data.action === 'approve') {
      this.advanceRequestService
        .approve(areq.areq_id)
        .pipe(
          catchError(() => {
            this.trackingService.eventTrack('Team Advances Approval Failed', { id: areq.areq_id });
            return EMPTY;
          }),
        )
        .subscribe(() => {
          this.router.navigate(['/', 'enterprise', 'team_advance']);
        });
    }
  }

  async showSendBackAdvanceSummaryPopover(): Promise<void> {
    const showApprover = await this.popoverController.create({
      component: FyPopoverComponent,
      cssClass: 'fy-dialog-popover',
      componentProps: {
        title: 'Send Back',
        formLabel: 'Reason For Sending Back Advance',
      },
    });

    await showApprover.present();

    const { data } = (await showApprover.onWillDismiss()) as {
      data: {
        comment: string;
      };
    };

    const id = this.activatedRoute.snapshot.params.id as string;

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
          }),
        )
        .subscribe(() => {
          this.router.navigate(['/', 'enterprise', 'team_advance']);
        });
    }
  }

  async showRejectAdvanceSummaryPopup(): Promise<void> {
    const showApprover = await this.popoverController.create({
      component: FyPopoverComponent,
      cssClass: 'fy-dialog-popover',
      componentProps: {
        title: 'Reject',
        formLabel: 'Please mention the reason for rejecting the advance request',
      },
    });

    await showApprover.present();

    const { data } = (await showApprover.onWillDismiss()) as {
      data: {
        comment: string;
      };
    };

    const id = this.activatedRoute.snapshot.params.id as string;

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
          }),
        )
        .subscribe(() => {
          this.router.navigate(['/', 'enterprise', 'team_advance']);
        });
    }
  }

  async openCommentsModal(): Promise<void> {
    const advanceRequestId = this.activatedRoute.snapshot.params.id as string;
    const modal = await this.modalController.create({
      component: ViewCommentComponent,
      componentProps: {
        objectType: 'advance_requests',
        objectId: advanceRequestId,
      },
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await modal.present();
    const { data } = (await modal.onDidDismiss()) as {
      data: {
        updated: boolean;
      };
    };

    if (data && data.updated) {
      this.trackingService.addComment();
    } else {
      this.trackingService.viewComment();
    }
  }

  async viewAttachments(attachments: FileObject): Promise<void> {
    const attachmentsModal = await this.modalController.create({
      component: FyViewAttachmentComponent,
      componentProps: {
        attachments,
        isTeamAdvance: true,
      },
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await attachmentsModal.present();
  }

  ngOnInit(): void {
    return;
  }

  goToTeamAdvances(): void {
    this.router.navigate(['/', 'enterprise', 'team_advance']);
  }
}
