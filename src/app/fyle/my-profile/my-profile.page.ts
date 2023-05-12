import { Component, EventEmitter } from '@angular/core';
import { BehaviorSubject, concat, forkJoin, from, noop, Observable } from 'rxjs';
import { concatMap, finalize, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { SecureStorageService } from 'src/app/core/services/secure-storage.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { DeviceService } from 'src/app/core/services/device.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { globalCacheBusterNotifier } from 'ts-cacheable';
import { TokenService } from 'src/app/core/services/token.service';
import { TrackingService } from '../../core/services/tracking.service';
import { environment } from 'src/environments/environment';
import { Currency } from 'src/app/core/models/currency.model';
import { Org } from 'src/app/core/models/org.model';
import { OrgUserSettings } from 'src/app/core/models/org_user_settings.model';
import { OrgService } from 'src/app/core/services/org.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { FyInputPopoverComponent } from 'src/app/shared/components/fy-input-popover/fy-input-popover.component';
import { PopoverController } from '@ionic/angular';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { VerifyNumberPopoverComponent } from './verify-number-popover/verify-number-popover.component';
import { PopupWithBulletsComponent } from 'src/app/shared/components/popup-with-bullets/popup-with-bullets.component';

type EventData = {
  key: 'instaFyle' | 'defaultCurrency' | 'formAutofill';
  isEnabled: boolean;
  selectedCurrency?: Currency;
};

type PreferenceSetting = {
  title: string;
  content: string;
  key: 'instaFyle' | 'defaultCurrency' | 'formAutofill';
  defaultCurrency?: string;
  isEnabled: boolean;
  isAllowed: boolean;
};

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.page.html',
  styleUrls: ['./my-profile.page.scss'],
})
export class MyProfilePage {
  orgUserSettings: OrgUserSettings;

  orgSettings: any;

  eou$: Observable<ExtendedOrgUser>;

  org$: Observable<Org>;

  clusterDomain: string;

  ROUTER_API_ENDPOINT: string;

  isConnected$: Observable<boolean>;

  loadEou$: BehaviorSubject<null>;

  settingsMap = {
    instaFyle: 'insta_fyle_settings',
    defaultCurrency: 'currency_settings',
    formAutofill: 'expense_form_autofills',
  };

  preferenceSettings: PreferenceSetting[];

