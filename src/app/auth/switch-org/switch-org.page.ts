import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, from, fromEvent, noop, Observable, of, catchError, throwError } from 'rxjs';
import { distinctUntilChanged, filter, finalize, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { Platform, PopoverController } from '@ionic/angular';
import { Org } from 'src/app/core/models/org.model';
import { LoaderService } from 'src/app/core/services/loader.service';
import { UserService } from 'src/app/core/services/user.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { SecureStorageService } from 'src/app/core/services/secure-storage.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { OrgService } from 'src/app/core/services/org.service';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { globalCacheBusterNotifier } from 'ts-cacheable';
import * as Sentry from '@sentry/angular';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { DeviceService } from 'src/app/core/services/device.service';
import { PerfTrackers } from 'src/app/core/models/perf-trackers.enum';
import { AppVersionService } from 'src/app/core/services/app-version.service';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { ExtendedDeviceInfo } from 'src/app/core/models/extended-device-info.model';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ResendEmailVerification } from 'src/app/core/models/resend-email-verification.model';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { DeepLinkService } from 'src/app/core/services/deep-link.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { SpenderOnboardingService } from 'src/app/core/services/spender-onboarding.service';

@Component({
  selector: 'app-switch-org',
  templateUrl: './switch-org.page.html',
  styleUrls: ['./switch-org.page.scss'],
})
export class SwitchOrgPage implements OnInit, AfterViewChecked {
  @ViewChild('search') searchRef: ElementRef<HTMLElement>;

  @ViewChild('content') contentRef: ElementRef<HTMLElement>;

  @ViewChild('searchOrgsInput') searchOrgsInput: ElementRef<HTMLInputElement>;

  orgs$: Observable<Org[]>;

  filteredOrgs$: Observable<Org[]>;

  searchInput = '';

  isLoading = false;

  activeOrg$: Observable<Org>;

  primaryOrg$: Observable<Org>;

  navigateBack = false;

  isIos = false;

  orgs: Org[];

  constructor(
    private platform: Platform,
    private loaderService: LoaderService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private secureStorageService: SecureStorageService,
    private storageService: StorageService,
    private router: Router,
    private orgService: OrgService,
    private userEventService: UserEventService,
    private recentLocalStorageItemsService: RecentLocalStorageItemsService,
    private cdRef: ChangeDetectorRef,
    private trackingService: TrackingService,
    private deviceService: DeviceService,
    private popoverController: PopoverController,
    private orgUserService: OrgUserService,
    private appVersionService: AppVersionService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private routerAuthService: RouterAuthService,
    private transactionService: TransactionService,
    private deepLinkService: DeepLinkService,
    private expensesService: ExpensesService,
    private launchDarklyService: LaunchDarklyService,
    private orgSettingsService: OrgSettingsService,
    private spenderOnboardingService: SpenderOnboardingService
  ) {}

