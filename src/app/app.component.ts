import { Component, OnInit, EventEmitter, NgZone, ViewChild } from '@angular/core';
import { Platform, MenuController, NavController, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { from, concat, Observable, noop } from 'rxjs';
import { switchMap, shareReplay } from 'rxjs/operators';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { DeviceService } from 'src/app/core/services/device.service';
import { AppVersionService } from './core/services/app-version.service';
import { environment } from 'src/environments/environment';
import { RouterAuthService } from './core/services/router-auth.service';
import { GlobalCacheConfig } from 'ts-cacheable';
import { NetworkService } from './core/services/network.service';
import { Plugins, StatusBarStyle } from '@capacitor/core';
import { FreshChatService } from './core/services/fresh-chat.service';
import { DeepLinkService } from './core/services/deep-link.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { PushNotificationService } from './core/services/push-notification.service';
import { TrackingService } from './core/services/tracking.service';
import { LoginInfoService } from './core/services/login-info.service';
import { PopupService } from './core/services/popup.service';
import { SidemenuComponent } from './shared/components/sidemenu/sidemenu.component';
import { ExtendedOrgUser } from './core/models/extended-org-user.model';

const { App } = Plugins;
const CapStatusBar = Plugins.StatusBar;

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

  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
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
    private splashScreen: SplashScreen,
    private screenOrientation: ScreenOrientation,
    private pushNotificationService: PushNotificationService,
    private trackingService: TrackingService,
    private loginInfoService: LoginInfoService,
    private popupService: PopupService,
    private navController: NavController,
    private modalController: ModalController
  ) {
    this.initializeApp();
    this.registerBackButtonAction();
  }

  async showAppCloseAlert() {
    const popupResults = await this.popupService.showPopup({
      header: 'Exit Fyle App',
      message: 'Are you sure you want to exit the app?',
      secondaryCta: {
        text: 'CANCEL',
      },
      primaryCta: {
        text: 'OK',
      },
      showCancelButton: false,
    });

    if (popupResults === 'primary') {
      App.exitApp();
    }
  }

  registerBackButtonAction() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      if (
        this.router.url.includes('my_dashboard') ||
        this.router.url.includes('tasks') ||
        this.router.url.includes('sign_in')
      ) {
        this.showAppCloseAlert();
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

    this.platform.backButton.subscribeWithPriority(100, () => this.modalController.dismiss());
  }

  initializeApp() {
    // eslint-disable-next-line max-len
    // Sample url - "https://fyle.app.link/branchio_redirect?redirect_uri=https%3A%2F%2Fstaging.fylehq.ninja%2Fapp%2Fmain%2F%23%2Fenterprise%2Freports%2Frpsv8oKuAfGe&org_id=orrjqbDbeP9p"
    App.addListener('appUrlOpen', (data) => {
      this.zone.run(() => {
        this.deepLinkService.redirect(this.deepLinkService.getJsonFromUrl(data.url));
      });
    });

    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      CapStatusBar.setStyle({
        style: StatusBarStyle.Dark,
      });
      this.splashScreen.hide();

      // Global cache config
      GlobalCacheConfig.maxAge = 10 * 60 * 1000;
      GlobalCacheConfig.maxCacheCount = 100;
    });
  }

  checkAppSupportedVersion() {
    this.deviceService
      .getDeviceInfo()
      .pipe(
        switchMap((deviceInfo) => {
          const data = {
            app_version: deviceInfo.appVersion,
            device_os: deviceInfo.platform,
          };

          return this.appVersionService.isSupported(data);
        })
      )
      .subscribe(async (res: { message: string; supported: boolean }) => {
        if (!res.supported && environment.production) {
          const deviceInfo = await this.deviceService.getDeviceInfo().toPromise();
          const eou = await this.authService.getEou();

          this.trackingService.eventTrack('Auto Logged out', {
            lastLoggedInVersion: await this.loginInfoService.getLastLoggedInVersion(),
            user_email: eou && eou.us && eou.us.email,
            appVersion: deviceInfo.appVersion,
          });

          this.router.navigate(['/', 'auth', 'app_version', { message: res.message }]);
        }
      });
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      shareReplay(1)
    );
  }

  ngOnInit() {
    if ((window as any) && (window as any).localStorage) {
      const lstorage = (window as any).localStorage;
      Object.keys(lstorage)
        .filter((key) => key.match(/^fyle/))
        .forEach((key) => lstorage.removeItem(key));
    }

    from(this.deviceService.getDeviceInfo()).subscribe((res) => {
      if (res.platform === 'android' || res.platform === 'ios') {
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
      }
    });

    this.checkAppSupportedVersion();
    from(this.routerAuthService.isLoggedIn()).subscribe((loggedInStatus) => {
      if (loggedInStatus) {
        this.sidemenuRef.showSideMenu();
        this.pushNotificationService.initPush();
      }
    });

    this.userEventService.onSetToken(() => {
      setTimeout(() => {
        this.sidemenuRef.showSideMenu();
      }, 500);
    });

    this.userEventService.onLogout(() => {
      this.trackingService.onSignOut();
      this.freshChatService.destory();
      this.router.navigate(['/', 'auth', 'sign_in']);
    });

    this.setupNetworkWatcher();

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
        this.menuController.swipeGesture(false);
        if (
          ev.urlAfterRedirects.indexOf('enterprise') > -1 &&
          !(ev.urlAfterRedirects.indexOf('delegated_accounts') > -1)
        ) {
          this.menuController.swipeGesture(true);
        }
      }
    });
  }

  switchDelegator(isSwitchedToDelegator: boolean) {
    this.isSwitchedToDelegator = isSwitchedToDelegator;
  }
}
