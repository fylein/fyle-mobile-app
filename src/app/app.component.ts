import { Component, OnInit, EventEmitter } from '@angular/core';
import { Platform, MenuController, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { pipe, forkJoin, from, iif, of, concat, Observable } from 'rxjs';
import {map, switchMap, shareReplay, tap} from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { PermissionsService } from 'src/app/core/services/permissions.service';
import { DeviceService } from 'src/app/core/services/device.service';
import { AppVersionService } from './core/services/app-version.service';

import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { Org } from 'src/app/core/models/org.model';
import { environment } from 'src/environments/environment';
import { RouterAuthService } from './core/services/router-auth.service';
import { GlobalCacheConfig, globalCacheBusterNotifier } from 'ts-cacheable';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { NetworkService } from './core/services/network.service';
import { Plugins } from '@capacitor/core';
import { FreshChatService } from './core/services/fresh-chat.service';
const { App } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  eou$: Observable<any>;
  activeOrg: any;
  sideMenuList: any[];
  appVersion: string;
  isSwitchedToDelegator;
  isConnected$: Observable<boolean>;
  eou;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
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
    private freshchatService: FreshChatService
  ) {
    this.initializeApp();
    this.registerBackButtonAction();
    this.matIconRegistry.addSvgIcon('add-advance', this.domSanitizer.bypassSecurityTrustResourceUrl('../../assets/svg/add-advance'));
  }

  async showAppCloseAlert() {
    const alert = await this.alertController.create({
      header: 'Exit Fyle App',
      message: 'Are you sure you want to exit the app?',
      buttons: [
        {
          text: 'Cancel',
        }, {
          text: 'Okay',
          handler: () => {
            App.exitApp();
          }
        }
      ]
    });

    await alert.present();
  }

  registerBackButtonAction() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      if (this.router.url.includes('my_dashboard')) {
        this.showAppCloseAlert();
      }
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      // Global cache config
      GlobalCacheConfig.maxAge = 10 * 60 * 1000;
      GlobalCacheConfig.maxCacheCount = 100;
    });
  }

  openHelp() {
    console.log('Here');
    this.freshchatService.openLiveChatSupport();
  }

  redirect(route) {
    this.menuController.close();
    if (route.indexOf('switch-org') > -1) {
      this.userEventService.clearCache();
      globalCacheBusterNotifier.next();
    }
    this.router.navigate(route);
  }

  checkAppSupportedVersion() {
    this.deviceService.getDeviceInfo().pipe(
      switchMap((deviceInfo) => {
        const data = {
          app_version: deviceInfo.appVersion,
          device_os: deviceInfo.platform
        };

        return this.appVersionService.isSupported(data);
      })
    ).subscribe((res: { message: string, supported: boolean }) => {
      if (!res.supported && environment.production) {
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
    const orgSettings$ = this.offlineService.getOrgSettings().pipe(
      shareReplay()
    );
    const orgUserSettings$ = this.offlineService.getOrgUserSettings();
    const delegatedAccounts$ = this.offlineService.getDelegatedAccounts().pipe(
      map(res => {
        return this.orgUserService.excludeByStatus(res, 'DISABLED');
      })
    );
    const deviceInfo$ = this.deviceService.getDeviceInfo();
    const isSwitchedToDelegator$ = from(this.orgUserService.isSwitchedToDelegator());

    const allowedActions$ = orgSettings$.pipe(
      switchMap(orgSettings => {
        const allowedReportsActions$ = this.offlineService.getReportActions(orgSettings);
        const allowedAdvancesActions$ = this.permissionsService.allowedActions('advances', ['approve', 'create', 'delete'], orgSettings);
        const allowedTripsActions$ = this.permissionsService.allowedActions('trips', ['approve', 'create', 'edit', 'cancel'], orgSettings);

        return forkJoin({
          allowedReportsActions: allowedReportsActions$,
          allowedAdvancesActions: iif(() => (orgSettings.advance_requests.enabled
            || orgSettings.advances.enabled), allowedAdvancesActions$, of(null)),
          allowedTripsActions: iif(() => orgSettings.trip_requests.enabled, allowedTripsActions$, of(null))
        });
      })
    );

    this.isConnected$.pipe(
      switchMap(isConnected => {
        return forkJoin({
          orgs: orgs$,
          currentOrg: currentOrg$,
          orgSettings: orgSettings$,
          orgUserSettings: orgUserSettings$,
          delegatedAccounts: delegatedAccounts$,
          allowedActions: allowedActions$,
          deviceInfo: deviceInfo$,
          isSwitchedToDelegator: isSwitchedToDelegator$,
          isConnected: of(isConnected),
          eou: this.authService.getEou()
        });
      })
    ).subscribe((res) => {
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

      // TODO: remove nested subscribe - mini tech debt
      if (isConnected) {
        this.sideMenuList = [
          {
            title: 'Dashboard',
            isVisible: true,
            icon: 'fy-dashboard-new',
            route: ['/', 'enterprise', 'my_dashboard']
          },
          {
            title: 'Expenses',
            isVisible: true,
            icon: 'fy-expenses-new',
            route: ['/', 'enterprise', 'my_expenses']
          },
          {
            title: 'Reports',
            isVisible: true,
            icon: 'fy-reports-new',
            route: ['/', 'enterprise', 'my_reports']
          },
          {
            title: 'Advances',
            isVisible: orgSettings.advances.enabled || orgSettings.advance_requests.enabled,
            icon: 'fy-advances-new',
            route: ['/', 'enterprise', 'my_advances']
          },
          {
            title: 'Trips',
            // tslint:disable-next-line: max-line-length
            isVisible: orgSettings.trip_requests.enabled && (!orgSettings.trip_requests.enable_for_certain_employee || (orgSettings.trip_requests.enable_for_certain_employee && orgUserSettings.trip_request_org_user_settings.enabled)),
            icon: 'fy-trips-new',
            route: ['/', 'enterprise', 'my_trips']
          },
          {
            title: 'Delegated Accounts',
            isVisible: isDelegatee && !this.isSwitchedToDelegator,
            icon: 'fy-delegate-switch',
            route: ['/', 'enterprise', 'delegated_accounts']
          },
          {
            title: 'Cards',
            isVisible: orgSettings.corporate_credit_card_settings.enabled,
            icon: 'fy-cards-new',
            route: ['/', 'enterprise', 'corporate_card_expenses']
          },
          {
            title: 'Receipts',
            isVisible: orgSettings.receipt_settings.enabled,
            icon: 'fy-receipts-new',
            route: ['/', 'enterprise', 'my_dashboard7']
          },
          {
            title: 'Switch to own account',
            isVisible: this.isSwitchedToDelegator,
            icon: 'fy-switch',
            route: ['/', 'enterprise', 'delegated_accounts', { switchToOwn: true }]
          },
          {
            title: 'Profile',
            isVisible: true,
            icon: 'fy-profile-new',
            route: ['/', 'enterprise', 'my_profile']
          },
          {
            title: 'Team Reports',
            isVisible: allowedReportsActions && allowedReportsActions.approve,
            icon: 'fy-team-reports-new',
            route: ['/', 'enterprise', 'team_reports'],
            cssClass: 'team-trips'
          },
          {
            title: 'Team Trips',
            isVisible: orgSettings.trip_requests.enabled && (allowedTripsActions && allowedReportsActions.approve),
            icon: 'fy-team-trips-new',
            route: ['/', 'enterprise', 'team_trips']
          },
          {
            title: 'Team Advances',
            isVisible: allowedAdvancesActions && allowedAdvancesActions.approve,
            icon: 'fy-team-advances-new',
            route: ['/', 'enterprise', 'team_advance']
          },
          {
            title: 'Live Chat',
            isVisible: orgUserSettings && orgUserSettings.in_app_chat_settings && orgUserSettings.in_app_chat_settings.allowed && orgUserSettings.in_app_chat_settings.enabled,
            icon: 'fy-chat',
            openHelp: true
          },
          {
            title: 'Help',
            isVisible: true,
            icon: 'fy-help-new',
            route: ['/', 'enterprise', 'help']
          },
          {
            title: 'Switch Accounts',
            isVisible: (orgs.length > 1),
            icon: 'fy-switch-new',
            route: ['/', 'auth', 'switch-org', { choose: true }]
          },
        ];
      } else {
        this.sideMenuList = [
          {
            title: 'Dashboard',
            isVisible: true,
            icon: 'fy-dashboard-new',
            route: ['/', 'enterprise', 'my_dashboard'],
            disabled: true
          },
          {
            title: 'Expenses',
            isVisible: true,
            icon: 'fy-expenses-new',
            route: ['/', 'enterprise', 'my_expenses']
          },
          {
            title: 'Reports',
            isVisible: true,
            icon: 'fy-reports-new',
            route: ['/', 'enterprise', 'my_reports'],
            disabled: true
          },
          {
            title: 'Advances',
            isVisible: orgSettings.advances.enabled || orgSettings.advance_requests.enabled,
            icon: 'fy-advances-new',
            route: ['/', 'enterprise', 'my_advances'],
            disabled: true
          },
          {
            title: 'Trips',
            // tslint:disable-next-line: max-line-length
            isVisible: orgSettings.trip_requests.enabled && (!orgSettings.trip_requests.enable_for_certain_employee || (orgSettings.trip_requests.enable_for_certain_employee && orgUserSettings.trip_request_org_user_settings.enabled)),
            icon: 'fy-trips-new',
            route: ['/', 'enterprise', 'my_trips'],
            disabled: true
          },
          {
            title: 'Delegated Accounts',
            isVisible: isDelegatee && !this.isSwitchedToDelegator,
            icon: 'fy-delegate-switch',
            route: ['/', 'enterprise', 'delegated_accounts'],
            disabled: true
          },
          {
            title: 'Corporate Cards',
            isVisible: orgSettings.corporate_credit_card_settings.enabled,
            icon: 'fy-cards-new',
            route: ['/', 'enterprise', 'corporate_card_expenses'],
            disabled: true
          },
          {
            title: 'Receipts',
            isVisible: orgSettings.receipt_settings.enabled,
            icon: 'fy-receipts-new',
            route: ['/', 'enterprise', 'my_dashboard7'],
            disabled: true
          },
          {
            title: 'Switch to own account',
            isVisible: this.isSwitchedToDelegator,
            icon: 'fy-switch',
            route: ['/', 'enterprise', 'delegated_accounts', { switchToOwn: true }],
            disabled: true
          },
          {
            title: 'Profile',
            isVisible: true,
            icon: 'fy-profile-new',
            route: ['/', 'enterprise', 'my_profile'],
          },
          {
            title: 'Team Reports',
            isVisible: allowedReportsActions && allowedReportsActions.approve,
            icon: 'fy-team-reports-new',
            route: ['/', 'enterprise', 'team_reports'],
            cssClass: 'team-trips',
            disabled: true
          },
          {
            title: 'Team Trips',
            isVisible: orgSettings.trip_requests.enabled && (allowedTripsActions && allowedReportsActions.approve),
            icon: 'fy-team-trips-new',
            route: ['/', 'enterprise', 'team_trips'],
            disabled: true
          },
          {
            title: 'Team Advances',
            isVisible: allowedAdvancesActions && allowedAdvancesActions.approve,
            icon: 'fy-team-advances-new',
            route: ['/', 'enterprise', 'team_advance'],
            disabled: true
          },
          {
            title: 'Live Chat',
            isVisible: orgUserSettings && orgUserSettings.in_app_chat_settings && orgUserSettings.in_app_chat_settings.allowed && orgUserSettings.in_app_chat_settings.enabled,
            icon: 'fy-chat',
            openHelp: true,
            disabled: true
          },
          {
            title: 'Help',
            isVisible: true,
            icon: 'fy-help-new',
            route: ['/', 'enterprise', 'help'],
            disabled: true
          },
          {
            title: 'Switch Accounts',
            isVisible: (orgs.length > 1),
            icon: 'fy-switch-new',
            route: ['/', 'auth', 'switch-org', { choose: true }],
            disabled: true
          },
        ];
      }
    });
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(shareReplay(1));
  }

  fetchEou() {
    return from(this.authService.getEou());
  }

  ngOnInit() {
    this.checkAppSupportedVersion();
    from(this.routerAuthService.isLoggedIn()).subscribe((loggedInStatus) => {
      if (loggedInStatus) {
        this.showSideMenu();
      }
    });

    this.userEventService.onSetToken(() => {
      setTimeout(() => {
        this.showSideMenu();
      }, 500);
    });

    this.userEventService.onLogout(() => {
      this.router.navigate(['/', 'auth', 'sign-in']);
    });

    this.setupNetworkWatcher();
  }

}
