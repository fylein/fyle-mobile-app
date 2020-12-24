import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, PopoverController } from '@ionic/angular';
import { forkJoin, from, iif, noop, Observable, of } from 'rxjs';
import { concatMap, finalize, map, reduce, shareReplay, switchMap, tap } from 'rxjs/operators';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { FileObject } from 'src/app/core/models/file_obj.model';
import { AdvanceRequestPolicyService } from 'src/app/core/services/advance-request-policy.service';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { AdvanceRequestsCustomFieldsService } from 'src/app/core/services/advance-requests-custom-fields.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { FileService } from 'src/app/core/services/file.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { StatusService } from 'src/app/core/services/status.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { CameraOptionsPopupComponent } from './camera-options-popup/camera-options-popup.component';
import { PolicyViolationDialogComponent } from './policy-violation-dialog/policy-violation-dialog.component';
import { ViewAttachmentsComponent } from './view-attachments/view-attachments.component';
import { PopupService } from 'src/app/core/services/popup.service';

@Component({
  selector: 'app-add-edit-advance-request',
  templateUrl: './add-edit-advance-request.page.html',
  styleUrls: ['./add-edit-advance-request.page.scss'],
})
export class AddEditAdvanceRequestPage implements OnInit {
  isProjectsEnabled$: Observable<boolean>;
  extendedAdvanceRequest$: Observable<any>;
  mode: string;
  fg: FormGroup;
  homeCurrency$: Observable<any>;
  projects$: Observable<[]>;
  customFields$: Observable<any>;
  attachmentUploadInProgress: boolean;
  dataUrls: any[];
  customFieldValues: any[];
  actions$: Observable<any>;
  id: string;
  isProjectsVisible$: Observable<boolean>;

  constructor(
    private offlineService: OfflineService,
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
    private projectService: ProjectsService,
    private popoverController: PopoverController,
    private transactionsOutboxService: TransactionsOutboxService,
    private fileService: FileService,
    private popupService: PopupService
  ) { }

  currencyObjValidator(c: FormControl): ValidationErrors {
    if (c.value && c.value.amount && c.value.currency) {
      return null;
    }
    return {
      required: false
    };
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params.id;
    // Todo: Support to add receipts to advance request
    this.fg = this.formBuilder.group({
      currencyObj: [, this.currencyObjValidator],
      purpose: [, Validators.required],
      notes: [],
      project: [],
      custom_field_values: new FormArray([]),
    });
  }

  goBack() {
    // Todo: Fix all redirecton cases here later
    this.router.navigate(['/', 'enterprise', 'my_advances']);
  }

  checkPolicyViolation(advanceRequest) {
    return this.advanceRequestService.testPolicy(advanceRequest);
  }

  submitAdvanceRequest(advanceRequest){
    const fileObjPromises = this.fileAttachments();
    return this.advanceRequestService.createAdvReqWithFilesAndSubmit(advanceRequest, fileObjPromises);
  }

  saveDraftAdvanceRequest(advanceRequest){
    const fileObjPromises = this.fileAttachments();
    return this.advanceRequestService.saveDraftAdvReqWithFiles(advanceRequest, fileObjPromises);
  }

  saveAndSubmit(event, advanceRequest) {
    if (event !== 'draft') {
      return this.submitAdvanceRequest(advanceRequest);
    } else {
      return this.saveDraftAdvanceRequest(advanceRequest);
    }
  }

  async showPolicyModal(violatedPolicyRules: string[], policyViolationActionDescription: string, event: string, advanceRequest) {
    const policyViolationModal = await this.modalController.create({
      component: PolicyViolationDialogComponent,
      componentProps: {
        violatedPolicyRules,
        policyViolationActionDescription
      }
    });

    await policyViolationModal.present();

    const { data } = await policyViolationModal.onWillDismiss();

    if (data && data.reason) {
      this.loaderService.showLoader('Creating Advance Request...');
      return this.saveAndSubmit(event, advanceRequest).pipe(
        switchMap(res => {
          return this.statusService.post('advance_requests', res.advanceReq.id, {comment: data.reason}, true);
        }),
        finalize(() => {
          this.fg.reset();
          this.loaderService.hideLoader();
          return this.router.navigate(['/', 'enterprise', 'my_advances']);
        })
      ).subscribe(noop);
    }
  }

