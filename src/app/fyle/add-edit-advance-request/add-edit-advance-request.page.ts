import { Component, ElementRef, EventEmitter, HostListener, OnInit, inject, viewChild } from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonSkeletonText, IonTitle, IonToolbar, ModalController, Platform, PopoverController } from '@ionic/angular/standalone';
import { concat, forkJoin, from, iif, noop, Observable, of, timer } from 'rxjs';
import { concatMap, finalize, map, raceWith, reduce, shareReplay, switchMap } from 'rxjs/operators';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';

import { AuthService } from 'src/app/core/services/auth.service';
import { FileService } from 'src/app/core/services/file.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { CameraOptionsPopupComponent } from '../camera-options-popup/camera-options-popup.component';
import { NetworkService } from 'src/app/core/services/network.service';
import { FyViewAttachmentComponent } from 'src/app/shared/components/fy-view-attachment/fy-view-attachment.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { TrackingService } from '../../core/services/tracking.service';
import { ExpenseFieldsMap } from 'src/app/core/models/v1/expense-fields-map.model';
import { CaptureReceiptComponent } from 'src/app/shared/components/capture-receipt/capture-receipt.component';
import { PlatformOrgSettingsService } from 'src/app/core/services/platform/v1/spender/org-settings.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { ProjectV1 } from 'src/app/core/models/v1/extended-project.model';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { AdvanceRequests } from 'src/app/core/models/advance-requests.model';
import { AddEditAdvanceRequestFormValue } from 'src/app/core/models/add-edit-advance-request-form-value.model';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { AdvanceRequestActions } from 'src/app/core/models/advance-request-actions.model';
import { CurrencyObj } from 'src/app/core/models/currency-obj.model';
import { AdvanceRequestFile } from 'src/app/core/models/advance-request-file.model';
import { AdvanceRequestsCustomFields } from 'src/app/core/models/advance-requests-custom-fields.model';
import { AdvanceRequestCustomFieldValues } from 'src/app/core/models/advance-request-custom-field-values.model';
import { AdvanceRequestDeleteParams } from 'src/app/core/models/advance-request-delete-params.model';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { SpenderFileService } from 'src/app/core/services/platform/v1/spender/file.service';
import { ApproverFileService } from 'src/app/core/services/platform/v1/approver/file.service';
import { NgClass, AsyncPipe } from '@angular/common';
import { FyCurrencyComponent } from './fy-currency/fy-currency.component';
import { ReceiptPreviewThumbnailComponent } from '../../shared/components/receipt-preview-thumbnail/receipt-preview-thumbnail.component';
import { FySelectComponent } from '../../shared/components/fy-select/fy-select.component';
import { FySelectProjectComponent } from '../../shared/components/fy-select-project/fy-select-project.component';
import { FyNumberComponent } from '../../shared/components/fy-number/fy-number.component';
import { FormatDateDirective } from '../../shared/directive/format-date.directive';
import { MatCheckbox } from '@angular/material/checkbox';
import { FyLocationComponent } from '../../shared/components/fy-location/fy-location.component';
import { FyMultiselectComponent } from '../../shared/components/fy-multiselect/fy-multiselect.component';
import { FyUserlistComponent } from '../../shared/components/fy-userlist/fy-userlist.component';
import { FormButtonValidationDirective } from '../../shared/directive/form-button-validation.directive';
import { EllipsisPipe } from '../../shared/pipes/ellipses.pipe';