  constructor(
    private authService: AuthService,
    private orgUserSettingsService: OrgUserSettingsService,
    private userEventService: UserEventService,
    private secureStorageService: SecureStorageService,
    private storageService: StorageService,
    private deviceService: DeviceService,
    private loaderService: LoaderService,
    private tokenService: TokenService,
    private trackingService: TrackingService,
    private orgService: OrgService,
    private networkService: NetworkService,
    private orgSettingsService: OrgSettingsService,
    private popoverController: PopoverController,
    private orgUserService: OrgUserService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService
  ) {}

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      shareReplay(1)
    );
  }

  signOut() {
    try {
      forkJoin({
        device: this.deviceService.getDeviceInfo(),
        eou: from(this.authService.getEou()),
      })
        .pipe(
          switchMap(({ device, eou }) =>
            this.authService.logout({
              device_id: device.uuid,
              user_id: eou.us.id,
            })
          ),
          finalize(() => {
            this.secureStorageService.clearAll();
            this.storageService.clearAll();
            globalCacheBusterNotifier.next();
            this.userEventService.logout();
          })
        )
        .subscribe(noop);
    } catch (e) {
      this.secureStorageService.clearAll();
      this.storageService.clearAll();
      globalCacheBusterNotifier.next();
    }
  }

  toggleSetting(eventData: EventData) {
    const settingName = this.settingsMap[eventData.key];
    this.orgUserSettings[settingName].enabled = eventData.isEnabled;

    if (eventData.key === 'defaultCurrency' && eventData.isEnabled && eventData.selectedCurrency) {
      this.orgUserSettings.currency_settings.preferred_currency = eventData.selectedCurrency.shortCode || null;
    }

    this.trackingService.onSettingsToggle({
      userSetting: eventData.key,
      action: eventData.isEnabled ? 'enabled' : 'disabled',
      setDefaultCurrency: eventData.selectedCurrency ? true : false,
    });
    return this.orgUserSettingsService.post(this.orgUserSettings).subscribe(noop);
  }

  ionViewWillEnter() {
    this.setupNetworkWatcher();
    this.loadEou$ = new BehaviorSubject(null);
    this.eou$ = this.loadEou$.pipe(switchMap(() => from(this.authService.getEou())));
    this.reset();
    from(this.tokenService.getClusterDomain()).subscribe((clusterDomain) => {
      this.clusterDomain = clusterDomain;
    });

    this.ROUTER_API_ENDPOINT = environment.ROUTER_API_ENDPOINT;
  }

  reset() {
    const orgUserSettings$ = this.orgUserSettingsService.get().pipe(shareReplay(1));
    this.org$ = this.orgService.getCurrentOrg();
    const orgSettings$ = this.orgSettingsService.get();

    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() =>
          forkJoin({
            eou: from(this.authService.getEou()),
            orgUserSettings: orgUserSettings$,
            orgSettings: orgSettings$,
          })
        ),
        finalize(() => from(this.loaderService.hideLoader()))
      )
      .subscribe(async (res) => {
        this.orgUserSettings = res.orgUserSettings;
        this.orgSettings = res.orgSettings;
        this.setPreferenceSettings();
      });
  }

  setPreferenceSettings() {
    const allPreferenceSettings: PreferenceSetting[] = [
      {
        title: 'Extract receipt details',
        content: 'Turn paper receipts to expenses with our in-app camera.',
        key: 'instaFyle',
        isEnabled: this.orgUserSettings.insta_fyle_settings.enabled,
        isAllowed: this.orgUserSettings.insta_fyle_settings.allowed,
      },
      {
        title: 'Expense auto-fill',
        content: 'Auto-fill expense form fields based on most recently used values.',
        key: 'formAutofill',
        isEnabled: this.orgUserSettings.expense_form_autofills.enabled,
        isAllowed:
          this.orgSettings.org_expense_form_autofills.allowed &&
          this.orgSettings.org_expense_form_autofills.enabled &&
          this.orgUserSettings.expense_form_autofills.allowed,
      },
      {
        title: 'Default Currency',
        content: 'Select the default currency to be used for creating expenses.',
        key: 'defaultCurrency',
        defaultCurrency: this.orgUserSettings.currency_settings.preferred_currency,
        isEnabled: this.orgUserSettings.currency_settings.enabled,
        isAllowed: this.orgSettings.org_currency_settings.enabled,
      },
    ];
    this.preferenceSettings = allPreferenceSettings.filter((setting) => setting.isAllowed);
  }

  async updateMobileNumber(eou: ExtendedOrgUser) {
    const updateMobileNumberPopover = await this.popoverController.create({
      component: FyInputPopoverComponent,
      componentProps: {
        title: (eou.ou.mobile?.length ? 'Edit' : 'Add') + ' Mobile Number',
        ctaText: 'Next',
        inputLabel: 'Mobile Number',
        inputValue: eou.ou.mobile,
        inputType: 'tel',
        isRequired: true,
      },
      cssClass: 'fy-dialog-popover',
    });

    await updateMobileNumberPopover.present();
    const { data } = await updateMobileNumberPopover.onWillDismiss();

    if (data) {
      const updatedOrgUserDetails = {
        ...eou.ou,
        mobile: data.newValue,
      };
      this.orgUserService
        .postOrgUser(updatedOrgUserDetails)
        .pipe(
          concatMap(() => this.authService.refreshEou()),
          tap(() => this.loadEou$.next(null)),
          switchMap(() =>
            this.eou$.pipe(
              take(1),
              map((eou) => from(this.verifyMobileNumber(eou)))
            )
          )
        )
        .subscribe({
          error: () => this.showToastMessage('Something went wrong. Please try again later.', 'failure'),
        });
    }
  }

  async verifyMobileNumber(eou: ExtendedOrgUser) {
    const verifyNumberPopoverComponent = await this.popoverController.create({
      component: VerifyNumberPopoverComponent,
      componentProps: {
        extendedOrgUser: eou,
      },
      cssClass: 'fy-dialog-popover',
    });

    await verifyNumberPopoverComponent.present();
    const { data } = await verifyNumberPopoverComponent.onWillDismiss();

    if (data) {
      if (data.action === 'BACK') {
        this.updateMobileNumber(eou);
      } else if (data.action === 'SUCCESS') {
        this.showSuccessPopover();
      }
    }
  }

  async showSuccessPopover() {
    const fyleMobileNumber = '(302) 440-2921';
    const listItems = [
      {
        icon: 'message',
        text: `Message your receipts to Fyle at ${fyleMobileNumber} and we will create an expense for you.`,
        textToCopy: fyleMobileNumber,
      },
      {
        icon: 'fy-reimbursable',
        text: 'Standard messaging rates applicable',
      },
    ];
    const verifyNumberPopoverComponent = await this.popoverController.create({
      component: PopupWithBulletsComponent,
      componentProps: {
        title: 'Verification Successful',
        listHeader: 'Now you can:',
        listItems,
        ctaText: 'Got it',
      },
      cssClass: 'pop-up-in-center',
    });

    await verifyNumberPopoverComponent.present();
    await verifyNumberPopoverComponent.onWillDismiss();
  }

  showToastMessage(message: string, type: 'success' | 'failure') {
    const panelClass = type === 'success' ? 'msb-success' : 'msb-failure';
    this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties(type, { message }),
      panelClass,
    });
    this.trackingService.showToastMessage({ ToastContent: message });
  }
}