  save(event: string) {
    event = event.toLowerCase();
    if (this.fg.valid) {
      this.generateAdvanceRequestFromFg(this.extendedAdvanceRequest$).pipe(
        switchMap(advanceRequest => {
          const policyViolations$ = this.checkPolicyViolation(advanceRequest).pipe(
            shareReplay()
          );

          let policyViolationActionDescription = '';
          return policyViolations$.pipe(
            map(policyViolations => {
              policyViolationActionDescription = policyViolations.advance_request_desired_state.action_description;
              return this.advanceRequestPolicyService.getPolicyRules(policyViolations);
            }),
            switchMap((policyRules: string[]) => {
              if (policyRules.length > 0) {
                return this.showPolicyModal(policyRules, policyViolationActionDescription, event, advanceRequest);
              } else {
                this.loaderService.showLoader('Creating Advance Request...');
                return this.saveAndSubmit(event, advanceRequest).pipe(
                  finalize(() => {
                    this.fg.reset();
                    this.loaderService.hideLoader();
                    return this.router.navigate(['/', 'enterprise', 'my_advances']);
                  })
                );
              }
            }),
          )
        })
      ).subscribe(noop);
    } else {
      this.fg.markAllAsTouched();
    }
  }

  generateAdvanceRequestFromFg(extendedAdvanceRequest$) {
    return forkJoin({
      extendedAdvanceRequest: extendedAdvanceRequest$
    }).pipe(
      map(res => {
        const advanceRequest: any = res.extendedAdvanceRequest;

        return {
          ...advanceRequest,
          currency: this.fg.value.currencyObj.currency,
          amount: this.fg.value.currencyObj.amount,
          purpose: this.fg.value.purpose,
          project_id: this.fg.value.project && this.fg.value.project.project_id,
          org_user_id: advanceRequest.org_user_id,
          notes: this.fg.value.notes,
          source: 'MOBILE',
          custom_field_values: this.fg.value.custom_field_values
        };
      })
    );
  }

  modifyAdvanceRequestCustomFields(customFields): CustomField[] {
    customFields.sort((a, b) => (a.id > b.id) ? 1 : -1);
    customFields = customFields.map(customField => {
      if (customField.type === 'DATE' && customField.value) {
        const updatedDate = new Date(customField.value);
        customField.value = updatedDate.getFullYear() + '-' + (updatedDate.getMonth() + 1) + '-' + updatedDate.getDate();
      }
      return {id: customField.id, name: customField.name, value: customField.value};
    });
    this.customFieldValues = customFields;
    return this.customFieldValues;
  }

  fileAttachments() {
    const fileObjs = [];
    this.dataUrls.map(dataUrl => {
      dataUrl.type = dataUrl.type === 'application/pdf' ? 'pdf' : 'image';
      if (!dataUrl.id) {
        fileObjs.push(from(this.transactionsOutboxService.fileUpload(dataUrl.url, dataUrl.type)));
      }
    });

    return iif(
      () => fileObjs.length !== 0,
      forkJoin(fileObjs),
      of(null)
    );
  }

  async addAttachments(event) {
    event.stopPropagation();
    event.preventDefault();

    const cameraOptionsPopup = await this.popoverController.create({
      component: CameraOptionsPopupComponent,
      cssClass: 'camera-options-popover'
    });

    await cameraOptionsPopup.present();

    const { data } = await cameraOptionsPopup.onWillDismiss();

    if (data) {
      this.dataUrls.push({
        type: data.type,
        url: data.dataUrl,
        thumbnail: data.dataUrl
      });
    }

  }

