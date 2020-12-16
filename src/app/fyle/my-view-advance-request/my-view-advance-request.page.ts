import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController, ModalController } from '@ionic/angular';
import { from, noop, Observable, of } from 'rxjs';
import { concatMap, finalize, map, reduce, shareReplay, switchMap } from 'rxjs/operators';
import { Approval } from 'src/app/core/models/approval.model';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';
import { File } from 'src/app/core/models/file.model';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { FileService } from 'src/app/core/services/file.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { PullBackAdvanceRequestComponent } from './pull-back-advance-request/pull-back-advance-request.component';
import { PopupService } from 'src/app/core/services/popup.service';
import { ViewAttachmentComponent } from './view-attachment/view-attachment.component';

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private advanceRequestService: AdvanceRequestService,
    private fileService: FileService,
    private router: Router,
    private popoverController: PopoverController,
    private popupService: PopupService,
    private modalController: ModalController
  ) { }

  ionViewWillEnter() {
    const id = this.activatedRoute.snapshot.params.id;
    this.advanceRequest$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return this.advanceRequestService.getAdvanceRequest(id);
      }),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay()
    );

    this.actions$ = this.advanceRequestService.getActions(id).pipe(
      shareReplay()
    );
    this.activeApprovals$ = this.advanceRequestService.getActiveApproversByAdvanceRequestId(id);
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

    this.attachedFiles$.subscribe(console.log);

    this.advanceRequestCustomFields$ = this.advanceRequest$.pipe(
      map(res => {
        if ((res.areq_custom_field_values !== null) && (res.areq_custom_field_values.length > 0)) {
          return this.advanceRequestService.modifyAdvanceRequestCustomFields(JSON.parse(res.areq_custom_field_values));
        } else {
          return of(null) as unknown as CustomField[];
        }
      })
    );
  }

  async pullBack() {
    const pullBackPopover = await this.popoverController.create({
      component: PullBackAdvanceRequestComponent,
      cssClass: 'dialog-popover'
    });

    await pullBackPopover.present();

    const { data } = await pullBackPopover.onWillDismiss();

    if (data) {
      const status = {
        comment: data.comment
      };

      const addStatusPayload = {
        status,
        notify: false
      };

      const id = this.activatedRoute.snapshot.params.id;

      from(this.loaderService.showLoader()).pipe(
        switchMap(() => {
          return this.advanceRequestService.pullBackadvanceRequest(id, addStatusPayload);
        }),
        finalize(() => from(this.loaderService.hideLoader()))
      ).subscribe(() => {
        this.router.navigate(['/', 'enterprise', 'my_advances']);
      });
    }
  }

  // Todo: Redirect to edit advance page
  edit() {
    this.router.navigate(['/', 'enterprise', 'add_edit_advance_request', { id: this.activatedRoute.snapshot.params.id }]);
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
        this.router.navigate(['/', 'enterprise', 'my_advances']);
      });
    }
  }

  async viewAttachments(attachments) {
    const attachmentsModal = await this.modalController.create({
      component: ViewAttachmentComponent,
      componentProps: {
        attachments
      }
    });

    await attachmentsModal.present();
  }

  ngOnInit() {
  }

}
