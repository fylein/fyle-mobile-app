import { Component, OnInit, EventEmitter } from '@angular/core';
import { NetworkService } from 'src/app/core/services/network.service';
import { Observable, concat, noop, from, forkJoin } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { map, concatMap, finalize, tap, shareReplay } from 'rxjs/operators';
import { UntypedFormBuilder, UntypedFormGroup, Validators, AbstractControl } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { SelectCurrencyComponent } from './select-currency/select-currency.component';
import { OrgService } from 'src/app/core/services/org.service';
import { Org } from 'src/app/core/models/org.model';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { Router } from '@angular/router';
import { TrackingService } from '../../core/services/tracking.service';

@Component({
  selector: 'app-setup-account',
  templateUrl: './setup-account.page.html',
  styleUrls: ['./setup-account.page.scss'],
})
export class SetupAccountPage implements OnInit {
  isConnected$: Observable<boolean>;

  eou$: Observable<ExtendedOrgUser>;

  fullname$: Observable<string>;

  fg: UntypedFormGroup;

  org$: Observable<Org>;

  hide = true;

  lengthValidationDisplay$: Observable<boolean>;

  uppercaseValidationDisplay$: Observable<boolean>;

  numberValidationDisplay$: Observable<boolean>;

  specialCharValidationDisplay$: Observable<boolean>;

  lowercaseValidationDisplay$: Observable<boolean>;

  constructor(
    private networkService: NetworkService,
    private authService: AuthService,
    private fb: UntypedFormBuilder,
    private modalController: ModalController,
    private orgService: OrgService,
    private toastController: ToastController,
    private loaderService: LoaderService,
    private orgUserService: OrgUserService,
    private orgSettingsService: OrgSettingsService,
    private router: Router,
    private trackingService: TrackingService
  ) {}

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable());
    this.isConnected$.subscribe(noop);
  }

  async openCurrenySelectionModal() {
    const modal = await this.modalController.create({
      component: SelectCurrencyComponent,
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.fg.controls.homeCurrency.setValue(data.currency.shortCode);
    }
  }

  postUser() {
    return this.eou$.pipe(
      concatMap((eou) => {
        const us = eou.us;
        us.password = this.fg.controls.password.value;
        return this.orgUserService.postUser(us);
      })
    );
  }

  postOrg() {
    return this.org$.pipe(
      concatMap((org) => {
        org.name = this.fg.controls.companyName.value;
        org.currency = this.fg.controls.homeCurrency.value;
        return this.orgService.updateOrg(org);
      })
    );
  }

  saveGuessedMileage() {
    return forkJoin({
      orgSettings: this.orgSettingsService.get(),
      org: this.org$,
    }).pipe(
      concatMap(({ orgSettings, org }) => {
        orgSettings.mileage.enabled = true;
        if (org.currency === 'USD') {
          // Googled these rates for the US
          orgSettings.mileage.unit = 'MILES';
          orgSettings.mileage.four_wheeler = 0.58;
          orgSettings.mileage.two_wheeler = 0.58;
        } else {
          orgSettings.mileage.unit = 'KM';
          orgSettings.mileage.four_wheeler = 8.0;
          orgSettings.mileage.two_wheeler = 6.0;
        }
        return this.orgSettingsService.post(orgSettings);
      })
    );
  }

  async saveData() {
    this.fg.markAllAsTouched();
    if (this.fg.valid) {
      // do valid shit
      from(this.loaderService.showLoader())
        .pipe(
          concatMap(() => forkJoin([this.postUser(), this.postOrg(), this.saveGuessedMileage()])),
          finalize(async () => await this.loaderService.hideLoader()),
          concatMap(() => this.authService.refreshEou())
        )
        .subscribe(() => {
          this.trackingService.setupHalf();
          // // setting up company details in clevertap profile
          this.trackingService.updateSegmentProfile({
            'Company Name': this.fg.controls.companyName.value,
          });

          this.router.navigate(['/', 'post_verification', 'setup_account_preferences']);
        });
    } else {
      const toast = await this.toastController.create({
        message: 'Please fill all required fields to proceed',
        color: 'danger',
        duration: 1200,
      });

      await toast.present();
    }
  }

  ngOnInit() {
    this.setupNetworkWatcher();
    this.eou$ = from(this.authService.getEou());
    this.fullname$ = this.eou$.pipe(map((eou) => eou.us.full_name));

    this.fg = this.fb.group({
      companyName: ['', Validators.required],
      homeCurrency: ['', Validators.required],
      password: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(12),
          Validators.maxLength(32),
          Validators.pattern(/[A-Z]/),
          Validators.pattern(/[a-z]/),
          Validators.pattern(/[0-9]/),
          Validators.pattern(/[!@#$%^&*()+\-:;<=>{}|~?]/),
        ]),
      ],
    });

    this.org$ = this.orgService.setCurrencyBasedOnIp().pipe(
      concatMap(() => this.orgService.getCurrentOrg()),
      shareReplay(1)
    );

    this.org$.subscribe((org) => {
      this.fg.controls.homeCurrency.setValue(org.currency);
    });

    this.lengthValidationDisplay$ = this.fg.controls.password.valueChanges.pipe(
      map((password) => password && password.length >= 12 && password.length <= 32)
    );

    this.uppercaseValidationDisplay$ = this.fg.controls.password.valueChanges.pipe(
      map((password) => /[A-Z]/.test(password))
    );

    this.numberValidationDisplay$ = this.fg.controls.password.valueChanges.pipe(
      map((password) => /[0-9]/.test(password))
    );

    this.lowercaseValidationDisplay$ = this.fg.controls.password.valueChanges.pipe(
      map((password) => /[a-z]/.test(password))
    );
    this.specialCharValidationDisplay$ = this.fg.controls.password.valueChanges.pipe(
      map((password) => /[!@#$%^&*()+\-:;<=>{}|~?]/.test(password))
    );
  }
}
