import { Component, OnInit, EventEmitter, NgZone } from '@angular/core';
import { Platform, MenuController, AlertController, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { forkJoin, from, iif, of, concat, Observable, noop } from 'rxjs';
import { map, switchMap, shareReplay } from 'rxjs/operators';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { PermissionsService } from 'src/app/core/services/permissions.service';
import { DeviceService } from 'src/app/core/services/device.service';
import { AppVersionService } from './core/services/app-version.service';
import { environment } from 'src/environments/environment';
import { RouterAuthService } from './core/services/router-auth.service';
import { GlobalCacheConfig, globalCacheBusterNotifier } from 'ts-cacheable';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { NetworkService } from './core/services/network.service';
import { Plugins, StatusBarStyle } from '@capacitor/core';
import { FreshChatService } from './core/services/fresh-chat.service';
import { DeepLinkService } from './core/services/deep-link.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import * as Sentry from '@sentry/angular';
import { PushNotificationService } from './core/services/push-notification.service';
import { TrackingService } from './core/services/tracking.service';
import { LoginInfoService } from './core/services/login-info.service';
import { PopupService } from './core/services/popup.service';
import { OrgUserSettings } from './core/models/org_user_settings.model';

const { App } = Plugins;
const CapStatusBar = Plugins.StatusBar;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  eou$: Observable<any>;

  activeOrg: any;

  sideMenuList: any[];

  sideMenuSecondaryList: any[];

  appVersion: string;

  isSwitchedToDelegator;

  isConnected$: Observable<boolean>;

  allowedActions$: Observable<any>;

  eou;

  device;

  dividerTitle: string;

  previousUrl: string;

  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private router: Router,
    private authService: AuthService,
    private offlineService: OfflineService,
    private orgUserService: OrgUserService,
    private userEventService: UserEventService,
    private permissionsService: PermissionsService,
    private menuController: MenuController,
    private deviceService: DeviceService,
    private appVersionService: AppVersionService,
    private routerAuthService: RouterAuthService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private networkService: NetworkService,
    private alertController: AlertController,
    private freshChatService: FreshChatService,
    private zone: NgZone,
    private deepLinkService: DeepLinkService,
    private splashScreen: SplashScreen,
    private screenOrientation: ScreenOrientation,
    private pushNotificationService: PushNotificationService,
    private trackingService: TrackingService,
    private loginInfoService: LoginInfoService,
    private popupService: PopupService,
    private navController: NavController
  ) {
    this.initializeApp();
    this.registerBackButtonAction();
    this.matIconRegistry.addSvgIcon(
      'add-advance',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../../assets/svg/add-advance')
    );
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

  openHelp() {
    this.menuController.close(); // Closing menu button before opening FreshDesk chat
    this.freshChatService.openLiveChatSupport();
  }

  redirect(route) {
    this.menuController.close();
    if (route.indexOf('switch_org') > -1) {
      this.userEventService.clearCache();
      globalCacheBusterNotifier.next();
    }
    this.router.navigate(route);
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

  async showSideMenu() {
    const isLoggedIn = await this.routerAuthService.isLoggedIn();
    if (!isLoggedIn) {
      return 0;
    }
    const orgs$ = this.offlineService.getOrgs();
    const currentOrg$ = this.offlineService.getCurrentOrg();
    const orgSettings$ = this.offlineService.getOrgSettings().pipe(shareReplay(1));
    const orgUserSettings$ = this.offlineService.getOrgUserSettings();
    const delegatedAccounts$ = this.offlineService
      .getDelegatedAccounts()
      .pipe(map((res) => this.orgUserService.excludeByStatus(res, 'DISABLED')));
    const deviceInfo$ = this.deviceService.getDeviceInfo();
    const isSwitchedToDelegator$ = from(this.orgUserService.isSwitchedToDelegator());

    this.allowedActions$ = orgSettings$.pipe(
      switchMap((orgSettings) => {
        const allowedReportsActions$ = this.offlineService.getReportActions(orgSettings);
        const allowedAdvancesActions$ = this.permissionsService.allowedActions(
          'advances',
          ['approve', 'create', 'delete'],
          orgSettings
        );
        const allowedTripsActions$ = this.permissionsService.allowedActions(
          'trips',
          ['approve', 'create', 'edit', 'cancel'],
          orgSettings
        );

        return forkJoin({
          allowedReportsActions: allowedReportsActions$,
          allowedAdvancesActions: iif(
            () => orgSettings.advance_requests.enabled || orgSettings.advances.enabled,
            allowedAdvancesActions$,
            of(null)
          ),
          allowedTripsActions: iif(() => orgSettings.trip_requests.enabled, allowedTripsActions$, of(null)),
        });
      })
    );

    this.isConnected$
      .pipe(
        switchMap((isConnected) =>
          forkJoin({
            orgs: orgs$,
            currentOrg: currentOrg$,
            orgSettings: orgSettings$,
            orgUserSettings: orgUserSettings$,
            delegatedAccounts: delegatedAccounts$,
            allowedActions: this.allowedActions$,
            deviceInfo: deviceInfo$,
            isSwitchedToDelegator: isSwitchedToDelegator$,
            isConnected: of(isConnected),
            eou: this.offlineService.getCurrentUser(),
          })
        )
      )
      .subscribe((res) => {
        const orgs = res.orgs;
        this.activeOrg = res.currentOrg;
        const orgSettings = res.orgSettings;
        const orgUserSettings = res.orgUserSettings;
        const isDelegatee = res.delegatedAccounts.length > 0;
        this.appVersion = (res.deviceInfo && res.deviceInfo.appVersion) || '1.2.3';
        const allowedReportsActions = res.allowedActions && res.allowedActions.allowedReportsActions;
        const allowedAdvancesActions = res.allowedActions && res.allowedActions.allowedAdvancesActions;
        const allowedTripsActions = res.allowedActions && res.allowedActions.allowedTripsActions;
        this.isSwitchedToDelegator = res.isSwitchedToDelegator;
        const isConnected = res.isConnected;
        this.eou = res.eou;

        if (res.eou) {
          Sentry.setUser({
            id: res.eou.us.email + ' - ' + res.eou.ou.id,
            email: res.eou.us.email,
            orgUserId: res.eou.ou.id,
          });
        }

        this.freshChatService.setupNetworkWatcher();

        // TODO: remove nested subscribe - mini tech debt
        this.setupSideMenu(
          isConnected,
          orgSettings,
          orgUserSettings,
          allowedReportsActions,
          allowedTripsActions,
          allowedAdvancesActions,
          orgs,
          isDelegatee
        );

        /* These below conditions have been added to place the divider in the sidenav:-
        - if 'Advances' is enabled, the divider will be placed under 'Advances',
        - else if 'Trips' is enabled, the divider will be placed under 'Trips',
        - else it will be placed under 'Reports'
      */
        this.setDividerTitle(orgSettings, orgUserSettings);
      });
  }

  // TODO: Reduce number of params being passed
  // eslint-disable-next-line max-params
  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  setupSideMenu(
    isConnected: boolean,
    orgSettings: any,
    orgUserSettings: OrgUserSettings,
    allowedReportsActions: any,
    allowedTripsActions: any,
    allowedAdvancesActions: any,
    orgs,
    isDelegatee: boolean
  ) {
    if (isConnected) {
      this.setSideMenuOnline(
        orgSettings,
        orgUserSettings,
        allowedReportsActions,
        allowedTripsActions,
        allowedAdvancesActions,
        orgs,
        isDelegatee
      );
    } else {
      this.setSideMenuOffline(
        orgSettings,
        orgUserSettings,
        allowedReportsActions,
        allowedTripsActions,
        allowedAdvancesActions,
        orgs,
        isDelegatee
      );
    }
  }

  // TODO: Breakdown to make this easier to
  // eslint-disable-next-line
  setSideMenuOffline(
    orgSettings: any,
    orgUserSettings: OrgUserSettings,
    allowedReportsActions: any,
    allowedTripsActions: any,
    allowedAdvancesActions: any,
    orgs: any,
    isDelegatee: boolean
  ) {
    this.sideMenuList = [
      {
        title: 'Dashboard',
        isVisible: true,
        icon: 'fy-dashboard-new',
        route: ['/', 'enterprise', 'my_dashboard'],
      },
      {
        title: 'Expenses',
        isVisible: true,
        icon: 'fy-expenses-new',
        route: ['/', 'enterprise', 'my_expenses'],
      },
      {
        title: 'Cards',
        isVisible: orgSettings.corporate_credit_card_settings.enabled,
        icon: 'fy-cards-new',
        route: ['/', 'enterprise', 'corporate_card_expenses'],
        disabled: true,
      },
      {
        title: 'Reports',
        isVisible: true,
        icon: 'fy-reports-new',
        route: ['/', 'enterprise', 'my_reports'],
        disabled: true,
      },
      {
        title: 'Trips',
        // eslint-disable-next-line max-len
        isVisible:
          orgSettings.trip_requests.enabled &&
          (!orgSettings.trip_requests.enable_for_certain_employee ||
            (orgSettings.trip_requests.enable_for_certain_employee &&
              orgUserSettings.trip_request_org_user_settings.enabled)),
        icon: 'fy-trips-new',
        route: ['/', 'enterprise', 'my_trips'],
        disabled: true,
      },
      {
        title: 'Advances',
        isVisible: orgSettings.advances.enabled || orgSettings.advance_requests.enabled,
        icon: 'fy-advances-new',
        route: ['/', 'enterprise', 'my_advances'],
        disabled: true,
      },
      {
        title: 'Team Reports',
        isVisible: allowedReportsActions && allowedReportsActions.approve,
        icon: 'fy-team-reports-new',
        route: ['/', 'enterprise', 'team_reports'],
        cssClass: 'team-trips',
        disabled: true,
      },
      {
        title: 'Team Trips',
        isVisible: orgSettings.trip_requests.enabled && allowedTripsActions && allowedReportsActions.approve,
        icon: 'fy-team-trips-new',
        route: ['/', 'enterprise', 'team_trips'],
        disabled: true,
      },
      {
        title: 'Team Advances',
        isVisible: allowedAdvancesActions && allowedAdvancesActions.approve,
        icon: 'fy-team-advances-new',
        route: ['/', 'enterprise', 'team_advance'],
        disabled: true,
      },
    ];
    this.sideMenuSecondaryList = [
      {
        title: 'Live Chat',
        isVisible:
          orgUserSettings &&
          orgUserSettings.in_app_chat_settings &&
          orgUserSettings.in_app_chat_settings.allowed &&
          orgUserSettings.in_app_chat_settings.enabled,
        icon: 'fy-chat',
        openHelp: true,
        disabled: true,
      },
      {
        title: 'Settings',
        isVisible: true,
        icon: 'fy-settings',
        route: ['/', 'enterprise', 'my_profile'],
      },
      {
        title: 'Switch Organization',
        isVisible: orgs.length > 1,
        icon: 'fy-switch-new',
        route: ['/', 'auth', 'switch_org', { choose: true }],
        disabled: true,
      },
      {
        title: 'Delegated Accounts',
        isVisible: isDelegatee && !this.isSwitchedToDelegator,
        icon: 'fy-delegate-switch',
        route: ['/', 'enterprise', 'delegated_accounts'],
        disabled: true,
      },
      {
        title: 'Switch back to my account',
        isVisible: this.isSwitchedToDelegator,
        icon: 'fy-switch',
        route: ['/', 'enterprise', 'delegated_accounts', { switchToOwn: true }],
        disabled: true,
      },
      {
        title: 'Help',
        isVisible: true,
        icon: 'fy-help-new',
        route: ['/', 'enterprise', 'help'],
        disabled: true,
      },
    ];
  }

  // eslint-disable-next-line
  setSideMenuOnline(
    orgSettings: any,
    orgUserSettings: OrgUserSettings,
    allowedReportsActions: any,
    allowedTripsActions: any,
    allowedAdvancesActions: any,
    orgs: any,
    isDelegatee: boolean
  ) {
    this.sideMenuList = [
      {
        title: 'Dashboard',
        isVisible: true,
        icon: 'fy-dashboard-new',
        route: ['/', 'enterprise', 'my_dashboard'],
      },
      {
        title: 'Expenses',
        isVisible: true,
        icon: 'fy-expenses-new',
        route: ['/', 'enterprise', 'my_expenses'],
      },
      {
        title: 'Corporate Cards',
        isVisible: orgSettings.corporate_credit_card_settings.enabled,
        icon: 'fy-cards-new',
        route: ['/', 'enterprise', 'corporate_card_expenses'],
      },
      {
        title: 'Personal Cards',
        isVisible:
          orgSettings.org_personal_cards_settings.allowed &&
          orgSettings.org_personal_cards_settings.enabled &&
          orgUserSettings.personal_cards_settings?.enabled,
        icon: 'fy-cards-new',
        route: ['/', 'enterprise', 'personal_cards'],
      },
      {
        title: 'Reports',
        isVisible: true,
        icon: 'fy-reports-new',
        route: ['/', 'enterprise', 'my_reports'],
      },
      {
        title: 'Trips',
        // eslint-disable-next-line max-len
        isVisible:
          orgSettings.trip_requests.enabled &&
          (!orgSettings.trip_requests.enable_for_certain_employee ||
            (orgSettings.trip_requests.enable_for_certain_employee &&
              orgUserSettings.trip_request_org_user_settings.enabled)),
        icon: 'fy-trips-new',
        route: ['/', 'enterprise', 'my_trips'],
      },
      {
        title: 'Advances',
        isVisible: orgSettings.advances.enabled || orgSettings.advance_requests.enabled,
        icon: 'fy-advances-new',
        route: ['/', 'enterprise', 'my_advances'],
      },
      {
        title: 'Team Reports',
        isVisible: allowedReportsActions && allowedReportsActions.approve,
        icon: 'fy-team-reports-new',
        route: ['/', 'enterprise', 'team_reports'],
        cssClass: 'team-trips',
      },
      {
        title: 'Team Trips',
        isVisible: orgSettings.trip_requests.enabled && allowedTripsActions && allowedReportsActions.approve,
        icon: 'fy-team-trips-new',
        route: ['/', 'enterprise', 'team_trips'],
      },
      {
        title: 'Team Advances',
        isVisible: allowedAdvancesActions && allowedAdvancesActions.approve,
        icon: 'fy-team-advances-new',
        route: ['/', 'enterprise', 'team_advance'],
      },
    ];
    this.sideMenuSecondaryList = [
      {
        title: 'Live Chat',
        isVisible:
          orgUserSettings &&
          orgUserSettings.in_app_chat_settings &&
          orgUserSettings.in_app_chat_settings.allowed &&
          orgUserSettings.in_app_chat_settings.enabled,
        icon: 'fy-chat',
        openHelp: true,
      },
      {
        title: 'Settings',
        isVisible: true,
        icon: 'fy-settings',
        route: ['/', 'enterprise', 'my_profile'],
      },
      {
        title: 'Switch Organization',
        isVisible: orgs.length > 1 && !this.isSwitchedToDelegator,
        icon: 'fy-switch-new',
        route: ['/', 'auth', 'switch_org', { choose: true, navigate_back: true }],
      },
      {
        title: 'Delegated Accounts',
        isVisible: isDelegatee && !this.isSwitchedToDelegator,
        icon: 'fy-delegate-switch',
        route: ['/', 'enterprise', 'delegated_accounts'],
      },
      {
        title: 'Switch back to my account',
        isVisible: this.isSwitchedToDelegator,
        icon: 'fy-switch',
        route: ['/', 'enterprise', 'delegated_accounts', { switchToOwn: true }],
      },
      {
        title: 'Help',
        isVisible: true,
        icon: 'fy-help-new',
        route: ['/', 'enterprise', 'help'],
      },
    ];
  }

  setDividerTitle(orgSettings: any, orgUserSettings: OrgUserSettings) {
    this.dividerTitle = 'Reports';
    if (
      orgSettings.trip_requests.enabled &&
      (!orgSettings.trip_requests.enable_for_certain_employee ||
        (orgSettings.trip_requests.enable_for_certain_employee &&
          orgUserSettings.trip_request_org_user_settings.enabled))
    ) {
      this.dividerTitle = 'Trips';
    }
    if (orgSettings.advances.enabled || orgSettings.advance_requests.enabled) {
      this.dividerTitle = 'Advances';
    }
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
        this.showSideMenu();
        this.pushNotificationService.initPush();
      }
    });

    this.userEventService.onSetToken(() => {
      setTimeout(() => {
        this.showSideMenu();
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
}
