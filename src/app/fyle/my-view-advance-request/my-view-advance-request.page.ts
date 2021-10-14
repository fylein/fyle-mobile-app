import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController, ModalController } from '@ionic/angular';
import { forkJoin, from, Observable } from 'rxjs';
import { concatMap, finalize, map, reduce, shareReplay, switchMap } from 'rxjs/operators';
import { Approval } from 'src/app/core/models/approval.model';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';
import { File } from 'src/app/core/models/file.model';
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

@Component({
  selector: 'app-my-view-advance-request',
  templateUrl: './my-view-advance-request.page.html',
  styleUrls: ['./my-view-advance-request.page.scss'],
})
export class MyViewAdvanceRequestPage implements OnInit {
  advanceRequest$: Observable<ExtendedAdvanceRequest>;

  actions$: Observable<any>;

  activeApprovals$: Observable<Approval[]>;

  attachedFiles$: Observable<File[]>;

  advanceRequestCustomFields$: Observable<CustomField[]>;

  customFields$: Observable<any>;

  isDeviceWidthSmall = window.innerWidth < this.minScreenWidth;

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
    @Inject(MIN_SCREEN_WIDTH) public minScreenWidth: number
  ) {}

  getReceiptExtension(name) {
    let res = null;

    if (name) {
      const filename = name.toLowerCase();
      const idx = filename.lastIndexOf('.');

      if (idx > -1) {
        res = filename.substring(idx + 1, filename.length);
      }
    }

    return res;
  }

  getReceiptDetails(file) {
    const ext = this.getReceiptExtension(file.name);
    const res = {
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

  ionViewWillEnter() {
    const id = this.activatedRoute.snapshot.params.id;
    this.advanceRequest$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => this.advanceRequestService.getAdvanceRequest(id)),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay(1)
    );

    this.actions$ = this.advanceRequestService.getActions(id).pipe(shareReplay(1));
    this.activeApprovals$ = this.advanceRequestService.getActiveApproversByAdvanceRequestId(id);
    this.attachedFiles$ = this.fileService.findByAdvanceRequestId(id).pipe(
      switchMap((res) => from(res)),
      concatMap((fileObj: any) =>
        this.fileService.downloadUrl(fileObj.id).pipe(
          map((downloadUrl) => {
            fileObj.url = downloadUrl;
            const details = this.getReceiptDetails(fileObj);
            fileObj.type = details.type;
            fileObj.thumbnail = details.thumbnail;
            return fileObj;
          })
        )
      ),
      reduce((acc, curr) => acc.concat(curr), [] as File[])
    );

    this.customFields$ = this.advanceRequestsCustomFieldsService.getAll();

    this.advanceRequestCustomFields$ = forkJoin({
      advanceRequest: this.advanceRequest$,
      customFields: this.customFields$,
    }).pipe(
      map((res) => {
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
      })
    );
  }

  async pullBack() {
    const pullBackPopover = await this.popoverController.create({
      component: FyPopoverComponent,
      componentProps: {
        title: 'Pull Back Advance?',
        formLabel: 'Pulling back your advance request will allow you to edit and re-submit the request.',
      },
      cssClass: 'fy-dialog-popover',
    });

    await pullBackPopover.present();
    const { data } = await pullBackPopover.onWillDismiss();

    if (data && data.comment) {
      const status = {
        comment: data.comment,
      };
      const statusPayload = {
        status,
        notify: false,
      };
      const id = this.activatedRoute.snapshot.params.id;

      from(this.loaderService.showLoader())
        .pipe(
          switchMap(() => this.advanceRequestService.pullBackadvanceRequest(id, statusPayload)),
          finalize(() => from(this.loaderService.hideLoader()))
        )
        .subscribe(() => {
          this.router.navigate(['/', 'enterprise', 'my_advances']);
        });
    }
  }

  edit() {
    this.router.navigate([
      '/',
      'enterprise',
      'add_edit_advance_request',
      { id: this.activatedRoute.snapshot.params.id },
    ]);
  }

  async delete() {
    const deletePopover = await this.popoverController.create({
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      backdropDismiss: false,
      componentProps: {
        header: 'Delete Advance Request',
        body: 'Are you sure you want to delete this request?',
        deleteMethod: () => this.advanceRequestService.delete(this.activatedRoute.snapshot.params.id),
      },
    });

    await deletePopover.present();

    const { data } = await deletePopover.onDidDismiss();

    if (data && data.status === 'success') {
      this.router.navigate(['/', 'enterprise', 'my_advances']);
    }
  }

  async openCommentsModal() {
    const advanceRequest = await this.advanceRequest$.toPromise();
    const modal = await this.modalController.create({
      component: ViewCommentComponent,
      componentProps: {
        objectType: 'advance_requests',
        objectId: advanceRequest.areq_id,
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

  async viewAttachments(attachments) {
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

  ngOnInit() {}
}