  async viewAttachments() {

    let attachments = this.dataUrls;

    attachments = attachments.map(attachment => {
      if (!attachment.id) {
        attachment.type = attachment.type === 'application/pdf' ? 'pdf' : 'image';
      }
      return attachment;
    });
    const attachmentsModal = await this.modalController.create({
      component: ViewAttachmentsComponent,
      componentProps: {
        attachments
      }
    });

    await attachmentsModal.present();

    const { data } = await attachmentsModal.onWillDismiss();

    if (data) {
      this.dataUrls = data.attachments;
    }
  }

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
      thumbnail: 'img/fy-receipt.svg'
    };

    if (ext && (['pdf'].indexOf(ext) > -1)) {
      res.type = 'pdf';
      res.thumbnail = 'img/fy-pdf.svg';
    } else if (ext && (['png', 'jpg', 'jpeg', 'gif'].indexOf(ext) > -1)) {
      res.type = 'image';
      res.thumbnail = file.url;
    }

    return res;
  }

  getAttachedReceipts(id) {
    return this.fileService.findByAdvanceRequestId(id).pipe(
      switchMap(fileObjs => {
        return from(fileObjs);
      }),
      concatMap((fileObj: any) => {
        return this.fileService.downloadUrl(fileObj.id).pipe(
          map(downloadUrl => {
            fileObj.url = downloadUrl;
            const details = this.getReceiptDetails(fileObj);
            fileObj.type = details.type;
            fileObj.thumbnail = details.thumbnail;
            return fileObj;
          })
        );
      }),
      reduce((acc, curr) => acc.concat(curr), []),
    )
  }

  async delete() {
    const id = this.activatedRoute.snapshot.params.id;

    const popupResults = await this.popupService.showPopup({
      header: 'Confirm',
      message: 'Are you sure you want to delete this Advance Request',
      primaryCta: {
        text: 'Delete'
      }
    });

    if (popupResults === 'primary') {
      this.advanceRequestService.delete(id).subscribe(() => {
        this.router.navigate(['/', 'enterprise', 'my_advances']);
      });
    }
  }

  ionViewWillEnter() {
    this.mode = this.activatedRoute.snapshot.params.id ? 'edit' : 'add';
    const orgSettings$ = this.offlineService.getOrgSettings();
    const orgUserSettings$ = this.offlineService.getOrgUserSettings();
    this.homeCurrency$ = this.offlineService.getHomeCurrency();
    const eou$ = from(this.authService.getEou());
    this.dataUrls = [];
    this.customFieldValues = [];
    this.actions$ = this.advanceRequestService.getActions(this.activatedRoute.snapshot.params.id).pipe(
      shareReplay()
    );


    const editAdvanceRequestPipe$ = this.advanceRequestService.getEReq(this.activatedRoute.snapshot.params.id).pipe(
      map(res => {
        this.fg.patchValue({
          currencyObj: {
            currency: res.areq.currency,
            amount: res.areq.amount
          },
          purpose: res.areq.purpose,
          notes: res.areq.notes,
        });

        if (res.areq.project_id) {
          const projectId = res.areq.project_id;
          this.projectService.getbyId(projectId).subscribe(selectedProject => {
            this.fg.patchValue({
              project: selectedProject
            });
          });
        }

        if (res.areq.custom_field_values) {
          this.modifyAdvanceRequestCustomFields(res.areq.custom_field_values);
        }
        this.getAttachedReceipts(this.activatedRoute.snapshot.params.id).subscribe(files => {
          this.dataUrls = files;
        });
        return res.areq;
      }),
      shareReplay()
    );

    const newAdvanceRequestPipe$ = forkJoin({
      orgUserSettings: orgUserSettings$,
      homeCurrency: this.homeCurrency$,
      eou: eou$
    }).pipe(
      map(res => {
        const { orgUserSettings, homeCurrency, eou } = res;
        const advanceRequest = {
          org_user_id: eou.ou.id,
          currency: orgUserSettings.currency_settings.preferred_currency || homeCurrency,
          source: 'MOBILE',
          created_at: new Date()
        };
        return advanceRequest;
      })
    );

    this.extendedAdvanceRequest$ = iif(() => this.activatedRoute.snapshot.params.id, editAdvanceRequestPipe$, newAdvanceRequestPipe$);
    this.isProjectsEnabled$ = orgSettings$.pipe(
      map(orgSettings => {
        return orgSettings.projects && orgSettings.projects.enabled;
      })
    );
    this.projects$ = this.offlineService.getProjects();

    this.isProjectsVisible$ = this.offlineService.getOrgSettings().pipe(
      switchMap((orgSettings) => {
        return iif(
          () => orgSettings.advanced_projects.enable_individual_projects,
          this.offlineService.getOrgUserSettings().pipe(
            map((orgUserSettings: any) => orgUserSettings.project_ids || [])
          ),
          this.projects$
        );
      }),
      map(projects => projects.length > 0)
    );

    this.customFields$ = this.advanceRequestsCustomFieldsService.getAll().pipe(
      map((customFields: any[]) => {
        const customFieldsFormArray = this.fg.controls.custom_field_values as FormArray;
        customFieldsFormArray.clear();
        customFields.sort((a, b) => (a.id > b.id) ? 1 : -1);
        for (const customField of customFields) {
          let value;
          this.customFieldValues.filter(customFieldValue => {
            if (customFieldValue.id === customField.id) {
              value = customFieldValue.value;
            }
          });
          customFieldsFormArray.push(
            this.formBuilder.group({
              id: customField.id,
              name: customField.name,
              value: [value, customField.mandatory && Validators.required]
            })
          );
        }

        return customFields.map((customField, i) => {
          customField.control = customFieldsFormArray.at(i);

          if (customField.options) {
            customField.options = customField.options.map(option => {
              return { label: option, value: option };
            });
          }
          return customField;
        });
      })
    )
  }

}
