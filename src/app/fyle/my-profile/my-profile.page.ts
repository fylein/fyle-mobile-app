import { Component, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ModalController, PopoverController, IonicModule } from '@ionic/angular';
import { Observable, Subscription, concat, forkJoin, from, noop, finalize } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { InfoCardData } from 'src/app/core/models/info-card-data.model';
import { Org } from 'src/app/core/models/org.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { DeviceService } from 'src/app/core/services/device.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
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
import { UpdateMobileNumberComponent } from './update-mobile-number/update-mobile-number.component';
import { SpenderOnboardingService } from 'src/app/core/services/spender-onboarding.service';
import { EmployeeSettings } from 'src/app/core/models/employee-settings.model';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { CommonEmployeeSettings } from 'src/app/core/models/common-employee-settings.model';
import { driver } from 'driver.js';
import { WalkthroughService } from 'src/app/core/services/walkthrough.service';
import { FeatureConfigService } from 'src/app/core/services/platform/v1/spender/feature-config.service';
import { FyMenuIconComponent } from '../../shared/components/fy-menu-icon/fy-menu-icon.component';
import { EmployeeDetailsCardComponent } from './employee-details-card/employee-details-card.component';
import { ProfileOptInCardComponent } from '../../shared/components/profile-opt-in-card/profile-opt-in-card.component';
import { MobileNumberCardComponent } from '../../shared/components/mobile-number-card/mobile-number-card.component';
import { MatRipple } from '@angular/material/core';
import { NgClass, AsyncPipe } from '@angular/common';
import { InfoCardComponent } from './info-card/info-card.component';
import { PreferenceSettingComponent } from './preference-setting/preference-setting.component';

@Component({
    selector: 'app-my-profile',
    templateUrl: './my-profile.page.html',
    styleUrls: ['./my-profile.page.scss'],
    imports: [
        IonicModule,
        FyMenuIconComponent,
        EmployeeDetailsCardComponent,
        ProfileOptInCardComponent,
        MobileNumberCardComponent,
        MatRipple,
        NgClass,
        InfoCardComponent,
        RouterLink,
        PreferenceSettingComponent,
        AsyncPipe,
    ],
})
export class MyProfilePage {
  employeeSettings: EmployeeSettings;

  orgSettings: OrgSettings;

  eou$: Observable<ExtendedOrgUser>;

  org$: Observable<Org>;

  clusterDomain: string;

  ROUTER_API_ENDPOINT: string;

  isConnected$: Observable<boolean>;

  settingsMap: {
    [key: string]: keyof EmployeeSettings;
  } = {
    instaFyle: 'insta_fyle_settings',
    formAutofill: 'expense_form_autofills',
  };

  preferenceSettings: PreferenceSetting[] = [];

  infoCardsData: CopyCardDetails[];

  commuteDetails: CommuteDetails;

  mileageDistanceUnit: string;

  isCCCEnabled: boolean;

  isVisaRTFEnabled: boolean;

  isMastercardRTFEnabled: boolean;

  isAmexFeedEnabled: boolean;

  isVirtualCardsEnabled: boolean;

  isMileageEnabled: boolean;

  isCommuteDeductionEnabled: boolean;

  isRTFEnabled: boolean;

  defaultPaymentMode: string;

  isUserFromINCluster$: Observable<boolean>;

  onboardingPending$: Observable<{ hideOtherOptions: boolean }>;

  overlayClickCount = 0;

  constructor(
    private authService: AuthService,
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
    private orgUserService: OrgUserService,
    private spenderOnboardingService: SpenderOnboardingService,
    private platformEmployeeSettingsService: PlatformEmployeeSettingsService,
    private router: Router,
    private walkthroughService: WalkthroughService,
    private featureConfigService: FeatureConfigService
  ) {}

  emailOptInWalkthrough(): void {
    const emailOptInWalkthroughSteps = this.walkthroughService.getProfileEmailOptInWalkthroughConfig();
    const driverInstance = driver({
      overlayOpacity: 0.5,
      allowClose: true,
      overlayClickBehavior: 'close',
      showProgress: false,
      stageRadius: 6,
      stagePadding: 4,
      popoverClass: 'custom-popover',
      doneBtnText: 'Ok',
      showButtons: ['close', 'next'],
      onCloseClick: () => {
        this.walkthroughService.setIsOverlayClicked(false);
        this.setEmailHighlightFeatureConfigFlag(false);
        driverInstance.destroy();
      },
      onNextClick: () => {
        this.walkthroughService.setIsOverlayClicked(false);
        this.setEmailHighlightFeatureConfigFlag(false);
        driverInstance.destroy();
      },
      onDestroyStarted: () => {
        if (this.walkthroughService.getIsOverlayClicked()) {
          this.setEmailHighlightFeatureConfigFlag(true);
          driverInstance.destroy();
        } else {
          driverInstance.destroy();
        }
      },
    });

    try {
      driverInstance.setSteps(emailOptInWalkthroughSteps);
      driverInstance.drive();
    } catch (error) {
      this.showToastMessage('Something went wrong. Please try again later.', 'failure');
    }
  }

