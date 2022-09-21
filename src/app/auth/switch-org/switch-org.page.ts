import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, from, fromEvent, noop, Observable, of } from 'rxjs';
import { distinctUntilChanged, finalize, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { Platform, PopoverController } from '@ionic/angular';
import { Org } from 'src/app/core/models/org.model';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { UserService } from 'src/app/core/services/user.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { SecureStorageService } from 'src/app/core/services/secure-storage.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgService } from 'src/app/core/services/org.service';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { globalCacheBusterNotifier } from 'ts-cacheable';
import * as Sentry from '@sentry/angular';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { DeviceService } from 'src/app/core/services/device.service';
import { RemoveOfflineFormsService } from 'src/app/core/services/remove-offline-forms.service';
import { PerfTrackers } from 'src/app/core/models/perf-trackers.enum';
import { PopupAlertComponentComponent } from 'src/app/shared/components/popup-alert-component/popup-alert-component.component';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';

@Component({
  selector: 'app-switch-org',
  templateUrl: './switch-org.page.html',
  styleUrls: ['./switch-org.page.scss'],
})
export class SwitchOrgPage implements OnInit, AfterViewChecked {
  @ViewChild('search') searchRef: ElementRef;

  @ViewChild('content') contentRef: ElementRef;

  @ViewChild('searchOrgsInput') searchOrgsInput: ElementRef;

  orgs$: Observable<Org[]>;

  filteredOrgs$: Observable<Org[]>;

  searchInput = '';

  isLoading = false;

  activeOrg$: Observable<Org>;

  primaryOrg$: Observable<Org>;

  navigateBack = false;

  isIos = false;

  isOfflineFormsRemoved = false;

  constructor(
    private platform: Platform,
    private offlineService: OfflineService,
    private loaderService: LoaderService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private secureStorageService: SecureStorageService,
    private storageService: StorageService,
    private router: Router,
    private networkService: NetworkService,
    private orgService: OrgService,
    private userEventService: UserEventService,
    private recentLocalStorageItemsService: RecentLocalStorageItemsService,
    private cdRef: ChangeDetectorRef,
    private trackingService: TrackingService,
    private deviceService: DeviceService,
    private removeOfflineFormsService: RemoveOfflineFormsService,
    private popoverController: PopoverController,
    private orgUserService: OrgUserService
  ) {}

  ngOnInit() {
    this.isIos = this.platform.is('ios');
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ionViewWillEnter() {
    const that = this;
    that.searchInput = '';
    that.isLoading = true;
    that.orgs$ = that.offlineService.getOrgs().pipe(shareReplay(1));
    this.navigateBack = !!this.activatedRoute.snapshot.params.navigate_back;

    that.orgs$.subscribe((orgs) => {
      that.cdRef.detectChanges();
    });

    const choose = that.activatedRoute.snapshot.params.choose && JSON.parse(that.activatedRoute.snapshot.params.choose);
    const isFromInviteLink: boolean =
      that.activatedRoute.snapshot.params.invite_link && JSON.parse(that.activatedRoute.snapshot.params.invite_link);

    if (!choose) {
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
    this.activeOrg$ = this.offlineService.getCurrentOrg();
    this.primaryOrg$ = this.offlineService.getPrimaryOrg();

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

    this.filteredOrgs$ = fromEvent(this.searchOrgsInput.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText) => currentOrgs$.pipe(map((orgs) => this.getOrgsWhichContainSearchText(orgs, searchText))))
    );
  }

  setSentryUser(eou: ExtendedOrgUser) {
    if (eou) {
      Sentry.setUser({
        id: eou.us.email + ' - ' + eou.ou.id,
        email: eou.us.email,
        orgUserId: eou.ou.id,
      });
    }
  }

  async showEmailNotVerifiedAlert() {
    const popover = await this.popoverController.create({
      componentProps: {
        title: 'Email Not Verified',
        message: 'Your email is not verified. Please check your previous emails and accept the invite.',
        primaryCta: {
          text: 'OK',
          action: 'close',
        },
      },
      component: PopupAlertComponentComponent,
      cssClass: 'pop-up-in-center',
    });
    await popover.present();

    const { data } = await popover.onWillDismiss();

    if (data?.action === 'close') {
      /*
       * Case: When a user is added to an SSO org but hasn't verified their account through the link.
       * After showing the alert, the user will be redirected to the sign-in page since there is no other org they are a part of.
       * If the user has more than 1 org, the user will stay on the switch org page to choose another org.
       */
      this.orgs$.subscribe((orgs) => {
        if (orgs.length === 1) {
          this.signOut();
        }
      });
    }
  }

  navigateToSetupPage(roles: string[]) {
    if (roles.includes('OWNER')) {
      this.router.navigate(['/', 'post_verification', 'setup_account']);
    } else {
      this.router.navigate(['/', 'post_verification', 'invited_user']);
    }
  }

  // Mark the user active in the selected org and redirect them to the dashboard.
  markUserActive(): Observable<ExtendedOrgUser> {
    return from(this.loaderService.showLoader()).pipe(
      switchMap(() => this.orgUserService.markActive()),
      finalize(() => {
        this.loaderService.hideLoader();
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
      })
    );
  }

  /*
   * Check if user is part of a SSO org or is a part of multiple Non SSO orgs.
   * If yes, Mark user active directly.
   * If no, Redirect user to setup password page.
   */
  handleInviteLinkFlow(roles: string[]): Observable<ExtendedOrgUser> {
    return this.userService.getUserPasswordStatus().pipe(
      switchMap((passwordStatus) => {
        if (passwordStatus.is_password_required && !passwordStatus.is_password_set) {
          this.navigateToSetupPage(roles);
        } else {
          return this.markUserActive();
        }
        return of(null);
      })
    );
  }

