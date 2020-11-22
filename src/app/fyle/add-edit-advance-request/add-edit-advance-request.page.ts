import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, from, iif, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { AdvanceRequestsCustomFieldsService } from 'src/app/core/services/advance-requests-custom-fields.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { OfflineService } from 'src/app/core/services/offline.service';

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
    private advanceRequestService: AdvanceRequestService
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
      custom_fields: new FormArray([]),
    });
  }

  goBack() {
    // Todo: Fix all cases here later
    this.router.navigate(['/', 'enterprise', 'my_advances']);
  }

  saveAdvanceRequest() {
    if (this.fg.valid) {
      debugger;
      this.generateAdvanceRequestFromFg(this.extendedAdvanceRequest$).pipe(
        switchMap(res => {
          debugger;
          return this.advanceRequestService.testPolicy(res);
        })
  
      ).subscribe(res => {
        debugger;
      })
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

  checkPolicyViolation(advanceRequest) {
    return this.advanceRequestService.testPolicy(advanceRequest);
  };

  ionViewWillEnter() {
    this.mode = this.activatedRoute.snapshot.params.id ? 'edit' : 'add';
    const orgSettings$ = this.offlineService.getOrgSettings();
    const orgUserSettings$ = this.offlineService.getOrgUserSettings();
    this.homeCurrency$ = this.offlineService.getHomeCurrency();
    const eou$ = from(this.authService.getEou());

    const editAdvanceRequestPipe$ = of({});

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


    // this.customFields$ = this.advanceRequestsCustomFieldsService.getAll().pipe(
    //   map((customFields: any[]) => {
    //     const customFieldsFormArray = this.fg.controls.custom_fields as FormArray;
    //     customFieldsFormArray.clear();
    //     for (const customField of customFields) {
    //       customFieldsFormArray.push(
    //         this.formBuilder.group({
    //           value: [, customField.mandatory && Validators.required]
    //         })
    //       );
    //     }
    //     return customFields.map((customField, i) => ({ ...customField, control: customFieldsFormArray.at(i) }));
    //   })
    // )

    // this.customFields$.subscribe(res => {
    //   debugger;
    // })

  }

}
