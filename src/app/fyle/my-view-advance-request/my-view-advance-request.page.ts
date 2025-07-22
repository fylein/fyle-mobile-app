import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterLink } from '@angular/router';
import { PopoverController, ModalController, IonicModule } from '@ionic/angular';
import { forkJoin, from, Observable } from 'rxjs';
import { finalize, map, reduce, shareReplay, switchMap, concatMap } from 'rxjs/operators';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { FileService } from 'src/app/core/services/file.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AdvanceRequestsCustomFieldsService } from 'src/app/core/services/advance-requests-custom-fields.service';
import { FyViewAttachmentComponent } from 'src/app/shared/components/fy-view-attachment/fy-view-attachment.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { TrackingService } from '../../core/services/tracking.service';
import { MIN_SCREEN_WIDTH } from 'src/app/app.module';
import { FyPopoverComponent } from 'src/app/shared/components/fy-popover/fy-popover.component';
import { StatisticTypes } from 'src/app/shared/components/fy-statistic/statistic-type.enum';
import { getCurrencySymbol, NgClass, AsyncPipe, TitleCasePipe, DatePipe } from '@angular/common';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { ExtendedAdvanceRequestPublic } from 'src/app/core/models/extended-advance-request-public.model';
import { ApprovalPublic } from 'src/app/core/models/approval-public.model';
import { AdvanceRequestActions } from 'src/app/core/models/advance-request-actions.model';
import { AdvanceRequestsCustomFields } from 'src/app/core/models/advance-requests-custom-fields.model';
import { AdvanceRequestPopoverData } from 'src/app/core/models/popover-data.model';
import { FySummaryTileComponent } from '../../shared/components/summary-tile/summary-tile.component';
import { ReceiptPreviewThumbnailComponent } from '../../shared/components/receipt-preview-thumbnail/receipt-preview-thumbnail.component';
import { FyStatisticComponent } from '../../shared/components/fy-statistic/fy-statistic.component';
import { EllipsisPipe } from '../../shared/pipes/ellipses.pipe';

@Component({
  selector: 'app-my-view-advance-request',
  templateUrl: './my-view-advance-request.page.html',
  styleUrls: ['./my-view-advance-request.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    NgClass,
    RouterLinkActive,
    RouterLink,
    FySummaryTileComponent,
    ReceiptPreviewThumbnailComponent,
    FyStatisticComponent,
    AsyncPipe,
    TitleCasePipe,
    DatePipe,
    EllipsisPipe,
  ],
})
export class MyViewAdvanceRequestPage {
  advanceRequest$: Observable<ExtendedAdvanceRequestPublic>;

  actions$: Observable<AdvanceRequestActions>;

  activeApprovals$: Observable<ApprovalPublic[]>;

  attachedFiles$: Observable<FileObject[]>;

  advanceRequestCustomFields$: Observable<CustomField[]>;

  customFields$: Observable<AdvanceRequestsCustomFields[]>;

  isDeviceWidthSmall = window.innerWidth < this.minScreenWidth;

  projectFieldName = 'Project';

  internalState: { name: string; state: string };