  /*
   * If the user is coming from the invite link, Follow the invite link flow.
   * Otherwise, show the user a popup to verify their email.
   */
  handlePendingDetails(roles: string[], isFromInviteLink?: boolean): Observable<ExtendedOrgUser> {
    if (isFromInviteLink) {
      return this.handleInviteLinkFlow(roles);
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
    if (config.isPendingDetails) {
      return this.handlePendingDetails(config.roles, config?.isFromInviteLink);
    } else if (config.eou.ou.status === 'ACTIVE') {
      this.router.navigate(['/', 'enterprise', 'my_dashboard']);
    } else if (config.eou.ou.status === 'DISABLED') {
      this.router.navigate(['/', 'auth', 'disabled']);
    }
    return of(null);
  }

  async proceed(isFromInviteLink?: boolean) {
    const pendingDetails$ = this.userService.isPendingDetails().pipe(shareReplay(1));
    const eou$ = from(this.authService.getEou());
    const currentOrg$ = this.offlineService.getCurrentOrg().pipe(shareReplay(1));
    const roles$ = from(this.authService.getRoles().pipe(shareReplay(1)));
    const isOnline$ = this.networkService.isOnline().pipe(shareReplay(1));
    const deviceInfo$ = this.deviceService.getDeviceInfo().pipe(shareReplay(1));
    this.removeOfflineFormsService.getRemoveOfflineFormsLDKey().subscribe((isOfflineModeDisabled: boolean) => {
      this.isOfflineFormsRemoved = isOfflineModeDisabled;

      this.storageService.set('isOfflineFormsRemoved', isOfflineModeDisabled);

      let offlineData$: Observable<any[]>;

      if (this.isOfflineFormsRemoved) {
        offlineData$ = of(null);
      } else {
        offlineData$ = this.offlineService.load().pipe(shareReplay(1));
      }

      forkJoin([offlineData$, pendingDetails$, eou$, roles$, isOnline$, deviceInfo$])
        .pipe(
          switchMap(([loadedOfflineData, isPendingDetails, eou, roles, isOnline, deviceInfo]) => {
            this.setSentryUser(eou);
            return this.navigateBasedOnUserStatus({ isPendingDetails, roles, eou, isFromInviteLink });
          }),
          finalize(() => from(this.loaderService.hideLoader()))
        )
        .subscribe();
    });
  }

  trackSwitchOrg(org: Org, originalEou) {
    const isDestinationOrgActive = originalEou.ou && originalEou.ou.org_id === org.id;
    const isCurrentOrgPrimary = originalEou.ou && originalEou.ou.is_primary;
    from(this.authService.getEou()).subscribe((currentEou) => {
      const properties = {
        Asset: 'Mobile',
        'Switch To': org.name,
        'Is Destination Org Active': isDestinationOrgActive,
        'Is Destination Org Primary': currentEou && currentEou.ou && currentEou.ou.is_primary,
        'Is Current Org Primary': isCurrentOrgPrimary,
        Source: 'User Clicked',
        'User Email': originalEou.us && originalEou.us.email,
        'User Org Name': originalEou.ou && originalEou.ou.org_name,
        'User Org ID': originalEou.ou && originalEou.ou.org_id,
        'User Full Name': originalEou.us && originalEou.us.full_name,
      };
      this.trackingService.onSwitchOrg(properties);
    });
  }

  async switchOrg(org: Org) {
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
        async (err) => {
          await this.secureStorageService.clearAll();
          await this.storageService.clearAll();
          this.userEventService.logout();
          globalCacheBusterNotifier.next();
          await this.loaderService.hideLoader();
        }
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

  getOrgsWhichContainSearchText(orgs: Org[], searchText: string) {
    return orgs.filter((org) =>
      Object.values(org)
        .map((value) => value && value.toString().toLowerCase())
        .filter((value) => !!value)
        .some((value) => value.toLowerCase().includes(searchText.toLowerCase()))
    );
  }

  resetSearch() {
    this.searchInput = '';
    const searchInputElement = this.searchOrgsInput.nativeElement as HTMLInputElement;
    searchInputElement.value = '';
    searchInputElement.dispatchEvent(new Event('keyup'));
  }

  openSearchBar() {
    this.contentRef.nativeElement.classList.add('switch-org__content-container__content-block--hide');
    this.searchRef.nativeElement.classList.add('switch-org__content-container__search-block--show');
    setTimeout(() => this.searchOrgsInput.nativeElement.focus(), 200);
  }

  cancelSearch() {
    this.resetSearch();
    this.searchOrgsInput.nativeElement.blur();
    this.contentRef.nativeElement.classList.remove('switch-org__content-container__content-block--hide');
    this.searchRef.nativeElement.classList.remove('switch-org__content-container__search-block--show');
  }

  private trackSwitchOrgLaunchTime() {
    try {
      if (performance.getEntriesByName('switch org launch time').length === 0) {
        // Time taken to land on switch org page after sign-in
        performance.mark('switch org launch time');

        // Measure total time taken from logging into the app to landing on switch org page
        performance.measure('switch org launch time', 'login start time');

        const measureLaunchTime = performance.getEntriesByName('switch org launch time');

        // eslint-disable-next-line @typescript-eslint/dot-notation
        const loginMethod = performance.getEntriesByName('login start time')[0]['detail'];

        // Converting the duration to seconds and fix it to 3 decimal places
        const launchTimeDuration = (measureLaunchTime[0]?.duration / 1000)?.toFixed(3);

        this.trackingService.switchOrgLaunchTime({
          'Switch org launch time': launchTimeDuration,
          'Login method': loginMethod,
        });
      }
    } catch (error) {}
  }
}