  setEmailHighlightFeatureConfigFlag(overlayClicked: boolean): void {
    const featureConfigParams = {
      feature: 'PROFILE_WALKTHROUGH',
      key: 'PROFILE_EMAIL_OPT_IN',
    };

    const eventTrackName =
      overlayClicked && this.overlayClickCount < 1
        ? 'Profile Email Opt In Walkthrough Skipped'
        : 'Profile Email Opt In Walkthrough Completed';

    const featureConfigValue =
      overlayClicked && this.overlayClickCount < 1
        ? {
            isShown: true,
            isFinished: false,
            overlayClickCount: this.overlayClickCount + 1,
          }
        : {
            isShown: true,
            isFinished: true,
          };

    this.trackingService.eventTrack(eventTrackName, {
      Asset: 'Mobile',
      from: 'Profile',
    });

    this.featureConfigService
      .saveConfiguration({
        ...featureConfigParams,
        value: featureConfigValue,
      })
      .subscribe(noop);
  }

  showEmailOptInWalkthrough(): void {
    const showEmailOptInWalkthroughConfig = {
      feature: 'PROFILE_WALKTHROUGH',
      key: 'PROFILE_EMAIL_OPT_IN',
    };

    this.featureConfigService
      .getConfiguration<{
        isShown?: boolean;
        isFinished?: boolean;
        overlayClickCount?: number;
      }>(showEmailOptInWalkthroughConfig)
      .subscribe((config) => {
        const featureConfigValue = config?.value || {};
        const isFinished = featureConfigValue?.isFinished || false;
        this.overlayClickCount = featureConfigValue?.overlayClickCount || 0;

        if (!isFinished) {
          // Call walkthrough after DOM is rendered
          setTimeout(() => {
            this.emailOptInWalkthrough();
          }, 100);
        }
      });
  }

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
              device_id: device.identifier,
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
    const setting = this.employeeSettings[settingName] as CommonEmployeeSettings;
    setting.enabled = eventData.isEnabled;

    this.trackingService.onSettingsToggle({
      userSetting: eventData.key,
      action: eventData.isEnabled ? 'enabled' : 'disabled',
    });

