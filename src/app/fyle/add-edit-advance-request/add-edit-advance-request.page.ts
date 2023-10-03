import { Component, ElementRef, EventEmitter, HostListener, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, PopoverController } from '@ionic/angular';
import { concat, forkJoin, from, iif, noop, Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, concatMap, finalize, map, reduce, shareReplay, switchMap } from 'rxjs/operators';
import { AdvanceRequestPolicyService } from 'src/app/core/services/advance-request-policy.service';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { AdvanceRequestsCustomFieldsService } from 'src/app/core/services/advance-requests-custom-fields.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { FileService } from 'src/app/core/services/file.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { StatusService } from 'src/app/core/services/status.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { CameraOptionsPopupComponent } from './camera-options-popup/camera-options-popup.component';
import { PolicyViolationDialogComponent } from './policy-violation-dialog/policy-violation-dialog.component';
import { NetworkService } from 'src/app/core/services/network.service';
import { FyViewAttachmentComponent } from 'src/app/shared/components/fy-view-attachment/fy-view-attachment.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { TrackingService } from '../../core/services/tracking.service';
import { ExpenseFieldsMap } from 'src/app/core/models/v1/expense-fields-map.model';
import { CaptureReceiptComponent } from 'src/app/shared/components/capture-receipt/capture-receipt.component';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { ProjectV1 } from 'src/app/core/models/v1/extended-project.model';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { AdvanceRequests } from 'src/app/core/models/advance-requests.model';
import { AddEditAdvanceRequestFormValue } from 'src/app/core/models/add-edit-advance-request-form-value.model';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { AdvanceRequestActions } from 'src/app/core/models/advance-request-actions.model';
import { CurrencyObj } from 'src/app/core/models/currency-obj.model';
import { AdvanceRequestFile } from 'src/app/core/models/advance-request-file.model';
import { PolicyViolationCheck } from 'src/app/core/models/policy-violation-check.model';
import { AdvanceRequestsCustomFields } from 'src/app/core/models/advance-requests-custom-fields.model';
import { File } from 'src/app/core/models/file.model';
import { AdvanceRequestCustomFieldValues } from 'src/app/core/models/advance-request-custom-field-values.model';
import { AdvanceRequestDeleteParams } from 'src/app/core/models/advance-request-delete-params.model';
@Component({
  selector: 'app-add-edit-advance-request',
  templateUrl: './add-edit-advance-request.page.html',
  styleUrls: ['./add-edit-advance-request.page.scss'],
})
export class AddEditAdvanceRequestPage implements OnInit {
  @ViewChild('formContainer') formContainer: ElementRef;

  isConnected$: Observable<boolean>;

  isProjectsEnabled$: Observable<boolean>;

  extendedAdvanceRequest$: Observable<Partial<AdvanceRequests>>;

  mode: string;

  fg: FormGroup;

  homeCurrency$: Observable<string>;

  projects$: Observable<ProjectV1[]>;

  customFields$: Observable<AdvanceRequestsCustomFields[]>;

