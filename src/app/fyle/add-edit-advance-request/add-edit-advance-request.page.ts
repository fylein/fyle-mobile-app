import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, from, iif, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
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

  constructor(
    private offlineService: OfflineService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder
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
      purpose: [],
      notes: []
    });
  }

  goBack() {
    // Todo: Fix all cases here later
    this.router.navigate(['/', 'enterprise', 'my_advances']);
  }

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

    

    // this.isProjectsEnabled$ = orgSettings$.pipe(
    //   map(orgSettings => orgSettings.projects && orgSettings.projects.enabled)
    // );

    // this.isProjectsEnabled$ = orgSettings$.pipe(
    //   map(orgSettings => {
    //     return orgSettings.projects && orgSettings.projects.enabled;
    //   })
    // );

  }

}
