import { Component, OnInit } from '@angular/core';
import { Platform, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { pipe, forkJoin, from, iif, of } from 'rxjs';
import { map, switchMap, shareReplay } from 'rxjs/operators';
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

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  eou: ExtendedOrgUser;
  activeOrg: any;
  sideMenuList: any[];
  appVersion: string;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private authService: AuthService,
    private offlineService: OfflineService,
    private orgUserService: OrgUserService,
    private orgUserSettingsService: OrgUserSettingsService,
    private userEventService: UserEventService,
    private permissionsService: PermissionsService,
    private menuController: MenuController,
    private deviceService: DeviceService,
    private appVersionService: AppVersionService,
    private routerAuthService: RouterAuthService

  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  redirect(route) {
    this.menuController.close();
    if (route.indexOf('switch-org') > -1) {
      this.userEventService.clearCache();
      // TODO: Clear all caches also
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
    const eou$ = from(this.authService.getEou());
    const orgs$ = this.offlineService.getOrgs();
    const currentOrg$ = this.offlineService.getCurrentOrg();
    const orgSettings$ = this.offlineService.getOrgSettings().pipe(
      shareReplay()
    );
    const orgUserSettings$ = this.orgUserSettingsService.get();
    const delegatedAccounts$ = this.orgUserService.findDelegatedAccounts().pipe(
      map(res => {
        return this.orgUserService.excludeByStatus(res, 'ACTIVE');
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

    forkJoin({
      eou: eou$,
      orgs: orgs$,
      currentOrg: currentOrg$,
      orgSettings: orgSettings$,
      orgUserSettings: orgUserSettings$,
      delegatedAccounts: delegatedAccounts$,
      allowedActions: allowedActions$,
      deviceInfo: deviceInfo$,
      isSwitchedToDelegator: isSwitchedToDelegator$
    }).subscribe((res) => {
      this.eou = res.eou;
      const orgs = res.orgs;
      this.activeOrg = res.currentOrg;
      const orgSettings = res.orgSettings;
      const orgUserSettings = res.orgUserSettings;
      const isDelegatee = res.delegatedAccounts.length > 0;
      this.appVersion = (res.deviceInfo && res.deviceInfo.appVersion) || '1.2.3';
      const allowedReportsActions = res.allowedActions && res.allowedActions.allowedReportsActions;
      const allowedAdvancesActions = res.allowedActions && res.allowedActions.allowedAdvancesActions;
      const allowedTripsActions = res.allowedActions && res.allowedActions.allowedTripsActions;
      const isSwitchedToDelegator = res.isSwitchedToDelegator;


      this.sideMenuList = [
        {
          title: 'Dashboard',
          isVisible: true,
          icon: '../../../assets/svg/fy-dashboard-new.svg',
          route: ['/', 'enterprise', 'my_dashboard']
        },
        {
          title: 'Expenses',
          isVisible: true,
          icon: '../../../assets/svg/fy-expenses-new.svg',
          route: ['/', 'enterprise', 'my_dashboard1']
        },
        {
          title: 'Reports',
          isVisible: true,
          icon: '../../../assets/svg/fy-reports-new.svg',
          route: ['/', 'enterprise', 'my_dashboard2']
        },
        {
          title: 'Advances',
          isVisible: orgSettings.advances.enabled || orgSettings.advance_requests.enabled,
          icon: '../../../assets/svg/fy-advances-new.svg',
          route: ['/', 'enterprise', 'my_advances']
        },
        {
          title: 'Trips',
          // tslint:disable-next-line: max-line-length
          isVisible: orgSettings.trip_requests.enabled && (!orgSettings.trip_requests.enable_for_certain_employee || (orgSettings.trip_requests.enable_for_certain_employee && orgUserSettings.trip_request_org_user_settings.enabled)),
          icon: '../../../assets/svg/fy-trips-new.svg',
          route: ['/', 'enterprise', 'my_trips']
        },
        {
          title: 'Delegated Accounts',
          isVisible: isDelegatee,
          icon: '../../../assets/svg/fy-delegate-switch.svg',
          route: ['/', 'enterprise', 'my_dashboard5']
        },
        {
          title: 'Corporate Cards',
          isVisible: orgSettings.corporate_credit_card_settings.enabled,
          icon: '../../../assets/svg/fy-cards-new.svg',
          route: ['/', 'enterprise', 'my_dashboard6']
        },
        {
          title: 'Receipts',
          isVisible: orgSettings.receipt_settings.enabled,
          icon: '../../../assets/svg/fy-receipts-new.svg',
          route: ['/', 'enterprise', 'my_dashboard7']
        },
        {
          title: 'Switch to own account',
          isVisible: isSwitchedToDelegator,
          icon: '../../../assets/svg/fy-switch.svg',
          route: ['/', 'enterprise', 'my_dashboard8']
        },
        {
          title: 'Profile',
          isVisible: true,
          icon: '../../../assets/svg/fy-profile-new.svg',
          route: ['/', 'enterprise', 'my_dashboard9']
        },
        {
          title: 'Team Reports',
          isVisible: allowedReportsActions && allowedReportsActions.approve,
          icon: '../../../assets/svg/fy-team-reports-new.svg',
          route: ['/', 'enterprise', 'my_dashboard10'],
          cssClass: 'team-trips'
        },
        {
          title: 'Team Trips',
          isVisible: orgSettings.trip_requests.enabled && (allowedTripsActions && allowedReportsActions.approve),
          icon: '../../../assets/svg/fy-team-trips-new.svg',
          route: ['/', 'enterprise', 'my_dashboard11']
        },
        {
          title: 'Team Advances',
          isVisible: allowedAdvancesActions && allowedAdvancesActions.approve,
          icon: '../../../assets/svg/fy-team-advances-new.svg',
          route: ['/', 'enterprise', 'my_dashboard12']
        },
        {
          title: 'Help',
          isVisible: true,
          icon: '../../../assets/svg/fy-help-new.svg',
          route: ['/', 'enterprise', 'my_dashboard13']
        },
        {
          title: 'Switch Accounts',
          isVisible: (orgs.length > 1),
          icon: '../../../assets/svg/fy-switch-new.svg',
          route: ['/', 'auth', 'switch-org', { choose: true }]
        },
      ];
    });

  }

  ngOnInit() {
    this.checkAppSupportedVersion();
    // For local development replace this.userEventService.onSetToken() with this.showSideMenu()
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

    // Left with isonline/is offline method
  }
}
