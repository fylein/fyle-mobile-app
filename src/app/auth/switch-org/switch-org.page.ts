import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, from, fromEvent, noop, Observable, of } from 'rxjs';
import { distinctUntilChanged, finalize, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
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

  userOrgsCount: number;

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
      that.userOrgsCount = orgs.length;
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

    currentOrgs$.subscribe(() => (this.isLoading = false));

    this.filteredOrgs$ = fromEvent(this.searchOrgsInput.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText) => currentOrgs$.pipe(map((orgs) => this.getOrgsWhichContainSearchText(orgs, searchText))))
    );
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
       * Case : When user is added to a SSO orgs, but he haven't verified his account through link.
       * After showing the alert, he will be redirected to sign in page since there is no other org he is part of.
       * If user have more than 1 org, user will stay on switch org page to choose another org.
       */
      this.orgs$.subscribe((orgs) => {
        if (orgs.length === 1) {
          this.signOut();
        }
      });
    }
  }

  goToSetupPassword(roles: string[]) {
    if (roles.includes('OWNER')) {
      this.router.navigate(['/', 'post_verification', 'setup_account']);
    } else {
      this.router.navigate(['/', 'post_verification', 'invited_user']);
    }
  }

  /*
   * Mark User active in the selected org and redirect him to the dashboard.
   */
  markUserActive(): Observable<OrgUserService | ExtendedOrgUser> {
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
  handleInviteLinkFlow(roles: string[]) {
    this.userService
      .getUserPasswordStatus()
      .pipe(
        switchMap((passwordStatus) => {
          if (passwordStatus.is_password_required && !passwordStatus.is_password_set) {
            this.goToSetupPassword(roles);
          } else {
            return this.markUserActive();
          }
          return of(null);
        })
      )
      .subscribe(noop);
  }

  /*
   * If user is coming from invite link, Follow invite link flow.
   * Otherwise, show user popup to verify his email.
   */
  handlePendingDetails(roles: string[], isFromInviteLink?: boolean) {
    if (isFromInviteLink) {
      this.handleInviteLinkFlow(roles);
    } else {
      this.showEmailNotVerifiedAlert();
    }
  }

  async proceed(isFromInviteLink?: boolean) {
    const offlineData$ = this.offlineService.load().pipe(shareReplay(1));
    const pendingDetails$ = this.userService.isPendingDetails().pipe(shareReplay(1));
    const eou$ = from(this.authService.getEou());
    const roles$ = from(this.authService.getRoles().pipe(shareReplay(1)));
    const isOnline$ = this.networkService.isOnline().pipe(shareReplay(1));

    forkJoin([offlineData$, pendingDetails$, eou$, roles$, isOnline$])
      .pipe(finalize(() => from(this.loaderService.hideLoader())))
      .subscribe((aggregatedResults) => {
        const [
          [
            orgSettings,
            orgUserSettings,
            allCategories,
            allEnabledCategories,
            costCenters,
            projects,
            perDiemRates,
            customInputs,
            currentOrg,
            orgs,
            accounts,
            currencies,
            homeCurrency,
          ],
          isPendingDetails,
          eou,
          roles,
          isOnline,
        ] = aggregatedResults;

        const pendingDetails = !(currentOrg.lite === true || currentOrg.lite === false) || isPendingDetails;

        if (eou) {
          Sentry.setUser({
            id: eou.us.email + ' - ' + eou.ou.id,
            email: eou.us.email,
            orgUserId: eou.ou.id,
          });
        }
        if (pendingDetails) {
          this.handlePendingDetails(roles, isFromInviteLink);
        } else if (eou.ou.status === 'ACTIVE') {
          this.router.navigate(['/', 'enterprise', 'my_dashboard']);
        } else if (eou.ou.status === 'DISABLED') {
          this.router.navigate(['/', 'auth', 'disabled']);
        }
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
    const originalEou = await this.authService.getEou();
    from(this.loaderService.showLoader())
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
}
