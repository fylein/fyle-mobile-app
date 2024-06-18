import { Component, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { ModalController, PopoverController } from '@ionic/angular';
import { BehaviorSubject, Observable, Subscription, concat, forkJoin, from, noop } from 'rxjs';
import { finalize, shareReplay, switchMap, take } from 'rxjs/operators';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { InfoCardData } from 'src/app/core/models/info-card-data.model';
import { Org } from 'src/app/core/models/org.model';
import { CommonOrgUserSettings, OrgUserSettings } from 'src/app/core/models/org_user_settings.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { DeviceService } from 'src/app/core/services/device.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { OrgService } from 'src/app/core/services/org.service';
import { SecureStorageService } from 'src/app/core/services/secure-storage.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { TokenService } from 'src/app/core/services/token.service';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { PopupWithBulletsComponent } from 'src/app/shared/components/popup-with-bullets/popup-with-bullets.component';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { environment } from 'src/environments/environment';
import { globalCacheBusterNotifier } from 'ts-cacheable';
import { TrackingService } from '../../core/services/tracking.service';
import { VerifyNumberPopoverComponent } from './verify-number-popover/verify-number-popover.component';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { OverlayResponse } from 'src/app/core/models/overlay-response.modal';
import { EventData } from 'src/app/core/models/event-data.model';
import { PreferenceSetting } from 'src/app/core/models/preference-setting.model';
import { CopyCardDetails } from 'src/app/core/models/copy-card-details.model';
import { SpenderService } from 'src/app/core/services/platform/v1/spender/spender.service';
import { CommuteDetails } from 'src/app/core/models/platform/v1/commute-details.model';
import { FySelectCommuteDetailsComponent } from 'src/app/shared/components/fy-select-commute-details/fy-select-commute-details.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { ToastType } from 'src/app/core/enums/toast-type.enum';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';
import { CommuteDetailsResponse } from 'src/app/core/models/platform/commute-details-response.model';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { FyOptInComponent } from 'src/app/shared/components/fy-opt-in/fy-opt-in.component';
import { UtilityService } from 'src/app/core/services/utility.service';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { OrgUser } from 'src/app/core/models/org-user.model';
import { OrgUserService } from 'src/app/core/services/org-user.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.page.html',
  styleUrls: ['./my-profile.page.scss'],
})
export class MyProfilePage {
  orgUserSettings: OrgUserSettings;

  orgSettings: OrgSettings;

  eou$: Observable<ExtendedOrgUser>;

  org$: Observable<Org>;

  clusterDomain: string;

  ROUTER_API_ENDPOINT: string;

  isConnected$: Observable<boolean>;

  loadEou$: BehaviorSubject<null>;

  settingsMap: {
    [key: string]: keyof OrgUserSettings;
  } = {
    instaFyle: 'insta_fyle_settings',
    defaultCurrency: 'currency_settings',
    formAutofill: 'expense_form_autofills',
  };

  preferenceSettings: PreferenceSetting[];

  infoCardsData: CopyCardDetails[];

  commuteDetails: CommuteDetails;

  mileageDistanceUnit: string;

  isCCCEnabled: boolean;

  isVisaRTFEnabled: boolean;

  isMastercardRTFEnabled: boolean;

  isAmexFeedEnabled: boolean;

  isMileageEnabled: boolean;

  isCommuteDeductionEnabled: boolean;

  isRTFEnabled: boolean;

  defaultPaymentMode: string;

