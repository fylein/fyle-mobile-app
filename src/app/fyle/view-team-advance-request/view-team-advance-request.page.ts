import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetButton, ActionSheetController, ModalController, PopoverController } from '@ionic/angular';
import { Subject, forkJoin, from } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { concatMap, finalize, map, reduce, shareReplay, startWith, switchMap, take } from 'rxjs/operators';
import { MIN_SCREEN_WIDTH } from 'src/app/app.module';
import { AdvanceRequestActions } from 'src/app/core/models/advance-request-actions.model';
import { Approval } from 'src/app/core/models/approval.model';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { File } from 'src/app/core/models/file.model';
import { ExpenseField } from 'src/app/core/models/v1/expense-field.model';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { AdvanceRequestsCustomFieldsService } from 'src/app/core/services/advance-requests-custom-fields.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { FileService } from 'src/app/core/services/file.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { FyPopoverComponent } from 'src/app/shared/components/fy-popover/fy-popover.component';
import { StatisticTypes } from 'src/app/shared/components/fy-statistic/statistic-type.enum';
import { FyViewAttachmentComponent } from 'src/app/shared/components/fy-view-attachment/fy-view-attachment.component';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { TrackingService } from '../../core/services/tracking.service';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { AdvanceRequestsCustomFields } from 'src/app/core/models/advance-requests-custom-fields.model';

@Component({
  selector: 'app-view-team-advance',
  templateUrl: './view-team-advance-request.page.html',
  styleUrls: ['./view-team-advance-request.page.scss'],
})
export class ViewTeamAdvanceRequestPage implements OnInit {
  advanceRequest$: Observable<ExtendedAdvanceRequest>;

  actions$: Observable<AdvanceRequestActions>;

  approvals$: Observable<Approval[]>;

  activeApprovals$: Observable<Approval[]>;

  attachedFiles$: Observable<File[] | FileObject[]>;

  advanceRequestCustomFields$: Observable<CustomField[] | AdvanceRequestsCustomFields[]>;

  refreshApprovers$ = new Subject();

  showAdvanceActions$: Observable<boolean>;

  customFields$: Observable<CustomField[] | AdvanceRequestsCustomFields[]>;

  isDeviceWidthSmall = window.innerWidth < this.minScreenWidth;

  actionSheetButtons = [];

  isLoading = false;

  sendBackLoading = false;

  rejectLoading = false;

  projectFieldName: string;

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
    private expenseFieldsService: ExpenseFieldsService,
    private humanizeCurrency: HumanizeCurrencyPipe,
    @Inject(MIN_SCREEN_WIDTH) public minScreenWidth: number
  ) {}

  get StatisticTypes(): typeof StatisticTypes {
    return StatisticTypes;
  }

  async getAndUpdateProjectName(): Promise<ExpenseField> {
    const expenseFields = await this.expenseFieldsService.getAllEnabled().toPromise();
    return expenseFields.filter((expenseField) => expenseField.column_name === 'project_id')[0];
  }

  getAttachedReceipts(id: string): Observable<FileObject[]> {
    return this.fileService.findByAdvanceRequestId(id).pipe(
      switchMap((res) => from(res)),
      concatMap((fileObj: FileObject) =>
        this.fileService.downloadUrl(fileObj.id).pipe(
          map((downloadUrl) => {
            fileObj.url = downloadUrl;
            const details = this.fileService.getReceiptsDetails(fileObj.name, fileObj.url);
            fileObj.type = details.type;
            fileObj.thumbnail = details.thumbnail;
            return fileObj;
          })
        )
      ),
      reduce((acc, curr) => acc.concat(curr), [] as FileObject[])
    );
  }

  ionViewWillEnter(): void {
    const id = this.activatedRoute.snapshot.params.id as string;
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

    this.attachedFiles$ = this.getAttachedReceipts(id);

    this.customFields$ = this.advanceRequestsCustomFieldsService.getAll();

    const customFields$ = forkJoin({
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
              JSON.parse(res.advanceRequest.areq_custom_field_values) as CustomField[]
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
            JSON.parse(res.advanceRequest.areq_custom_field_values) as CustomField[]
          );
        }
      })
    );
    this.advanceRequestCustomFields$ = customFields$;

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

  getApproverEmails(activeApprovals: Approval[]): string[] {
    return activeApprovals?.map((approver) => approver.approver_email);
  }

  onUpdateApprover(message: boolean): void {
    if (message) {
      this.refreshApprovers$.next(null);
    }
  }

  async delete(): Promise<void> {
    const id = this.activatedRoute.snapshot.params.id as string;

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

  setupActionSheet(): void {
    this.actions$.subscribe((actions) => {
      if (actions.can_approve) {
        this.actionSheetButtons.push({
          text: 'Approve Advance',
          handler: () => {
            this.showApproveAdvanceSummaryPopover();
          },
        });
      }

      if (actions.can_inquire) {
        this.actionSheetButtons.push({
          text: 'Send Back Advance',
          handler: () => {
            this.showSendBackAdvanceSummaryPopover();
          },
        });
      }

      if (actions.can_reject) {
        this.actionSheetButtons.push({
          text: 'Reject Advance',
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
      this.isLoading = true;
      this.advanceRequestService
        .approve(areq.areq_id)
        .pipe(finalize(() => (this.isLoading = false)))
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
          })
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
          })
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
