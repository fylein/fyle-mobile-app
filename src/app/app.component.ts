import { Component, OnInit, EventEmitter, NgZone, ViewChild } from '@angular/core';
import { Platform, MenuController, NavController } from '@ionic/angular';
import { from, concat, Observable, noop, forkJoin } from 'rxjs';
import { switchMap, shareReplay, filter, take, map } from 'rxjs/operators';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { DeviceService } from 'src/app/core/services/device.service';
import { AppVersionService } from './core/services/app-version.service';
import { RouterAuthService } from './core/services/router-auth.service';
import { NetworkService } from './core/services/network.service';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { FreshChatService } from './core/services/fresh-chat.service';
import { DeepLinkService } from './core/services/deep-link.service';
import { TrackingService } from './core/services/tracking.service';
import { LoginInfoService } from './core/services/login-info.service';
import { SidemenuComponent } from './shared/components/sidemenu/sidemenu.component';
import { ExtendedOrgUser } from './core/models/extended-org-user.model';
import { PerfTrackers } from './core/models/perf-trackers.enum';
import { ExtendedDeviceInfo } from './core/models/extended-device-info.model';
import { BackButtonActionPriority } from './core/models/back-button-action-priority.enum';
import { BackButtonService } from './core/services/back-button.service';
import { TextZoom } from '@capacitor/text-zoom';
import { GmapsService } from './core/services/gmaps.service';
import { SpenderOnboardingService } from './core/services/spender-onboarding.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('sidemenuRef') sidemenuRef: SidemenuComponent;

  eou$: Observable<ExtendedOrgUser>;

  appVersion: string;

  isConnected$: Observable<boolean>;

  eou: ExtendedOrgUser;

  device;

  previousUrl: string;

  isSwitchedToDelegator: boolean;

  isUserLoggedIn = false;

  isOnline: boolean;

  constructor(
    private platform: Platform,
    private router: Router,
    private authService: AuthService,
    private userEventService: UserEventService,
    private menuController: MenuController,
    private deviceService: DeviceService,
    private appVersionService: AppVersionService,
    private routerAuthService: RouterAuthService,
    private networkService: NetworkService,
    private freshChatService: FreshChatService,
    private zone: NgZone,
    private deepLinkService: DeepLinkService,
    private trackingService: TrackingService,
    private loginInfoService: LoginInfoService,
    private navController: NavController,
    private backButtonService: BackButtonService,
    private gmapsService: GmapsService,
    private spenderOnboardingService: SpenderOnboardingService
  ) {
    this.initializeApp();
    this.registerBackButtonAction();
  }

  registerBackButtonAction(): void {
    this.platform.backButton.subscribeWithPriority(BackButtonActionPriority.LOW, () => {
      if (this.router.url.includes('sign_in')) {
        this.backButtonService.showAppCloseAlert();
      } else if (this.router.url.includes('switch_org') || this.router.url.includes('delegated_accounts')) {
        if (this.previousUrl && this.previousUrl.includes('enterprise')) {
          this.navController.back();
        } else {
          this.router.navigate(['/', 'enterprise', 'my_dashboard']);
        }
      } else {
        this.navController.back();
      }
    });
  }

  initializeApp(): void {
    // eslint-disable-next-line max-len
    // Sample url - "https://fyle.app.link/branchio_redirect?redirect_uri=https%3A%2F%2Fstaging.fylehq.ninja%2Fapp%2Fmain%2F%23%2Fenterprise%2Freports%2Frpsv8oKuAfGe&org_id=orrjqbDbeP9p"

    App.addListener('appUrlOpen', (data) => {
      this.zone.run(() => {
        this.deepLinkService.redirect(this.deepLinkService.getJsonFromUrl(data.url));
      });
    });

    this.platform.ready().then(async () => {
      await StatusBar.setStyle({
        style: Style.Default,
      });

      setTimeout(async () => await SplashScreen.hide(), 200);

      /*
       * Use the app's font size irrespective of the user's device font size.
       * This is to ensure that the app's UI is consistent across devices.
       * Ref: https://www.npmjs.com/package/@capacitor/text-zoom
       */
      await TextZoom.set({ value: 1 });

      from(this.routerAuthService.isLoggedIn())
        .pipe(
          filter((isLoggedIn) => !!isLoggedIn),
          switchMap(() => this.deviceService.getDeviceInfo()),
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
    });
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      shareReplay(1)
    );
  }

  setSidenavPostOnboarding(): void {
    this.spenderOnboardingService
      .setOnboardingStatusAsComplete()
      .pipe(
        switchMap(() => this.isConnected$.pipe(take(1))),
        map((isOnline) => {
          if (isOnline) {
            this.sidemenuRef.showSideMenuOnline();
          } else {
            this.sidemenuRef.showSideMenuOffline();
          }
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.setupNetworkWatcher();

    // This was done as a security fix for appknox
    // eslint-disable-next-line
    if ((window as any) && (window as any).localStorage) {
      // eslint-disable-next-line
      const lstorage = (window as any).localStorage as { removeItem: (key: string) => void };
      // eslint-disable-next-line
      Object.keys(lstorage)
        .filter((key) => key.match(/^fyle/))
        .forEach((key) => lstorage.removeItem(key));
    }

    this.isConnected$.subscribe((isOnline) => {
      this.isOnline = isOnline;
    });

    forkJoin({
      loggedInStatus: this.routerAuthService.isLoggedIn(),
      isOnline: this.isConnected$.pipe(take(1)),
    }).subscribe(({ loggedInStatus, isOnline }) => {
      this.isUserLoggedIn = loggedInStatus;
      if (loggedInStatus) {
        if (isOnline) {
          this.sidemenuRef.showSideMenuOnline();
        } else {
          this.sidemenuRef.showSideMenuOffline();
        }
      }

      const markOptions: PerformanceMarkOptions = {
        detail: this.isUserLoggedIn,
      };
      performance.mark(PerfTrackers.appLaunchStartTime, markOptions);
    });

    this.userEventService.onSetToken(() => {
      setTimeout(() => {
        if (this.isOnline) {
          this.sidemenuRef.showSideMenuOnline();
        } else {
          this.sidemenuRef.showSideMenuOffline();
        }
      }, 500);
    });

    this.setSidenavPostOnboarding();

    this.userEventService.onLogout(() => {
      this.trackingService.onSignOut();
      this.freshChatService.destroy();
      this.isSwitchedToDelegator = false;
      this.router.navigate(['/', 'auth', 'sign_in']);
    });

    this.router.events.subscribe((ev) => {
      // adding try catch because this may fail due to network issues
      // noop is no op - basically an empty function
      try {
        this.trackingService.updateIdentityIfNotPresent().then(noop).catch(noop);
      } catch (error) {}

      if (ev instanceof NavigationStart) {
        this.previousUrl = this.router.url;
      }
      if (ev instanceof NavigationEnd) {
        if (
          ev.urlAfterRedirects.indexOf('enterprise') > -1 &&
          !(ev.urlAfterRedirects.indexOf('delegated_accounts') > -1)
        ) {
          setTimeout(() => this.menuController.swipeGesture(true), 500);
        } else {
          setTimeout(() => this.menuController.swipeGesture(false), 500);
        }
      }
    });

    this.gmapsService.loadLibrary();
  }

  switchDelegator(isSwitchedToDelegator: boolean): void {
    this.isSwitchedToDelegator = isSwitchedToDelegator;
  }
}