@Component({
  selector: 'app-add-edit-advance-request',
  templateUrl: './add-edit-advance-request.page.html',
  styleUrls: ['./add-edit-advance-request.page.scss'],
  imports: [
    AsyncPipe,
    EllipsisPipe,
    FormButtonValidationDirective,
    FormatDateDirective,
    FormsModule,
    FyCurrencyComponent,
    FyLocationComponent,
    FyMultiselectComponent,
    FyNumberComponent,
    FySelectComponent,
    FySelectProjectComponent,
    FyUserlistComponent,
    IonButton,
    IonButtons,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonSkeletonText,
    IonTitle,
    IonToolbar,
    MatCheckbox,
    NgClass,
    ReactiveFormsModule,
    ReceiptPreviewThumbnailComponent
  ],
})
export class AddEditAdvanceRequestPage implements OnInit {
  private activatedRoute = inject(ActivatedRoute);

  private authService = inject(AuthService);

  private router = inject(Router);

  private formBuilder = inject(UntypedFormBuilder);

  private advanceRequestService = inject(AdvanceRequestService);

  private modalController = inject(ModalController);

  private loaderService = inject(LoaderService);

  private projectsService = inject(ProjectsService);

  private popoverController = inject(PopoverController);

  private transactionsOutboxService = inject(TransactionsOutboxService);

  private fileService = inject(FileService);

  private orgSettingsService = inject(PlatformOrgSettingsService);

  private networkService = inject(NetworkService);

  private modalProperties = inject(ModalPropertiesService);

  private trackingService = inject(TrackingService);

  private expenseFieldsService = inject(ExpenseFieldsService);

  private currencyService = inject(CurrencyService);

  private platformEmployeeSettingsService = inject(PlatformEmployeeSettingsService);

  private spenderFileService = inject(SpenderFileService);

  private approverFileService = inject(ApproverFileService);

  readonly formContainer = viewChild<ElementRef>('formContainer');

  private platform = inject(Platform);

  readonly fileUpload = viewChild<ElementRef<HTMLInputElement>>('fileUpload');

  isConnected$: Observable<boolean>;

  isProjectsEnabled$: Observable<boolean>;

  extendedAdvanceRequest$: Observable<Partial<AdvanceRequests>>;

  mode: string;

  fg: UntypedFormGroup;

  homeCurrency$: Observable<string>;

  projects$: Observable<ProjectV1[]>;

  customFields$: Observable<AdvanceRequestsCustomFields[]>;

  dataUrls: FileObject[];

  isIos = false;

  customFieldValues: AdvanceRequestCustomFieldValues[];

  actions$: Observable<AdvanceRequestActions>;

  id: string;

  from: string;

  isProjectsVisible$: Observable<boolean>;

  advanceActions;

  saveDraftAdvanceLoading = false;

  saveAdvanceLoading = false;

  isDeviceWidthSmall = window.innerWidth < 375;

  expenseFields$: Observable<Partial<ExpenseFieldsMap>>;

  isCameraPreviewStarted = false;

  attachmentUploadInProgress = false;

  @HostListener('keydown')
  scrollInputIntoView(): void {
    const el = this.getActiveElement();
    if (el && el instanceof HTMLInputElement) {
      el.scrollIntoView({
        block: 'center',
      });
    }
  }

  getActiveElement(): Element {
    return document.activeElement;
  }

  getFormValues(): AddEditAdvanceRequestFormValue {
    return this.fg.value as AddEditAdvanceRequestFormValue;
  }

  currencyObjValidator(c: AbstractControl): ValidationErrors {
    const currencyObj = c.value as CurrencyObj;
    if (currencyObj && currencyObj.amount && currencyObj.currency) {
      return null;
    }
    return {
      required: false,
    };
  }

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.params.id as string;
    this.from = this.activatedRoute.snapshot.params.from as string;
    this.fg = this.formBuilder.group({
      currencyObj: [, this.currencyObjValidator],
      purpose: [, Validators.required],
      notes: [],
      project: [],
      customFieldValues: new UntypedFormArray([]),
    });

    if (!this.id) {
      this.advanceActions = {
        can_save: true,
        can_submit: true,
      };
    }