  ngOnInit(): void {
    this.isIos = this.platform.is('ios');
  }

  ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
  }

  ionViewWillEnter(): void {
    const that = this;
    that.searchInput = '';
    that.isLoading = true;
    that.orgs$ = that.orgService.getOrgs().pipe(shareReplay(1));
    this.navigateBack = !!this.activatedRoute.snapshot.params.navigate_back;

    that.orgs$.subscribe((orgs) => {
      this.orgs = orgs;
      that.cdRef.detectChanges();
    });

    const choose =
      that.activatedRoute.snapshot.params.choose &&
      (JSON.parse(that.activatedRoute.snapshot.params.choose as string) as boolean);
    const isFromInviteLink: boolean =
      that.activatedRoute.snapshot.params.invite_link &&
      (JSON.parse(that.activatedRoute.snapshot.params.invite_link as string) as boolean);
    const orgId = that.activatedRoute.snapshot.params.orgId as string;
    const txnId = this.activatedRoute.snapshot.params.txnId as string;
    const openSMSOptInDialog = this.activatedRoute.snapshot.params.openSMSOptInDialog as string;

    if (orgId && txnId) {
      return this.redirectToExpensePage(orgId, txnId);
    } else if (openSMSOptInDialog === 'true' && orgId) {
      return this.redirectToDashboard(orgId);
    } else if (!choose) {
      from(that.loaderService.showLoader())
        .pipe(switchMap(() => from(that.proceed(isFromInviteLink))))
        .subscribe(noop);
    } else {
      that.orgs$.subscribe((orgs) => {
        if (orgs.length === 1) {
          from(that.loaderService.showLoader())
            .pipe(switchMap(() => from(that.proceed(isFromInviteLink))))
            .subscribe(noop);
        }
      });
    }

    this.activeOrg$ = this.orgService.getCurrentOrg();
    this.primaryOrg$ = this.orgService.getPrimaryOrg();

    const currentOrgs$ = forkJoin([this.orgs$, this.primaryOrg$, this.activeOrg$]).pipe(
      map(([orgs, primaryOrg, activeOrg]) => {
        const currentOrgs = [primaryOrg, ...orgs.filter((org) => org.id !== primaryOrg.id)];
        if (this.navigateBack) {
          return currentOrgs.filter((org) => org.id !== activeOrg.id);
        }
        return currentOrgs;
      }),
      shareReplay(1)
    );

    currentOrgs$.subscribe(() => {
      this.isLoading = false;
      this.trackSwitchOrgLaunchTime();
    });

    // eslint-disable-next-line
    this.filteredOrgs$ = fromEvent<{ srcElement: { value: string } }>(this.searchOrgsInput.nativeElement, 'keyup').pipe(
      map((event) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText) => currentOrgs$.pipe(map((orgs) => this.getOrgsWhichContainSearchText(orgs, searchText))))
    );
  }

  setSentryUser(eou: ExtendedOrgUser): void {
    if (eou) {
      Sentry.setUser({
        id: eou.ou.id,
        orgUserId: eou.ou.id,
        orgId: eou.ou.org_id,
        userId: eou.ou.user_id,
      });
    }
  }

  resendInvite(email: string, orgId: string): Observable<ResendEmailVerification> {
    return this.routerAuthService.resendVerificationLink(email, orgId);
  }

  showToastNotification(msg: string): void {
    const toastMessageData = {
      message: msg,
    };

    this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties('success', toastMessageData),
      panelClass: ['msb-info'],
    });
    this.trackingService.showToastMessage({ ToastContent: toastMessageData.message });
  }

  redirectToDashboard(orgId: string): void {
    from(this.loaderService.showLoader('Please wait...', 2000))
      .pipe(
        switchMap(() => this.orgService.switchOrg(orgId)),
        switchMap(() => {
          globalCacheBusterNotifier.next();
          this.userEventService.clearTaskCache();
          this.recentLocalStorageItemsService.clearRecentLocalStorageCache();
          return from(this.authService.getEou());
        }),
        map((eou) => {
          this.setSentryUser(eou);
        }),
        finalize(() => this.loaderService.hideLoader())
      )
      .subscribe({
        next: () => {
          this.navigateToDashboard(true);
        },
        error: () => this.router.navigate(['/', 'auth', 'switch_org']),
      });
  }

  redirectToExpensePage(orgId: string, txnId: string): void {
    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => this.orgService.switchOrg(orgId)),
        switchMap(() => {
          globalCacheBusterNotifier.next();
          this.userEventService.clearTaskCache();
          this.recentLocalStorageItemsService.clearRecentLocalStorageCache();
          return from(this.authService.getEou());
        }),
        switchMap((eou) => {
          this.setSentryUser(eou);
          return this.expensesService.getExpenseById(txnId);
        }),
        map((expense) => this.transactionService.transformExpense(expense)),
        finalize(() => this.loaderService.hideLoader())
      )
      .subscribe({
        next: (etxn) => {
          const route = this.deepLinkService.getExpenseRoute(etxn);
          this.router.navigate([...route, { id: txnId }]);
        },
        error: () => this.router.navigate(['/', 'auth', 'switch_org']),
      });
  }

  logoutIfSingleOrg(orgs: Org[]): void {
    /*
     * Case: When a user is added to an SSO org but hasn't verified their account through the link.
     * After showing the alert, the user will be redirected to the sign-in page since there is no other org they are a part of.
     * If the user has more than 1 org, the user will stay on the switch org page to choose another org.
     */
    if (orgs?.length === 1) {
      this.signOut();
    }
  }

  handleDismissPopup(action = 'cancel', email: string, orgId: string, orgs: Org[]): void {
    if (action === 'resend') {
      // If user clicks on resend Button, Resend Invite to the user and then logout if user have only one org.
      this.resendInvite(email, orgId)
        .pipe(
          catchError((error: Error) => {
            this.showToastNotification('Verification link could not be sent. Please try again!');
            return throwError(() => error);
          })
        )
        .subscribe(() => {
          this.showToastNotification('Verification email sent');
          this.logoutIfSingleOrg(orgs);
        });
    } else {
      this.logoutIfSingleOrg(orgs);
    }
  }

  async showEmailNotVerifiedAlert(): Promise<void> {
    const eou$ = from(this.authService.getEou());
    forkJoin({
      eou: eou$,
      orgs: this.orgs$,
    }).subscribe(async ({ eou, orgs }) => {
      const orgName = eou.ou.org_name;
      const orgId = eou.ou.org_id;
      const email = eou.us.email;
      const popover = await this.popoverController.create({
        componentProps: {
          title: 'Invite not accepted',
          message: `You have been invited to ${orgName} organization, please check your previous emails and accept the invite or resend invite.`,
          primaryCta: {
            text: 'Resend invite',
            action: 'resend',
          },
          secondaryCta: {
            text: 'Cancel',
            action: 'close',
          },
        },
        component: PopupAlertComponent,
        cssClass: 'pop-up-in-center',
        backdropDismiss: false,
      });
      await popover.present();

      const { data } = await popover.onWillDismiss<{ action: string }>();

      this.handleDismissPopup(data?.action, email, orgId, orgs);
    });
  }

  navigateToSetupPage(roles: string[]): void {
    if (roles.includes('OWNER')) {
      this.router.navigate(['/', 'post_verification', 'setup_account']);
    } else {
      this.router.navigate(['/', 'post_verification', 'invited_user']);
    }
  }

  navigateToDashboard(openOptInDialog?: boolean): void {
    this.spenderOnboardingService
      .checkForRedirectionToOnboarding()
      .pipe(
        map((shouldProceedToOnboarding) => {
          if (shouldProceedToOnboarding) {
            this.router.navigate(['/', 'enterprise', 'spender_onboarding']);
          } else {
            this.router.navigate([
              '/',
              'enterprise',
              'my_dashboard',
              {
                openSMSOptInDialog: openOptInDialog,
              },
            ]);
          }
        })
      )
      .subscribe();
  }

  // Mark the user active in the selected org and redirect them to the dashboard.
  markUserActive(): Observable<ExtendedOrgUser> {
    return from(this.loaderService.showLoader()).pipe(
      switchMap(() => this.orgUserService.markActive()),
      finalize(() => {
        this.loaderService.hideLoader();
        this.navigateToDashboard();
      })
    );
  }

  /*
   * Check if user is part of a SSO org or is a part of multiple Non SSO orgs.
   * If yes, Mark user active directly.
   * If no, Redirect user to setup password page.
   */
  handleInviteLinkFlow(roles: string[], isPasswordSetRequired?: boolean): Observable<ExtendedOrgUser> {
    if (isPasswordSetRequired) {
      this.navigateToSetupPage(roles);
    } else {
      return this.markUserActive();
    }
    return of(null);
  }

  /*
   * If the user is coming from the invite link, Follow the invite link flow.
   * Otherwise, show the user a popup to verify their email.
   */
  handlePendingDetails(
    roles: string[],
    isFromInviteLink?: boolean,
    isPasswordSetRequired?: boolean
  ): Observable<ExtendedOrgUser> {
    if (isFromInviteLink) {
      return this.handleInviteLinkFlow(roles, isPasswordSetRequired);
    } else {
      this.showEmailNotVerifiedAlert();
    }
    return of(null);
  }

  navigateBasedOnUserStatus(config: {
    isPendingDetails: boolean;
    roles: string[];
    eou: ExtendedOrgUser;
    isFromInviteLink?: boolean;
  }): Observable<ExtendedOrgUser> {
    /**
     * User status is marked as active during invite flow even though the user has not set password.
     * Hence the API `getUserPasswordStatus` is mandatory
     */
    return this.userService.getUserPasswordStatus().pipe(
      switchMap((passwordStatus) => {
        const isPasswordSetRequired = passwordStatus.is_password_required && !passwordStatus.is_password_set;
        if (isPasswordSetRequired || (!isPasswordSetRequired && config.isPendingDetails)) {
          return this.handlePendingDetails(config.roles, config.isFromInviteLink, isPasswordSetRequired);
        } else if (config.eou.ou.status === 'ACTIVE') {
          this.navigateToDashboard();
        } else if (config.eou.ou.status === 'DISABLED') {
          this.router.navigate(['/', 'auth', 'disabled']);
        }
        return of(null);
      })
    );
  }

  async proceed(isFromInviteLink?: boolean): Promise<void> {
    const pendingDetails$ = this.userService.isPendingDetails().pipe(shareReplay(1));
    const eou$ = from(this.authService.getEou());
    const roles$ = from(this.authService.getRoles().pipe(shareReplay(1)));

    forkJoin([pendingDetails$, eou$, roles$])
      .pipe(
        switchMap(([isPendingDetails, eou, roles]) => {
          this.setSentryUser(eou);
          return this.navigateBasedOnUserStatus({ isPendingDetails, roles, eou, isFromInviteLink });
        }),
        finalize(() => this.loaderService.hideLoader())
      )
      .subscribe();

    this.checkUserAppVersion();
    this.setupLD();
  }

  setupLD(): void {
    forkJoin({
      currentOrg: this.orgService.getCurrentOrg(),
      deviceInfo: this.deviceService.getDeviceInfo(),
      eou: this.orgUserService.getCurrent(),
    }).subscribe(({ currentOrg, deviceInfo, eou }) => {
      this.launchDarklyService.initializeUser({
        key: eou.ou.user_id,
        custom: {
          org_id: eou.ou.org_id,
          org_user_id: eou.ou.id,
          org_currency: currentOrg?.currency,
          org_created_at: currentOrg?.created_at?.toString(),
          asset: `MOBILE - ${deviceInfo?.platform.toUpperCase()}`,
        },
      });
    });
  }

  checkUserAppVersion(): void {
    this.deviceService
      .getDeviceInfo()
      .pipe(
        filter((deviceInfo: ExtendedDeviceInfo) => ['android', 'ios'].includes(deviceInfo.platform.toLowerCase())),
        switchMap((deviceInfo) => {
          this.appVersionService.load(deviceInfo);
          return this.appVersionService.getUserAppVersionDetails(deviceInfo);
        }),
        filter((userAppVersionDetails) => !!userAppVersionDetails)
      )
      .subscribe((userAppVersionDetails) => {
        const { appSupportDetails, lastLoggedInVersion, deviceInfo } = userAppVersionDetails;
        this.trackingService.eventTrack('Auto Logged out', {
          lastLoggedInVersion,
          appVersion: deviceInfo.appVersion,
        });
        this.router.navigate(['/', 'auth', 'app_version', { message: appSupportDetails.message }]);
      });
  }

  trackSwitchOrg(org: Org, originalEou: ExtendedOrgUser): void {
    const isDestinationOrgActive = originalEou.ou && originalEou.ou.org_id === org.id;
    const isCurrentOrgPrimary = originalEou.ou && originalEou.ou.is_primary;
    from(this.authService.getEou()).subscribe((currentEou) => {
      const properties = {
        Asset: 'Mobile',
        'Switch To': org.id,
        'Is Destination Org Active': isDestinationOrgActive,
        'Is Destination Org Primary': currentEou && currentEou.ou && currentEou.ou.is_primary,
        'Is Current Org Primary': isCurrentOrgPrimary,
        Source: 'User Clicked',
        'User Org ID': originalEou.ou && originalEou.ou.org_id,
      };
      this.trackingService.onSwitchOrg(properties);
    });
  }

  async switchOrg(org: Org): Promise<void> {
    // Tracking the time on click of switch org
    performance.mark(PerfTrackers.onClickSwitchOrg);
    const originalEou = await this.authService.getEou();
    from(this.loaderService.showLoader('Please wait...', 2000))
      .pipe(switchMap(() => this.orgService.switchOrg(org.id)))
      .subscribe(
        () => {
          globalCacheBusterNotifier.next();
          if (originalEou) {
            this.trackSwitchOrg(org, originalEou);
          }
          this.userEventService.clearTaskCache();
          this.recentLocalStorageItemsService.clearRecentLocalStorageCache();
          from(this.proceed()).subscribe(noop);
        },
        async () => {
          await this.secureStorageService.clearAll();
          await this.storageService.clearAll();
          this.userEventService.logout();
          globalCacheBusterNotifier.next();
          await this.loaderService.hideLoader();
        }
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

  getOrgsWhichContainSearchText(orgs: Org[], searchText: string): Org[] {
    return orgs
      .filter((org) =>
        Object.values(org)
          .map((value: string | Date | number | boolean) => value && value.toString().toLowerCase())
          .filter((value) => !!value)
          .some((value) => value.toLowerCase().includes(searchText.toLowerCase()))
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  resetSearch(): void {
    this.searchInput = '';
    const searchInputElement = this.searchOrgsInput.nativeElement;
    searchInputElement.value = '';
    searchInputElement.dispatchEvent(new Event('keyup'));
  }

  openSearchBar(): void {
    this.contentRef.nativeElement.classList.add('switch-org__content-container__content-block--hide');
    this.searchRef.nativeElement.classList.add('switch-org__content-container__search-block--show');
    setTimeout(() => this.searchOrgsInput.nativeElement.focus(), 200);
  }

  cancelSearch(): void {
    this.resetSearch();
    this.searchOrgsInput.nativeElement.blur();
    this.contentRef.nativeElement.classList.remove('switch-org__content-container__content-block--hide');
    this.searchRef.nativeElement.classList.remove('switch-org__content-container__search-block--show');
  }

  trackSwitchOrgLaunchTime(): void {
    try {
      if (performance.getEntriesByName('switch org launch time').length === 0) {
        // Time taken to land on switch org page after sign-in
        performance.mark('switch org launch time');

        // Measure total time taken from logging into the app to landing on switch org page
        performance.measure('switch org launch time', 'login start time');

        const measureLaunchTime = performance.getEntriesByName('switch org launch time');

        // eslint-disable-next-line
        const loginMethod = performance.getEntriesByName('login start time')[0]['detail'];

        // Converting the duration to seconds and fix it to 3 decimal places
        const launchTimeDuration = (measureLaunchTime[0]?.duration / 1000)?.toFixed(3);

        this.trackingService.switchOrgLaunchTime({
          'Switch org launch time': launchTimeDuration,
          // eslint-disable-next-line
          'Login method': loginMethod,
        });
      }
    } catch (_) {}
  }
}
