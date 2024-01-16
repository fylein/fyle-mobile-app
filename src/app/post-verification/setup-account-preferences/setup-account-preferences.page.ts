import { Component, OnInit, EventEmitter } from '@angular/core';
import { NetworkService } from 'src/app/core/services/network.service';
import { Observable, concat, noop, from } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { map, shareReplay, switchMap, tap, finalize } from 'rxjs/operators';
import { OrgService } from 'src/app/core/services/org.service';
import { Org } from 'src/app/core/models/org.model';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { Router } from '@angular/router';
import { TrackingService } from '../../core/services/tracking.service';

@Component({
  selector: 'app-setup-account-preferences',
  templateUrl: './setup-account-preferences.page.html',
  styleUrls: ['./setup-account-preferences.page.scss'],
})
export class SetupAccountPreferencesPage implements OnInit {
  isConnected$: Observable<boolean>;

  eou$: Observable<ExtendedOrgUser>;

  companyName$: Observable<string>;

  org$: Observable<Org>;

  orgSettings$: Observable<any>;

  fg: UntypedFormGroup;

  constructor(
    private networkService: NetworkService,
    private authService: AuthService,
    private orgService: OrgService,
    private orgSettingsService: OrgSettingsService,
    private fb: UntypedFormBuilder,
    private loadingService: LoaderService,
    private orgUserService: OrgUserService,
    private router: Router,
    private trackingService: TrackingService
  ) {}

  ngOnInit() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable());
    this.isConnected$.subscribe(noop);

    this.eou$ = from(this.authService.getEou());
    this.org$ = this.orgService.getCurrentOrg().pipe(shareReplay(1));
    this.companyName$ = this.org$.pipe(map((org) => org.name));

    this.orgSettings$ = this.orgSettingsService.get();

    this.fg = this.fb.group({
      mileage: [true],
      per_diem: [false],
      ccc: [true],
      advances: [true],
    });
  }

  continueEnterprise() {
    this.orgSettings$
      .pipe(
        switchMap((orgSettings) => {
          orgSettings.mileage.enabled = this.fg.controls.mileage.value;
          orgSettings.per_diem.enabled = this.fg.controls.per_diem.value;
          orgSettings.corporate_credit_card_settings.enabled = this.fg.controls.ccc.value;
          orgSettings.advance_requests.enabled = this.fg.controls.advances.value;

          return this.orgSettingsService.post(orgSettings).pipe(
            tap(() => {
              // setting up company details in clevertap profile

              this.trackingService.updateSegmentProfile({
                'Enable Mileage': this.fg.controls.mileage.value,
                'Enable Per Diem': this.fg.controls.per_diem.value,
                'Enable Corporate Cards': this.fg.controls.ccc.value,
                'Enable Advances': this.fg.controls.advances.value,
              });
            })
          );
        })
      )
      .subscribe(() => {
        this.markActiveAndRedirect();
      });
  }

  markActiveAndRedirect() {
    from(this.loadingService.showLoader())
      .pipe(
        tap(() => {
          this.trackingService.setupComplete();
        }),
        switchMap(() => this.orgUserService.markActive()),
        tap(() => {
          this.trackingService.activated();
        }),
        finalize(async () => this.loadingService.hideLoader())
      )
      .subscribe(() => {
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
      });
  }
}