  dataUrls: FileObject[];

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private advanceRequestsCustomFieldsService: AdvanceRequestsCustomFieldsService,
    private advanceRequestService: AdvanceRequestService,
    private advanceRequestPolicyService: AdvanceRequestPolicyService,
    private modalController: ModalController,
    private statusService: StatusService,
    private loaderService: LoaderService,
    private projectsService: ProjectsService,
    private popoverController: PopoverController,
    private transactionsOutboxService: TransactionsOutboxService,
    private fileService: FileService,
    private orgSettingsService: OrgSettingsService,
    private networkService: NetworkService,
    private modalProperties: ModalPropertiesService,
    private trackingService: TrackingService,
    private expenseFieldsService: ExpenseFieldsService,
    private currencyService: CurrencyService,
    private orgUserSettingsService: OrgUserSettingsService
  ) {}

  @HostListener('keydown')
  scrollInputIntoView(): void {
    const el = document.activeElement;
    if (el && el instanceof HTMLInputElement) {
      el.scrollIntoView({
        block: 'center',
      });
    }
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
      customFieldValues: new FormArray([]),
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

  checkPolicyViolation(advanceRequest: Partial<AdvanceRequests>): Observable<PolicyViolationCheck> {
    return this.advanceRequestService.testPolicy(advanceRequest);
  }

  submitAdvanceRequest(advanceRequest: Partial<AdvanceRequests>): Observable<AdvanceRequestFile> {
    const fileObjPromises = this.fileAttachments();
    return this.advanceRequestService.createAdvReqWithFilesAndSubmit(advanceRequest, fileObjPromises);
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

  async showPolicyModal(
    violatedPolicyRules: string[],
    policyViolationActionDescription: string,
    event: string,
    advanceRequest: Partial<AdvanceRequests>
  ): Promise<Subscription> {
    return iif(
      () => !!(advanceRequest && advanceRequest.id && advanceRequest.org_user_id),
      this.statusService.findLatestComment(advanceRequest.id, 'advance_requests', advanceRequest.org_user_id),
      of(null)
    ).subscribe(async (latestComment) => {
      const policyViolationModal = await this.modalController.create({
        component: PolicyViolationDialogComponent,
        componentProps: {
          latestComment,
          violatedPolicyRules,
          policyViolationActionDescription,
        },
        mode: 'ios',
        ...this.modalProperties.getModalDefaultProperties(),
      });

      await policyViolationModal.present();

      const { data } = await policyViolationModal.onWillDismiss<{ reason: string }>();
      if (data) {
        return this.saveAndSubmit(event, advanceRequest)
          .pipe(
            switchMap((res) =>
              iif(
                () => data.reason && data.reason !== latestComment,
                this.statusService.post('advance_requests', res.advanceReq.id, { comment: data.reason }, true),
                of(null)
              )
            ),
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
            })
          )
          .subscribe(noop);
      } else {
        if (event === 'draft') {
          this.saveDraftAdvanceLoading = false;
        } else {
          this.saveAdvanceLoading = false;
        }
      }
    });
  }

  showFormValidationErrors(): void {
    this.fg.markAllAsTouched();
    const formContainer = this.formContainer.nativeElement as HTMLElement;
    if (formContainer) {
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
          switchMap((advanceRequest) => {
            const policyViolations$ = this.checkPolicyViolation(advanceRequest).pipe(shareReplay(1));

            let policyViolationActionDescription = '';
            return policyViolations$.pipe(
              map((policyViolations) => {
                policyViolationActionDescription = policyViolations.advance_request_desired_state.action_description;
                return this.advanceRequestPolicyService.getPolicyRules(policyViolations);
              }),
              catchError((err: { status: number }) => {
                if (err.status === 500) {
                  return of([]);
                } else {
                  return throwError(err);
                }
              }),
              switchMap((policyRules: string[]) => {
                if (policyRules.length > 0) {
                  return this.showPolicyModal(policyRules, policyViolationActionDescription, event, advanceRequest);
                } else {
                  return this.saveAndSubmit(event, advanceRequest).pipe(
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
                    })
                  );
                }
              })
            );
          })
        )
        .subscribe(noop);
    } else {
      this.showFormValidationErrors();
    }
  }

  generateAdvanceRequestFromFg(
    extendedAdvanceRequest$: Observable<Partial<AdvanceRequests>>
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
      })
    );
  }

  modifyAdvanceRequestCustomFields(customFields: AdvanceRequestCustomFieldValues[]): AdvanceRequestCustomFieldValues[] {
    customFields.sort((a, b) => (a.id > b.id ? 1 : -1));
    customFields = customFields.map((customField) => {
      if (customField.type === 'DATE' && customField.value) {
        const updatedDate = new Date(customField.value.toString());
        customField.value =
          updatedDate.getFullYear() + '-' + (updatedDate.getMonth() + 1) + '-' + updatedDate.getDate();
      }
      return { id: customField.id, name: customField.name, value: customField.value };
    });
    this.customFieldValues = customFields;
    return this.customFieldValues;
  }

  fileAttachments(): Observable<File[]> {
    const fileObjs = [];
    this.dataUrls.map((dataUrl) => {
      dataUrl.type = dataUrl.type === 'application/pdf' || dataUrl.type === 'pdf' ? 'pdf' : 'image';
      if (!dataUrl.id) {
        fileObjs.push(from(this.transactionsOutboxService.fileUpload(dataUrl.url, dataUrl.type)));
      }
    });

    return iif(() => fileObjs.length !== 0, forkJoin(fileObjs), of(null));
  }

  async addAttachments(event: Event): Promise<void> {
    event.stopPropagation();
    event.preventDefault();

    const cameraOptionsPopup = await this.popoverController.create({
      component: CameraOptionsPopupComponent,
      cssClass: 'camera-options-popover',
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
        type: receiptDetails.type,
        url: receiptDetails.dataUrl,
        thumbnail: receiptDetails.dataUrl,
      });
    }
  }

  async viewAttachments(): Promise<void> {
    let attachments = this.dataUrls;

    attachments = attachments.map((attachment) => {
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
      },
      mode: 'ios',
    });

    await attachmentsModal.present();

    const { data } = await attachmentsModal.onWillDismiss<{ attachments: FileObject[] }>();

    if (data) {
      this.dataUrls = data.attachments;
    }
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
          })
        )
      ),
      reduce((acc: FileObject[], curr) => acc.concat(curr), [])
    );
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
        deleteMethod: (): Observable<AdvanceRequests> =>
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
    this.mode = (this.activatedRoute.snapshot.params.id as string) ? 'edit' : 'add';
    const orgSettings$ = this.orgSettingsService.get();
    const orgUserSettings$ = this.orgUserSettingsService.get();
    this.homeCurrency$ = this.currencyService.getHomeCurrency();
    const eou$ = from(this.authService.getEou());
    this.dataUrls = [];
    this.customFieldValues = [];
    if (this.mode === 'edit') {
      this.actions$ = this.advanceRequestService
        .getActions(this.activatedRoute.snapshot.params.id as string)
        .pipe(shareReplay(1));

      this.actions$.subscribe((res) => {
        this.advanceActions = res;
      });
    }

    const editAdvanceRequestPipe$: Observable<Partial<AdvanceRequests>> = from(this.loaderService.showLoader()).pipe(
      switchMap(() => this.advanceRequestService.getEReq(this.activatedRoute.snapshot.params.id as string)),
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
        this.getAttachedReceipts(this.activatedRoute.snapshot.params.id as string).subscribe((files) => {
          this.dataUrls = files;
        });
        return res.areq;
      }),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay(1)
    );

    const newAdvanceRequestPipe$ = forkJoin({
      orgUserSettings: orgUserSettings$,
      homeCurrency: this.homeCurrency$,
      eou: eou$,
    }).pipe(
      map((res) => {
        const { orgUserSettings, homeCurrency, eou } = res;
        const advanceRequest = {
          org_user_id: eou.ou.id,
          currency: orgUserSettings.currency_settings.preferred_currency || homeCurrency,
          source: 'MOBILE',
          created_at: new Date(),
        };
        return advanceRequest;
      })
    );

    this.extendedAdvanceRequest$ = iif(
      () => !!this.activatedRoute.snapshot.params.id,
      editAdvanceRequestPipe$,
      newAdvanceRequestPipe$
    );
    this.isProjectsEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.projects && orgSettings.projects.enabled)
    );
    this.projects$ = this.projectsService.getAllActive();

    this.isProjectsVisible$ = orgSettings$.pipe(
      switchMap((orgSettings) =>
        iif(
          () => orgSettings.advanced_projects.enable_individual_projects,
          this.orgUserSettingsService.get().pipe(map((orgUserSettings) => orgUserSettings.project_ids || [])),
          this.projects$
        )
      ),
      map((projects) => projects.length > 0)
    );

    this.customFields$ = this.advanceRequestsCustomFieldsService.getAll().pipe(
      map((customFields) => {
        const customFieldsFormArray = this.fg.controls.customFieldValues as FormArray;
        customFieldsFormArray.clear();
        customFields.sort((a, b) => (a.id > b.id ? 1 : -1));
        for (const customField of customFields) {
          let value;
          this.customFieldValues.filter((customFieldValue) => {
            if (customFieldValue.id === customField.id) {
              value = customFieldValue.value;
            }
          });
          if (customField.type === 'BOOLEAN') {
            customField.mandatory = false;
            value = false;
          }
          customFieldsFormArray.push(
            this.formBuilder.group({
              id: customField.id,
              name: customField.name,
              value: [value, customField.mandatory && Validators.required],
            })
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
      })
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