  currencySymbol: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private advanceRequestService: AdvanceRequestService,
    private fileService: FileService,
    private router: Router,
    private popoverController: PopoverController,
    private modalController: ModalController,
    private advanceRequestsCustomFieldsService: AdvanceRequestsCustomFieldsService,
    private modalProperties: ModalPropertiesService,
    private trackingService: TrackingService,
    private expenseFieldsService: ExpenseFieldsService,
    @Inject(MIN_SCREEN_WIDTH) public minScreenWidth: number
  ) {}

  get StatisticTypes(): typeof StatisticTypes {
    return StatisticTypes;
  }

  getReceiptExtension(name: string): string | null {
    let res: string | null = null;

    if (name) {
      const filename = name.toLowerCase();
      const idx = filename.lastIndexOf('.');

      if (idx > -1) {
        res = filename.substring(idx + 1, filename.length);
      }
    }

    return res;
  }

  getReceiptDetails(file: FileObject): { type: string; thumbnail: string } {
    const ext = this.getReceiptExtension(file.name);
    const res: { type: string; thumbnail: string } = {
      type: 'unknown',
      thumbnail: 'img/fy-receipt.svg',
    };

    if (ext && ['pdf'].indexOf(ext) > -1) {
      res.type = 'pdf';
      res.thumbnail = 'img/fy-pdf.svg';
    } else if (ext && ['png', 'jpg', 'jpeg', 'gif'].indexOf(ext) > -1) {
      res.type = 'image';
      res.thumbnail = file.url;
    }

    return res;
  }

  // TODO - replace forEach with find
  getAndUpdateProjectName(): void {
    this.expenseFieldsService.getAllEnabled().subscribe((expenseFields) => {
      expenseFields.forEach((expenseField) => {
        if (expenseField.column_name === 'project_id') {
          this.projectFieldName = expenseField.field_name;
        }
      });
    });
  }

  ionViewWillEnter(): void {
    const id: string = this.activatedRoute.snapshot.params.id as string;
    this.advanceRequest$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => this.advanceRequestService.getAdvanceRequestPlatform(id)),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay(1)
    );

    this.advanceRequest$.subscribe((advanceRequest) => {
      this.internalState = this.advanceRequestService.getInternalStateAndDisplayName(advanceRequest);
      this.currencySymbol = getCurrencySymbol(advanceRequest?.areq_currency, 'wide');
    });

    this.actions$ = this.advanceRequestService.getSpenderPermissions(id).pipe(shareReplay(1));
    this.activeApprovals$ = this.advanceRequestService.getActiveApproversByAdvanceRequestIdPlatform(id);
    this.attachedFiles$ = this.fileService.findByAdvanceRequestId(id).pipe(
      switchMap((res: FileObject[]) => from(res)),
      concatMap((fileObj: FileObject) =>
        this.fileService.downloadUrl(fileObj.id).pipe(
          map((downloadUrl: string) => {
            const updatedFileObj = { ...fileObj };
            updatedFileObj.url = downloadUrl;
            const details = this.getReceiptDetails(updatedFileObj);
            updatedFileObj.type = details.type;
            updatedFileObj.thumbnail = details.thumbnail;
            return updatedFileObj;
          })
        )
      ),
      reduce((acc: FileObject[], curr: FileObject) => acc.concat(curr), [] as FileObject[])
    );

    this.customFields$ = this.advanceRequestsCustomFieldsService.getAll();

    this.advanceRequestCustomFields$ = forkJoin({
      advanceRequest: this.advanceRequest$,
      customFields: this.customFields$,
    }).pipe(
      map((res) => {
        let customFieldValues: CustomField[] = [];
        if (
          res.advanceRequest.areq_custom_field_values !== null &&
          res.advanceRequest.areq_custom_field_values.length > 0
        ) {
          customFieldValues = this.advanceRequestService.modifyAdvanceRequestCustomFields(
            res.advanceRequest.areq_custom_field_values
          );
        }

        return res.customFields.map((customField) => {
          const matchingCustomFieldValue = customFieldValues.find(
            (customFieldValue) => customField.name === customFieldValue.name
          );
          return {
            ...customField,
            value: matchingCustomFieldValue ? matchingCustomFieldValue.value : null,
          } as CustomField;
        });
      })
    );

    this.getAndUpdateProjectName();
  }

  async pullBack(): Promise<void> {
    const pullBackPopover = await this.popoverController.create({
      component: FyPopoverComponent,
      componentProps: {
        title: 'Pull Back Advance?',
        formLabel: 'Pulling back your advance request will allow you to edit and re-submit the request.',
      },
      cssClass: 'fy-dialog-popover',
    });

    await pullBackPopover.present();
    const { data } = await pullBackPopover.onWillDismiss<AdvanceRequestPopoverData>();

    if (data?.comment) {
      const status = {
        comment: data.comment,
      };
      const statusPayload = {
        status,
        notify: false,
      };
      const id = this.activatedRoute.snapshot.params.id as string;

      from(this.loaderService.showLoader())
        .pipe(
          switchMap(() => this.advanceRequestService.pullBackAdvanceRequest(id, statusPayload)),
          finalize(() => from(this.loaderService.hideLoader()))
        )
        .subscribe(() => {
          this.router.navigate(['/', 'enterprise', 'my_advances']);
        });
    }
  }

  edit(): void {
    this.router.navigate([
      '/',
      'enterprise',
      'add_edit_advance_request',
      {
        id: this.activatedRoute.snapshot.params.id as string,
      },
    ]);
  }

  async delete(): Promise<void> {
    const deletePopover = await this.popoverController.create({
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      componentProps: {
        header: 'Delete Advance Request',
        body: 'Are you sure you want to delete this request?',
        deleteMethod: () => this.advanceRequestService.delete(this.activatedRoute.snapshot.params.id as string),
      },
    });

    await deletePopover.present();

    const { data } = await deletePopover.onDidDismiss<AdvanceRequestPopoverData>();

    if (data?.status === 'success') {
      this.router.navigate(['/', 'enterprise', 'my_advances']);
    }
  }

  async openCommentsModal(): Promise<void> {
    const advanceRequest = await this.advanceRequest$.toPromise();
    const modal = await this.modalController.create({
      component: ViewCommentComponent,
      componentProps: {
        objectType: 'advance_requests',
        objectId: advanceRequest.areq_id,
      },
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await modal.present();
    const { data } = await modal.onDidDismiss<AdvanceRequestPopoverData>();

    if (data?.updated) {
      this.trackingService.addComment();
    } else {
      this.trackingService.viewComment();
    }
  }

  async viewAttachments(attachments: FileObject[]): Promise<void> {
    const attachmentsModal = await this.modalController.create({
      component: FyViewAttachmentComponent,
      componentProps: {
        attachments,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await attachmentsModal.present();
  }
}