  isUserFromINCluster$: Observable<boolean>;

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
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private spenderService: SpenderService,
    private activatedRoute: ActivatedRoute,
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private employeesService: EmployeesService,
    private paymentModeService: PaymentModesService,
    private utilityService: UtilityService,
    private orgUserService: OrgUserService
  ) {}

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      shareReplay(1)
    );
  }

  signOut(): void {
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

  toggleSetting(eventData: EventData): Subscription {
    const settingName = this.settingsMap[eventData.key];
    const setting = this.orgUserSettings[settingName] as CommonOrgUserSettings;
    setting.enabled = eventData.isEnabled;

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

  ionViewWillEnter(): void {
    this.setupNetworkWatcher();
    this.loadEou$ = new BehaviorSubject<null>(null);
    this.eou$ = this.loadEou$.pipe(switchMap(() => from(this.authService.getEou())));
    this.isUserFromINCluster$ = from(this.utilityService.isUserFromINCluster());
    console.log('trigger');

    this.reset();
    from(this.tokenService.getClusterDomain()).subscribe((clusterDomain) => {
      this.clusterDomain = clusterDomain;
    });
    this.ROUTER_API_ENDPOINT = environment.ROUTER_API_ENDPOINT;

    const popover = this.activatedRoute.snapshot.params.openPopover as string;
    if (popover) {
      this.eou$.pipe(take(1)).subscribe((eou) => {
        if (popover === 'add_mobile_number') {
          this.updateMobileNumber(eou);
        } else if (popover === 'verify_mobile_number') {
          this.verifyMobileNumber(eou);
        }
      });
    }
  }

  getDefaultPaymentMode(): string {
    const paymentMode = this.orgSettings.payment_mode_settings?.payment_modes_order?.[0];
    return this.paymentModeService.getPaymentModeDisplayName(paymentMode);
  }

  reset(): void {
    const orgUserSettings$ = this.orgUserSettingsService.get().pipe(shareReplay(1));
    this.org$ = this.orgService.getCurrentOrg();
    const orgSettings$ = this.orgSettingsService.get();

    this.setInfoCardsData();

    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() =>
          forkJoin({
            orgUserSettings: orgUserSettings$,
            orgSettings: orgSettings$,
          })
        ),
        finalize(() => from(this.loaderService.hideLoader()))
      )
      .subscribe(async (res) => {
        this.orgUserSettings = res.orgUserSettings;
        this.orgSettings = res.orgSettings;

        this.isMileageEnabled = this.orgSettings.mileage?.allowed && this.orgSettings.mileage.enabled;
        this.isCommuteDeductionEnabled =
          this.orgSettings.commute_deduction_settings?.allowed && this.orgSettings.commute_deduction_settings?.enabled;

        this.mileageDistanceUnit = this.orgSettings.mileage?.unit;

        this.defaultPaymentMode = this.getDefaultPaymentMode();

        if (this.isMileageEnabled && this.isCommuteDeductionEnabled) {
          this.setCommuteDetails();
        }

        this.setCCCFlags();
        this.setPreferenceSettings();
      });
  }

  setCommuteDetails(): void {
    from(this.authService.getEou())
      .pipe(switchMap((eou) => this.employeesService.getCommuteDetails(eou)))
      .subscribe((res) => {
        this.commuteDetails = res.data[0].commute_details;
        this.mileageDistanceUnit = this.commuteDetails.distance_unit === 'MILES' ? 'Miles' : 'KM';
      });
  }

  setCCCFlags(): void {
    this.isCCCEnabled =
      this.orgSettings.corporate_credit_card_settings.allowed &&
      this.orgSettings.corporate_credit_card_settings.enabled;

    this.isVisaRTFEnabled =
      this.orgSettings.visa_enrollment_settings.allowed && this.orgSettings.visa_enrollment_settings.enabled;

    this.isMastercardRTFEnabled =
      this.orgSettings.mastercard_enrollment_settings.allowed &&
      this.orgSettings.mastercard_enrollment_settings.enabled;

    this.isAmexFeedEnabled =
      this.orgSettings.amex_feed_enrollment_settings.allowed && this.orgSettings.amex_feed_enrollment_settings.enabled;

    this.isRTFEnabled = this.isVisaRTFEnabled || this.isMastercardRTFEnabled || this.isAmexFeedEnabled;
  }

  setPreferenceSettings(): void {
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

  setInfoCardsData(): void {
    const fyleEmail = 'receipts@fylehq.com';

    const allInfoCardsData: InfoCardData[] = [
      {
        title: 'Email Receipts',
        content: `Forward your receipts to Fyle at ${fyleEmail}.`,
        contentToCopy: fyleEmail,
        toastMessageContent: 'Email Copied Successfully',
        isShown: true,
      },
    ];

    this.infoCardsData = allInfoCardsData.filter((infoCardData) => infoCardData.isShown);
  }

  showToastMessage(message: string, type: 'success' | 'failure'): void {
    const panelClass = type === 'success' ? 'msb-success' : 'msb-failure';
    let snackbarIcon: string;
    if (message.toLowerCase().includes('copied')) {
      snackbarIcon = 'check-circle-outline';
    }
    this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties(type, { message }, snackbarIcon),
      panelClass,
    });
    this.trackingService.showToastMessage({ ToastContent: message });
  }

  async showSuccessPopover(): Promise<void> {
    const fyleMobileNumber = '(302) 440-2921';
    const listItems = [
      {
        icon: 'envelope',
        text: `Message your receipts to Fyle at ${fyleMobileNumber} and we will create an expense for you.`,
        textToCopy: fyleMobileNumber,
      },
      {
        icon: 'cash',
        text: 'Standard messaging rates applicable',
      },
    ];
    const verificationSuccessfulPopover = await this.popoverController.create({
      component: PopupWithBulletsComponent,
      componentProps: {
        title: 'Verification Successful',
        listHeader: 'Now you can:',
        listItems,
        ctaText: 'Got it',
      },
      cssClass: 'pop-up-in-center',
    });

    await verificationSuccessfulPopover.present();
    await verificationSuccessfulPopover.onWillDismiss();

    this.trackingService.mobileNumberVerified({
      isRtfEnabled: this.isRTFEnabled,
      defaultPaymentMode: this.defaultPaymentMode,
    });
  }

  async verifyMobileNumber(eou: ExtendedOrgUser): Promise<void> {
    const verifyNumberPopoverComponent = await this.popoverController.create({
      component: VerifyNumberPopoverComponent,
      componentProps: {
        extendedOrgUser: eou,
      },
      cssClass: 'fy-dialog-popover',
    });

    await verifyNumberPopoverComponent.present();
    const { data } = (await verifyNumberPopoverComponent.onWillDismiss()) as OverlayResponse<{
      action: string;
      homeCurrency: string;
    }>;

    if (data) {
      if (data.action === 'BACK') {
        this.updateMobileNumber(eou);
      } else if (data.action === 'SUCCESS') {
        if (data.homeCurrency === 'USD') {
          this.showSuccessPopover();
        } else {
          this.showToastMessage('Mobile Number Verified Successfully', 'success');
        }
      }
    }
    //This is needed to refresh the attempts_at and disable verify cta everytime user opens the dialog
    this.authService.refreshEou().subscribe(() => this.loadEou$.next(null));
    this.trackingService.verifyMobileNumber();
  }

  onVerifyCtaClicked(eou: ExtendedOrgUser): void {
    if (eou.ou.mobile_verification_attempts_left !== 0) {
      this.verifyMobileNumber(eou);
    } else {
      this.showToastMessage('You have reached the limit to request OTP. Retry after 24 hours.', 'failure');
    }
  }

  async updateMobileNumber(eou: ExtendedOrgUser): Promise<void> {
    const updateMobileNumberPopover = await this.modalController.create({
      component: FyOptInComponent,
      componentProps: {
        extendedOrgUser: eou,
      },
      mode: 'ios',
    });

    await updateMobileNumberPopover.present();
    const { data } = (await updateMobileNumberPopover.onWillDismiss()) as OverlayResponse<{ action: string }>;

    if (data) {
      if (data.action === 'SUCCESS') {
        this.eou$ = from(this.authService.refreshEou());
      } else if (data.action === 'ERROR') {
        this.showToastMessage('Something went wrong. Please try again later.', 'failure');
      }
    }

    this.trackingService.updateMobileNumber({
      popoverTitle: (eou.ou.mobile?.length ? 'Edit' : 'Add') + ' Mobile Number',
      isRtfEnabled: this.isRTFEnabled,
      defaultPaymentMode: this.defaultPaymentMode,
    });
  }

  async openCommuteDetailsModal(): Promise<void> {
    const isEditingCommuteDetails = this.commuteDetails?.id ? true : false;

    if (isEditingCommuteDetails) {
      this.trackingService.commuteDeductionEditLocationClickFromProfile();
    } else {
      this.trackingService.commuteDeductionAddLocationClickFromProfile();
    }

    const commuteDetailsModal = await this.modalController.create({
      component: FySelectCommuteDetailsComponent,
      componentProps: {
        existingCommuteDetails: this.commuteDetails,
      },
      mode: 'ios',
    });

    await commuteDetailsModal.present();

    const { data } = (await commuteDetailsModal.onWillDismiss()) as OverlayResponse<{
      action: string;
      commuteDetails: CommuteDetailsResponse;
    }>;

    // If the user edited or saved the commute details, refresh the page and show the toast message
    if (data.action === 'save') {
      if (isEditingCommuteDetails) {
        this.trackingService.commuteDeductionDetailsEdited(data.commuteDetails);
      } else {
        this.trackingService.commuteDeductionDetailsAddedFromProfile(data.commuteDetails);
      }
      this.reset();
      this.showToastMessage('Commute details updated successfully', ToastType.SUCCESS);
    }
  }

  getOptOutMessageBody(): string {
    return `<div>
              <p>You can't send receipts and expense details via text message if you opt out</p>
              <p>Are you sure you want to continue?<p>  
            </div>`;
  }

  deleteMobileNumber(): void {
    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => this.authService.getEou()),
        switchMap((eou) => {
          const updatedOrgUserDetails: OrgUser = {
            ...eou.ou,
            mobile: '',
          };

          return this.orgUserService.postOrgUser(updatedOrgUserDetails);
        }),
        finalize(() => from(this.loaderService.hideLoader()))
      )
      .subscribe(() => {
        this.trackingService.optedOut();
        this.eou$ = from(this.authService.refreshEou());
      });
  }

  async optOutClick(): Promise<void> {
    const optOutPopover = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title: 'Opt out of text messages',
        message: this.getOptOutMessageBody(),
        primaryCta: {
          text: 'Yes, opt out',
          action: 'continue',
        },
        secondaryCta: {
          text: 'No, go back',
          action: 'cancel',
        },
      },
      cssClass: 'pop-up-in-center',
    });

    await optOutPopover.present();

    const { data } = await optOutPopover.onWillDismiss<{ action: string }>();

    if (data && data.action === 'continue') {
      this.deleteMobileNumber();
    } else {
      optOutPopover.dismiss();
    }
  }
}