    this.expenseFields$ = this.expenseFieldsService.getAllMap();
  }

  goBack(): void {
    // Todo: Fix all redirecton cases here later
    if (this.from === 'TEAM_ADVANCE') {
      this.router.navigate(['/', 'enterprise', 'team_advance']);
    } else {
      this.router.navigate(['/', 'enterprise', 'my_advances']);
    }
  }

  submitAdvanceRequest(advanceRequest: Partial<AdvanceRequests>): Observable<AdvanceRequestFile> {
    const fileObjPromises = this.fileAttachments();
    const isApprover = this.from === 'TEAM_ADVANCE';
    return this.advanceRequestService.createAdvReqWithFilesAndSubmit(advanceRequest, fileObjPromises, isApprover);
  }

  saveDraftAdvanceRequest(advanceRequest: Partial<AdvanceRequests>): Observable<AdvanceRequestFile> {
    const fileObjPromises = this.fileAttachments();
    return this.advanceRequestService.saveDraftAdvReqWithFiles(advanceRequest, fileObjPromises);
  }

  saveAndSubmit(event: string, advanceRequest: Partial<AdvanceRequests>): Observable<AdvanceRequestFile> {
    if (event !== 'draft') {
      return this.submitAdvanceRequest(advanceRequest);
    } else {
      return this.saveDraftAdvanceRequest(advanceRequest);
    }
  }

  showFormValidationErrors(): void {
    this.fg.markAllAsTouched();

    const formContainerValue = this.formContainer();
    if (formContainerValue?.nativeElement) {
      const formContainer = formContainerValue.nativeElement as HTMLElement;
      const invalidElement = formContainer.querySelector('.ng-invalid');
      if (invalidElement) {
        invalidElement.scrollIntoView({
          behavior: 'smooth',
        });
      }
    }
  }

  async showAdvanceSummaryPopover(): Promise<void> {
    if (this.fg.valid) {
      const advanceSummaryPopover = await this.popoverController.create({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Review',
          message:
            'This action will save a draft advance request and will not be submitted to your approvers directly. You need to explicitly submit a draft advance request.',
          primaryCta: {
            text: 'Finish',
            action: 'continue',
          },
          secondaryCta: {
            text: 'Cancel',
            action: 'cancel',
          },
        },
        cssClass: 'pop-up-in-center',
      });

      await advanceSummaryPopover.present();

      const { data } = await advanceSummaryPopover.onWillDismiss<{ action: string }>();

      if (data && data.action === 'continue') {
        this.save('Draft');
      }
    } else {
      this.showFormValidationErrors();
    }
  }

  save(event: string): void {
    event = event.toLowerCase();
    if (this.fg.valid) {
      if (event === 'draft') {
        this.saveDraftAdvanceLoading = true;
      } else {
        this.saveAdvanceLoading = true;
      }
      this.generateAdvanceRequestFromFg(this.extendedAdvanceRequest$)
        .pipe(
          switchMap((advanceRequest) =>
            this.saveAndSubmit(event, advanceRequest).pipe(
              finalize(() => {
                this.fg.reset();
                if (event === 'draft') {
                  this.saveDraftAdvanceLoading = false;
                } else {
                  this.saveAdvanceLoading = false;
                }
                if (this.from === 'TEAM_ADVANCE') {
                  return this.router.navigate(['/', 'enterprise', 'team_advance']);
                } else {
                  return this.router.navigate(['/', 'enterprise', 'my_advances']);
                }
              }),
            ),
          ),
        )
        .subscribe(noop);
    } else {
      this.showFormValidationErrors();
    }
  }

  generateAdvanceRequestFromFg(
    extendedAdvanceRequest$: Observable<Partial<AdvanceRequests>>,
  ): Observable<Partial<AdvanceRequests>> {
    return forkJoin({
      extendedAdvanceRequest: extendedAdvanceRequest$,
    }).pipe(
      map((res) => {
        const advanceRequest = res.extendedAdvanceRequest;

        const formValue = this.getFormValues();

        return {
          ...advanceRequest,
          currency: formValue.currencyObj.currency,
          amount: formValue.currencyObj.amount,
          purpose: formValue.purpose,
          project_id: formValue.project && formValue.project.project_id,
          org_user_id: advanceRequest.org_user_id,
          notes: formValue.notes,
          source: 'MOBILE',
          custom_field_values: formValue.customFieldValues,
        };
      }),
    );
  }

  modifyAdvanceRequestCustomFields(customFields: AdvanceRequestCustomFieldValues[]): AdvanceRequestCustomFieldValues[] {
    customFields = customFields.map((customField) => {
      if (customField.type === 'DATE' && customField.value) {
        const updatedDate = new Date(customField.value.toString());
        customField.value =
          updatedDate.getFullYear() + '-' + (updatedDate.getMonth() + 1) + '-' + updatedDate.getDate();
      }
      return { name: customField.name, value: customField.value };
    });
    this.customFieldValues = customFields;
    return this.customFieldValues;
  }

  fileAttachments(): Observable<string[]> {
    if (this.from === 'TEAM_ADVANCE') {
      return this.advanceRequestService.getApproverAdvanceRequestRaw(this.id).pipe(
        switchMap((advanceReqPlatform) => {
          if (!advanceReqPlatform || !advanceReqPlatform.user?.id) {
            return of<string[]>([]);
          }

          return from(this.authService.getEou()).pipe(
            switchMap((eou) => {
              if (!eou || !eou.ou || !eou.ou.org_id) {
                return of<string[]>([]);
              }

              const fileUploadObservables: Observable<string>[] = [];

              this.dataUrls.forEach((dataUrl) => {
                dataUrl.type = dataUrl.type === 'application/pdf' || dataUrl.type === 'pdf' ? 'pdf' : 'image';

                if (!dataUrl.id) {
                  fileUploadObservables.push(
                    from(
                      this.transactionsOutboxService.fileUpload(
                        dataUrl.url,
                        dataUrl.type,
                        { userId: advanceReqPlatform.user.id, orgId: advanceReqPlatform.org_id },
                        true,
                      ),
                    ).pipe(map((fileObj: FileObject) => fileObj.id || '')),
                  );
                }
              });

              return iif(() => fileUploadObservables.length !== 0, forkJoin(fileUploadObservables), of<string[]>([]));
            }),
          );
        }),
      );
    } else {
      const fileUploadObservables: Observable<string>[] = [];

      this.dataUrls.forEach((dataUrl) => {
        dataUrl.type = dataUrl.type === 'application/pdf' || dataUrl.type === 'pdf' ? 'pdf' : 'image';

        if (!dataUrl.id) {
          fileUploadObservables.push(
            from(this.transactionsOutboxService.fileUpload(dataUrl.url, dataUrl.type)).pipe(
              map((fileObj: FileObject) => fileObj.id || ''),
            ),
          );
        }
      });

      return iif(() => fileUploadObservables.length !== 0, forkJoin(fileUploadObservables), of<string[]>([]));
    }
  }

  async uploadFileCallback(file: Blob): Promise<void> {
    let fileData: { type: string; url: string; thumbnail: string };
    if (file) {
      const fileRead$ = from(this.fileService.readFile(file));
      const delayedLoader$ = timer(300).pipe(
        switchMap(() => from(this.loaderService.showLoader('Please wait...', 5000))),
        switchMap(() => fileRead$), // switch to fileRead$ after showing loader
      );
      // Use race to show loader only if fileRead$ takes more than 300ms.
      fileRead$
        .pipe(
          raceWith(delayedLoader$),
          map((dataUrl) => {
            fileData = {
              type: file.type,
              url: dataUrl,
              thumbnail: dataUrl,
            };
            this.dataUrls.push(fileData);
          }),
          finalize(() => this.loaderService.hideLoader()),
        )
        .subscribe();
    }
  }

  async onChangeCallback(nativeElement: HTMLInputElement): Promise<void> {
    const file = nativeElement.files[0];
    this.uploadFileCallback(file);
  }

  async addAttachments(event: Event, isAddMore = false): Promise<void> {
    event.stopPropagation();

    if (this.platform.is('ios')) {
      const nativeElement = this.fileUpload().nativeElement;
      nativeElement.onchange = async (): Promise<void> => {
        this.onChangeCallback(nativeElement);
      };
      nativeElement.click();
    } else {
      const cameraOptionsPopup = await this.popoverController.create({
        component: CameraOptionsPopupComponent,
        cssClass: 'camera-options-popover',
        componentProps: {
          mode: this.mode === 'edit' ? 'Edit Advance Request' : 'Add Advance Request',
          showHeader: isAddMore,
        },
      });

      await cameraOptionsPopup.present();

      let { data: receiptDetails } = await cameraOptionsPopup.onWillDismiss<{
        dataUrl: string;
        type: string;
        option?: string;
      }>();

      if (receiptDetails && receiptDetails.option === 'camera') {
        const captureReceiptModal = await this.modalController.create({
          component: CaptureReceiptComponent,
          componentProps: {
            isModal: true,
            allowGalleryUploads: false,
            allowBulkFyle: false,
          },
          cssClass: 'hide-modal',
        });
        await captureReceiptModal.present();
        this.isCameraPreviewStarted = true;

        const { data } = await captureReceiptModal.onWillDismiss<{ dataUrl: string }>();
        this.isCameraPreviewStarted = false;

        if (data && data.dataUrl) {
          receiptDetails = { ...data, type: this.fileService.getImageTypeFromDataUrl(data.dataUrl) };
        }
      }
      if (receiptDetails && receiptDetails.dataUrl) {
        this.dataUrls.push({
          type: receiptDetails.type === 'application/pdf' || receiptDetails.type === 'pdf' ? 'pdf' : 'image',
          url: receiptDetails.dataUrl,
          thumbnail: receiptDetails.dataUrl,
        });
      }
    }
  }

  async viewAttachments(): Promise<void> {
    this.attachmentUploadInProgress = true;

    const fileIds = await this.fileAttachments().toPromise();

    if (fileIds && fileIds.length > 0) {
      let fileIdIndex = 0;
      this.dataUrls = this.dataUrls.map((attachment) => {
        if (!attachment.id && fileIdIndex < fileIds.length) {
          return {
            ...attachment,
            id: fileIds[fileIdIndex++],
            type: attachment.type === 'application/pdf' || attachment.type === 'pdf' ? 'pdf' : 'image',
          };
        }
        return attachment;
      });

      // Attach the uploaded files to the advance request
      if (this.id) {
        if (this.from === 'TEAM_ADVANCE') {
          // For team advances, use approver service
          await this.advanceRequestService
            .getApproverAdvanceRequestRaw(this.id)
            .pipe(
              switchMap((advanceReqPlatform) => {
                if (advanceReqPlatform?.user?.id) {
                  return this.approverFileService.attachToAdvance(this.id, fileIds, advanceReqPlatform.user.id);
                }
                return of(null);
              }),
            )
            .toPromise();
        } else {
          // For regular advances, use spender service
          await this.spenderFileService.attachToAdvance(this.id, fileIds).toPromise();
        }
      }
    }

    const attachments = this.dataUrls.map((attachment) => {
      if (!attachment.id) {
        attachment.type = attachment.type === 'application/pdf' || attachment.type === 'pdf' ? 'pdf' : 'image';
      }
      return attachment;
    });

    const attachmentsModal = await this.modalController.create({
      component: FyViewAttachmentComponent,
      componentProps: {
        attachments,
        canEdit: true,
        isTeamAdvance: this.from === 'TEAM_ADVANCE',
      },
      mode: 'ios',
    });

    await attachmentsModal.present();

    const { data } = await attachmentsModal.onWillDismiss<{ attachments: FileObject[] }>();

    if (data) {
      this.dataUrls = data.attachments;
    }

    this.attachmentUploadInProgress = false;
  }

  getReceiptExtension(name: string): string {
    let res: string = null;

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

  getAttachedReceipts(id: string): Observable<FileObject[]> {
    if (this.from === 'TEAM_ADVANCE') {
      return this.fileService.findByAdvanceRequestIdForTeamAdvance(id).pipe(
        switchMap((fileObjs) => from(fileObjs)),
        concatMap((fileObj) =>
          this.fileService.downloadUrlForTeamAdvance(fileObj.id).pipe(
            map((downloadUrl) => {
              fileObj.url = downloadUrl;
              const details = this.getReceiptDetails(fileObj);
              fileObj.type = details.type;
              fileObj.thumbnail = details.thumbnail;
              return fileObj;
            }),
          ),
        ),
        reduce((acc: FileObject[], curr) => acc.concat(curr), []),
      );
    } else {
      return this.fileService.findByAdvanceRequestId(id).pipe(
        switchMap((fileObjs) => from(fileObjs)),
        concatMap((fileObj) =>
          this.fileService.downloadUrl(fileObj.id).pipe(
            map((downloadUrl) => {
              fileObj.url = downloadUrl;
              const details = this.getReceiptDetails(fileObj);
              fileObj.type = details.type;
              fileObj.thumbnail = details.thumbnail;
              return fileObj;
            }),
          ),
        ),
        reduce((acc: FileObject[], curr) => acc.concat(curr), []),
      );
    }
  }

  async openCommentsModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: ViewCommentComponent,
      componentProps: {
        objectType: 'advance_requests',
        objectId: this.id,
      },
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await modal.present();
    const { data } = await modal.onDidDismiss<{ updated: boolean }>();

    if (data && data.updated) {
      this.trackingService.addComment();
    } else {
      this.trackingService.viewComment();
    }
  }

  getAdvanceRequestDeleteParams(): AdvanceRequestDeleteParams {
    return {
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      backdropDismiss: false,
      componentProps: {
        header: 'Delete Advance Request',
        body: 'Are you sure you want to delete this request?',
        deleteMethod: (): Observable<void> =>
          this.advanceRequestService.delete(this.activatedRoute.snapshot.params.id as string),
      },
    };
  }

  async delete(): Promise<void> {
    const deletePopover = await this.popoverController.create(this.getAdvanceRequestDeleteParams());

    await deletePopover.present();

    const { data } = await deletePopover.onDidDismiss<{ status: string }>();

    if (data && data.status === 'success') {
      this.router.navigate(['/', 'enterprise', 'my_advances']);
    }
  }

  ionViewWillEnter(): void {
    this.isIos = this.platform.is('ios');
    this.mode = (this.activatedRoute.snapshot.params.id as string) ? 'edit' : 'add';
    const orgSettings$ = this.orgSettingsService.get();
    this.homeCurrency$ = this.currencyService.getHomeCurrency();
    const eou$ = from(this.authService.getEou());
    this.dataUrls = [];
    this.customFieldValues = [];
    if (this.mode === 'edit') {
      const requestId = this.activatedRoute.snapshot.params.id as string;

      if (this.from === 'TEAM_ADVANCE') {
        this.actions$ = this.advanceRequestService.getApproverPermissions(requestId).pipe(shareReplay(1));
      } else {
        this.actions$ = this.advanceRequestService.getSpenderPermissions(requestId).pipe(shareReplay(1));
      }

      this.actions$.subscribe((res) => {
        this.advanceActions = res;
      });
    }

    const editAdvanceRequestPipe$: Observable<Partial<AdvanceRequests>> = of(
      this.activatedRoute.snapshot.params.from === 'TEAM_ADVANCE',
    ).pipe(
      switchMap((isEditFromTeamView) => {
        const requestId = this.activatedRoute.snapshot.params.id as string;
        if (isEditFromTeamView) {
          return this.advanceRequestService.getEReqFromApprover(requestId);
        } else {
          return this.advanceRequestService.getEReq(requestId);
        }
      }),
      map((res) => {
        this.fg.patchValue({
          currencyObj: {
            currency: res.areq.currency,
            amount: res.areq.amount,
          },
          purpose: res.areq.purpose,
          notes: res.areq.notes,
        });

        if (res.areq.project_id) {
          const projectId = res.areq.project_id;
          this.projectsService.getbyId(projectId).subscribe((selectedProject) => {
            this.fg.patchValue({
              project: selectedProject,
            });
          });
        }

        if (res.areq.custom_field_values) {
          this.modifyAdvanceRequestCustomFields(res.areq.custom_field_values);
        }

        const requestId = this.activatedRoute.snapshot.params.id as string;
        this.getAttachedReceipts(requestId).subscribe((files) => {
          this.dataUrls = files;
        });
        return res.areq;
      }),
      shareReplay(1),
    );

    const newAdvanceRequestPipe$ = forkJoin({
      homeCurrency: this.homeCurrency$,
      eou: eou$,
    }).pipe(
      map((res) => {
        const { homeCurrency, eou } = res;
        const advanceRequest = {
          org_user_id: eou.ou.id,
          currency: homeCurrency || null,
          source: 'MOBILE',
          created_at: new Date(),
        };
        return advanceRequest;
      }),
    );

    this.extendedAdvanceRequest$ = iif(
      () => !!this.activatedRoute.snapshot.params.id,
      editAdvanceRequestPipe$,
      newAdvanceRequestPipe$,
    );

    this.isProjectsEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.projects && orgSettings.projects.enabled),
    );
    this.projects$ = this.projectsService.getAllActive();

    this.isProjectsVisible$ = orgSettings$.pipe(
      switchMap((orgSettings) =>
        iif(
          () => orgSettings.advanced_projects.enable_individual_projects,
          this.platformEmployeeSettingsService
            .get()
            .pipe(map((employeeSettings) => employeeSettings.project_ids || [])),
          this.projects$,
        ),
      ),
      map((projects) => projects.length > 0),
    );

    this.customFields$ = (
      this.from === 'TEAM_ADVANCE'
        ? this.advanceRequestService.getEReqFromApprover(this.activatedRoute.snapshot.params.id as string).pipe(
            switchMap((advanceReqPlatform) => {
              const orgId = advanceReqPlatform.ou.org_id;
              return this.advanceRequestService.getCustomFieldsForApprover(orgId);
            }),
          )
        : this.advanceRequestService.getCustomFieldsForSpender()
    ).pipe(
      map((customFields) => {
        const customFieldsFormArray = this.fg.controls.customFieldValues as UntypedFormArray;
        customFieldsFormArray.clear();
        for (const customField of customFields) {
          let value;
          this.customFieldValues.filter((customFieldValue) => {
            if (customFieldValue.name === customField.name) {
              value = customFieldValue.value;
            }
          });
          if (customField.type === 'BOOLEAN') {
            customField.is_mandatory = false;
            value = false;
          }
          customFieldsFormArray.push(
            this.formBuilder.group({
              id: customField.id,
              name: customField.name,
              value: [value, customField.is_mandatory && Validators.required],
            }),
          );
        }

        return customFields.map((customField, i) => {
          customField.control = customFieldsFormArray.at(i);

          if (customField.options) {
            const newOptions = customField.options.map((option) => ({
              label: option as string,
              value: option as string,
            }));
            customField.options = newOptions;
          }
          return customField;
        });
      }),
    );
    this.setupNetworkWatcher();
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable());
    this.isConnected$.subscribe((isOnline) => {
      if (!isOnline) {
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
      }
    });
  }
}