    return this.platformEmployeeSettingsService.post(this.employeeSettings).subscribe(noop);
  }

  ionViewWillEnter(): void {
    this.setupNetworkWatcher();
    this.eou$ = from(this.authService.getEou());
    this.isUserFromINCluster$ = from(this.utilityService.isUserFromINCluster());
    this.onboardingPending$ = this.spenderOnboardingService.checkForRedirectionToOnboarding().pipe(
      map((redirectionAllowed) => ({
        hideOtherOptions: redirectionAllowed,
      }))
    );
    this.reset();
    from(this.tokenService.getClusterDomain()).subscribe((clusterDomain) => {
      this.clusterDomain = clusterDomain;
    });
    this.ROUTER_API_ENDPOINT = environment.ROUTER_API_ENDPOINT;
  }

  getDefaultPaymentMode(): string {
    const paymentMode = this.orgSettings.payment_mode_settings?.payment_modes_order?.[0];
    return this.paymentModeService.getPaymentModeDisplayName(paymentMode);
  }

  reset(): void {
    // Check if we should show email opt-in walkthrough from route parameter
    const routeParams = this.activatedRoute.snapshot.params;
    if (routeParams.show_email_walkthrough === 'true') {
      this.showEmailOptInWalkthrough();
    }
    const employeeSettings$ = this.platformEmployeeSettingsService.get().pipe(shareReplay(1));
    this.org$ = this.orgService.getCurrentOrg();
    const orgSettings$ = this.orgSettingsService.get();

    this.setInfoCardsData();

    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() =>
          forkJoin({
            employeeSettings: employeeSettings$,
            orgSettings: orgSettings$,
          })
        ),
        finalize(() => from(this.loaderService.hideLoader()))
      )
      .subscribe(async (res) => {
        this.employeeSettings = res.employeeSettings;
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

    this.isVirtualCardsEnabled =
      this.isAmexFeedEnabled && this.orgSettings.amex_feed_enrollment_settings.virtual_card_settings_enabled;

    this.isRTFEnabled = this.isVisaRTFEnabled || this.isMastercardRTFEnabled || this.isAmexFeedEnabled;
  }

  setPreferenceSettings(): void {
    const allPreferenceSettings: PreferenceSetting[] = [
      {
        title: 'Extract receipt details',
        content: 'Turn paper receipts to expenses with our in-app camera.',
        key: 'instaFyle',
        isEnabled: this.employeeSettings.insta_fyle_settings.enabled,
        isAllowed: this.employeeSettings.insta_fyle_settings.allowed,
      },
      {
        title: 'Expense auto-fill',
        content: 'Auto-fill expense form fields based on most recently used values.',
        key: 'formAutofill',
        isEnabled: this.employeeSettings.expense_form_autofills?.enabled,
        isAllowed:
          this.orgSettings.org_expense_form_autofills.allowed &&
          this.orgSettings.org_expense_form_autofills.enabled &&
          this.employeeSettings.expense_form_autofills?.allowed,
      },
    ];
    this.preferenceSettings = allPreferenceSettings.filter((setting) => setting.isAllowed);
  }

  setInfoCardsData(): void {
    const fyleEmail = 'receipts@fylehq.com';

    const allInfoCardsData: InfoCardData[] = [
      {
        title: 'Email receipts',
        content: `Forward your receipts to Fyle at ${fyleEmail}.`,
        contentToCopy: fyleEmail,
        toastMessageContent: 'Email copied successfully',
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
        title: 'Verification successful',
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

  async optInMobileNumber(eou: ExtendedOrgUser): Promise<void> {
    this.trackingService.optInClickedFromProfile();

    const optInMobileNumberPopover = await this.modalController.create({
      component: FyOptInComponent,
      componentProps: {
        extendedOrgUser: eou,
      },
      mode: 'ios',
    });

    await optInMobileNumberPopover.present();
    const { data } = (await optInMobileNumberPopover.onWillDismiss()) as OverlayResponse<{ action: string }>;

    if (data) {
      if (data.action === 'SUCCESS') {
        this.eou$ = from(this.authService.refreshEou());
        this.showToastMessage('Opted in successfully', 'success');
        this.trackingService.optedInFromProfile();
      } else if (data.action === 'ERROR') {
        this.showToastMessage('Something went wrong. Please try again later.', 'failure');
      }
    }

    this.eou$ = from(this.authService.getEou());
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
              <p>Once you opt out, you can't send receipts and expense details via text message. Your mobile number will be deleted</p>
              <p>Would you like to continue?<p>  
            </div>`;
  }

  getDeleteMobileMessageBody(): string {
    return `<div>
              <p>Your mobile number will be deleted.</p>
              <p>Would you like to continue?<p>  
            </div>`;
  }

  optOut(): void {
    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => from(this.authService.getEou())),
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
        this.showToastMessage('Opted out of text messages successfully', 'success');
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
      this.optOut();
    } else {
      optOutPopover.dismiss();
    }
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
        this.trackingService.deleteMobileNumber();
        this.eou$ = from(this.authService.refreshEou());
        this.showToastMessage('Mobile number deleted successfully.', 'success');
      });
  }

  async onDeleteCTAClicked(): Promise<void> {
    const deleteMobileNumberPopover = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title: 'Delete mobile number',
        message: this.getDeleteMobileMessageBody(),
        primaryCta: {
          text: 'Yes, delete',
          action: 'continue',
        },
        secondaryCta: {
          text: 'No, go back',
          action: 'cancel',
        },
      },
      cssClass: 'pop-up-in-center',
    });

    await deleteMobileNumberPopover.present();

    const { data } = await deleteMobileNumberPopover.onWillDismiss<{ action: string }>();

    if (data && data.action === 'continue') {
      this.deleteMobileNumber();
    } else {
      deleteMobileNumberPopover.dismiss();
    }
  }

  async updateMobileNumber(eou: ExtendedOrgUser): Promise<void> {
    this.trackingService.updateMobileNumberClicked({
      popoverTitle: (eou.ou.mobile?.length ? 'Edit' : 'Add') + ' mobile number',
    });

    const updateMobileNumberPopover = await this.popoverController.create({
      component: UpdateMobileNumberComponent,
      componentProps: {
        title: (eou.ou.mobile?.length ? 'Edit' : 'Add') + ' mobile number',
        inputLabel: 'Mobile number',
        extendedOrgUser: eou,
        placeholder: 'Enter mobile number e.g. +129586736556',
      },
      cssClass: 'fy-dialog-popover',
    });

    await updateMobileNumberPopover.present();
    const { data } = (await updateMobileNumberPopover.onWillDismiss()) as OverlayResponse<{ action: string }>;

    if (data && data.action === 'SUCCESS') {
      this.eou$ = from(this.authService.refreshEou());
      this.showToastMessage('Mobile number updated successfully', 'success');
      this.trackingService.updateMobileNumber();
    }
  }
}
