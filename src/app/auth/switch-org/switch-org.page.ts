import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, from, fromEvent, noop, Observable, of } from 'rxjs';
import { distinctUntilChanged, finalize, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
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
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { RemoveOfflineFormsService } from 'src/app/core/services/remove-offline-forms.service';
import { PerfTrackers } from 'src/app/core/models/perf-trackers.enum';

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
    private removeOfflineFormsService: RemoveOfflineFormsService
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

    that.orgs$.subscribe(() => {
      that.cdRef.detectChanges();
    });

    const choose = that.activatedRoute.snapshot.params.choose && JSON.parse(that.activatedRoute.snapshot.params.choose);

    if (!choose) {
      from(that.loaderService.showLoader())
        .pipe(switchMap(() => from(that.proceed())))
        .subscribe(noop);
    } else {
      that.orgs$.subscribe((orgs) => {
        if (orgs.length === 1) {
          from(that.loaderService.showLoader())
            .pipe(switchMap(() => from(that.proceed())))
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

  navigateBasedOnUserStatus(isPendingDetails: boolean, roles: string[], eou: ExtendedOrgUser) {
    if (isPendingDetails) {
      if (roles.indexOf('OWNER') > -1) {
        this.router.navigate(['/', 'post_verification', 'setup_account']);
      } else {
        this.router.navigate(['/', 'post_verification', 'invited_user']);
      }
    } else if (eou.ou.status === 'ACTIVE') {
      this.router.navigate(['/', 'enterprise', 'my_dashboard']);
    } else if (eou.ou.status === 'DISABLED') {
      this.router.navigate(['/', 'auth', 'disabled']);
    }
  }

  async proceed() {
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
        offlineData$ = this.offlineService.loadOptimized().pipe(shareReplay(1));
      } else {
        offlineData$ = this.offlineService.load().pipe(shareReplay(1));
      }

      forkJoin([offlineData$, pendingDetails$, eou$, roles$, isOnline$, deviceInfo$])
        .pipe(finalize(() => from(this.loaderService.hideLoader())))
        .subscribe(([loadedOfflineData, isPendingDetails, eou, roles, isOnline, deviceInfo]) => {
          this.setSentryUser(eou);
          this.navigateBasedOnUserStatus(isPendingDetails, roles, eou);
        });
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
      if (performance.getEntriesByName(PerfTrackers.switchOrgLaunchTime).length === 0) {
        // Time taken to land on switch org page after sign-in
        performance.mark(PerfTrackers.switchOrgLaunchTime);

        // Measure total time taken from logging into the app to landing on switch org page
        performance.measure(PerfTrackers.switchOrgLaunchTime, PerfTrackers.loginStartTime);

        const measureLaunchTime = performance.getEntriesByName(PerfTrackers.switchOrgLaunchTime);

        // eslint-disable-next-line @typescript-eslint/dot-notation
        const loginMethod = performance.getEntriesByName(PerfTrackers.loginStartTime)[0]['detail'];

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
