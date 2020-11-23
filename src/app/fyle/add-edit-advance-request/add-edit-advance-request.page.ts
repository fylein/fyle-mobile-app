import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { forkJoin, from, iif, noop, Observable, of } from 'rxjs';
import { finalize, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { AdvanceRequestPolicyService } from 'src/app/core/services/advance-request-policy.service';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { AdvanceRequestsCustomFieldsService } from 'src/app/core/services/advance-requests-custom-fields.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { StatusService } from 'src/app/services/status.service';
import { PolicyViolationDialogComponent } from './policy-violation-dialog/policy-violation-dialog.component';

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
  isIndividualProjectsEnabled$: Observable<boolean>;
  individualProjectIds$: Observable<[]>;
  projects$: Observable<[]>;
  customFields$: Observable<any>;

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
    private loaderService: LoaderService
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
    this.fg = this.formBuilder.group({
      currencyObj: [, this.currencyObjValidator],
      purpose: [, Validators.required],
      notes: [],
      project: [],
      custom_field_values: new FormArray([]),
    });
  }

  goBack() {
    // Todo: Fix all cases here later
    this.router.navigate(['/', 'enterprise', 'my_advances']);
  }

  checkPolicyViolation(advanceRequest) {
    return this.advanceRequestService.testPolicy(advanceRequest);
  }

  submitAdvanceRequest(advanceRequest){
    return this.advanceRequestService.createAdvReqWithFilesAndSubmit(advanceRequest);
  }


  saveDraftAdvanceRequest(advanceRequest){
    return this.advanceRequestService.saveDraftAdvReqWithFiles(advanceRequest);
  }

  saveAndSubmit(event, advanceRequest) {
    if (event !== 'DRAFT') {
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
          return this.statusService.post('advance_requests', res.id, {comment: data.reason}, true);
        }),
        finalize(() => {
          this.fg.reset();
          this.loaderService.hideLoader();
          return this.router.navigate(['/', 'enterprise', 'my_advances']);
        })
      ).subscribe(noop);
    }
  }

  save(event) {
    if (this.fg.valid) {
      this.generateAdvanceRequestFromFg(this.extendedAdvanceRequest$).pipe(
        switchMap(advanceRequest => {
          const policyViolations$ = this.checkPolicyViolation(advanceRequest).pipe(
            shareReplay()
          );

          let policyViolationActionDescription = '';
          return policyViolations$.pipe(
            map(policyViolations => {
              policyViolationActionDescription = policyViolations?.advance_request_desired_state?.action_description;
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
          currency: this.fg.value.currencyObj.currency,
          amount: this.fg.value.currencyObj.amount,
          purpose: this.fg.value.purpose,
          project_id: this.fg.value.project && this.fg.value.project.project_id,
          org_user_id: advanceRequest.org_user_id,
          source: 'MOBILE',
        };
      })
    );
  }

  ionViewWillEnter() {
    this.mode = this.activatedRoute.snapshot.params.id ? 'edit' : 'add';
    const orgSettings$ = this.offlineService.getOrgSettings();
    const orgUserSettings$ = this.offlineService.getOrgUserSettings();
    this.homeCurrency$ = this.offlineService.getHomeCurrency();
    const eou$ = from(this.authService.getEou());

    const editAdvanceRequestPipe$ = this.advanceRequestService.getEReq(this.activatedRoute.snapshot.params.id).pipe(
      map(res => {
        this.fg.patchValue({
          currencyObj: {
            currency: res.areq.currency,
            amount: res.areq.amount
          },
          purpose: res.areq.purpose,
          notes: res.areq.notes,
          //project: [],
          //custom_field_values: new FormArray([]),
        })
        return res.areq;
      }),
      shareReplay()
    );

    const newAdvanceRequestPipe$ = forkJoin({
      orgSettings: orgSettings$,
      orgUserSettings: orgUserSettings$,
      homeCurrency: this.homeCurrency$,
      eou: eou$
    }).pipe(
      map(res => {
        const { orgSettings, orgUserSettings, homeCurrency, eou } = res;
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

    this.isIndividualProjectsEnabled$ = orgSettings$.pipe(
      map(orgSettings => {
        return orgSettings.advanced_projects && orgSettings.advanced_projects.enable_individual_projects;
      })
    );

    this.individualProjectIds$ = orgUserSettings$.pipe(
      map((orgUserSettings: any) => {
        return orgUserSettings.project_ids || [];
      })
    );

    this.projects$ = this.offlineService.getProjects();


    this.customFields$ = this.advanceRequestsCustomFieldsService.getAll().pipe(
      map((customFields: any[]) => {
        const customFieldsFormArray = this.fg.controls.custom_field_values as FormArray;
        customFieldsFormArray.clear();
        for (const customField of customFields) {
          customFieldsFormArray.push(
            this.formBuilder.group({
              id: customField.id,
              name: customField.name,
              value: [, customField.mandatory && Validators.required]
            })
          );
        }

        return customFields.map((customField, i) => {
          customField.control = customFieldsFormArray.at(i);

          if (customField.options) {
            // customField.options = customField.options.map(option => ({ label: option, value: option }));
            customField.options = customField.options.map(option => {
              return { label: option, value: option };
            })
          }
          return customField;
        })

        //return customFields.map((customField, i) => ({ ...customField, control: customFieldsFormArray.at(i) }));
      })
    )

    this.extendedAdvanceRequest$.subscribe(res => {
     debugger;
    })

  }

}
