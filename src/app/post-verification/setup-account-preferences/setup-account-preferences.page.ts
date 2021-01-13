import { Component, OnInit, EventEmitter } from '@angular/core';
import { NetworkService } from 'src/app/core/services/network.service';
import { Observable, concat, noop, from } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { map, shareReplay, switchMap, tap, finalize } from 'rxjs/operators';
import { OrgService } from 'src/app/core/services/org.service';
import { Org } from 'src/app/core/models/org.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { Router } from '@angular/router';
import {TrackingService} from '../../core/services/tracking.service';

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
  fg: FormGroup;

  constructor(
    private networkService: NetworkService,
    private authService: AuthService,
    private orgService: OrgService,
    private orgSettingsService: OrgSettingsService,
    private fb: FormBuilder,
    private loadingService: LoaderService,
    private orgUserService: OrgUserService,
    private router: Router,
    private trackingService: TrackingService
  ) { }

  ngOnInit() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable());
    this.isConnected$.subscribe(noop);

    this.eou$ = from(this.authService.getEou());
    this.org$ = this.orgService.getCurrentOrg().pipe(shareReplay(1));
    this.companyName$ = this.org$.pipe(
      map(org => org.name)
    );

    this.orgSettings$ = this.orgSettingsService.get();

    this.fg = this.fb.group({
      mileage: [true],
      per_diem: [false],
      ccc: [true],
      trip: [false],
      advances: [true]
    });
  }

  continueEnterprise() {
    this.orgSettings$.pipe(
      switchMap((orgSettings) => {
        orgSettings.mileage.enabled = this.fg.controls.mileage.value;
        orgSettings.per_diem.enabled = this.fg.controls.per_diem.value;
        orgSettings.corporate_credit_card_settings.enabled = this.fg.controls.ccc.value;
        orgSettings.trip_requests.enabled = this.fg.controls.trip.value;
        orgSettings.advance_requests.enabled = this.fg.controls.advances.value;

        return this.orgSettingsService.post(orgSettings).pipe(
          tap(() => {
            // setting up company details in clevertap profile
            // TODO: Add when tracking service is introduced
            // TrackingService.updateSegmentProfile({
            //   'Enable Mileage': vm.settings.mileage.enabled,
            //   'Enable Per Diem': vm.settings.per_diem.enabled,
            //   'Enable Corporate Cards': vm.settings.corporate_credit_card_settings.enabled,
            //   'Enable Advances': vm.settings.advance_requests.enabled,
            //   'Enable Trips': vm.settings.trip_requests.enabled
            // });
          })
        );
      })
    ).subscribe(() => {
      this.markActiveAndRedirect();
    });
  }

  markActiveAndRedirect() {
    from(this.loadingService.showLoader()).pipe(
      tap(() => {
        this.trackingService.setupComplete({ Asset: 'Mobile' });
      }),
      switchMap(() => {
        return this.orgUserService.markActive();
      }),
      tap(() => {
        this.trackingService.activated({ Asset: 'Mobile' });
      }),
      finalize(async () => this.loadingService.hideLoader())
    ).subscribe(() => {
      this.router.navigate(['/', 'enterprise', 'my_dashboard']);
    });
  }

}
