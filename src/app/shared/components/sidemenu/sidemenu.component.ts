import { Component, OnInit, EventEmitter } from '@angular/core';
import * as Sentry from '@sentry/angular';
import { Observable, noop, from, forkJoin, of, iif, concat } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { DeviceService } from 'src/app/core/services/device.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { PermissionsService } from 'src/app/core/services/permissions.service';
import { FreshChatService } from 'src/app/core/services/fresh-chat.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { environment } from 'src/environments/environment';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { OrgUserSettings } from 'src/app/core/models/org_user_settings.model';
import { Org } from 'src/app/core/models/org.model';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss'],
})
export class SidemenuComponent implements OnInit {
  appVersion: string;

  // allowedActions$: Observable<any>;

  activeOrg: string;

  isConnected$: Observable<any>;

  isSwitchedToDelegator: boolean;

  eou: any;

  sideMenuList: any[];

  sideMenuSecondaryList: any[];

  dividerTitle: string;

  orgSettings;

  orgUserSettings;

  // isConnected;

  allowedActions;

  filteredSidemenuList;

  constructor(
    private offlineService: OfflineService,
    private deviceService: DeviceService,
    private routerAuthService: RouterAuthService,
    private orgUserService: OrgUserService,
    private permissionsService: PermissionsService,
    private freshChatService: FreshChatService,
    private networkService: NetworkService
  ) {}

  ngOnInit(): void {
    this.setupNetworkWatcher();
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      shareReplay(1)
    );

    // this.isConnected$.pipe((isConnected) => (this.isConnected = isConnected)).subscribe(noop);
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

    const allowedActions$ = orgSettings$.pipe(
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
            allowedActions: allowedActions$,
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
        this.orgSettings = res.orgSettings;
        this.orgUserSettings = res.orgUserSettings;
        const isDelegatee = res.delegatedAccounts.length > 0;
        this.appVersion = (res.deviceInfo && res.deviceInfo.appVersion) || '1.2.3';
        this.allowedActions = res.allowedActions;
        // const allowedReportsActions = res.allowedActions && res.allowedActions.allowedReportsActions;
        // const allowedAdvancesActions = res.allowedActions && res.allowedActions.allowedAdvancesActions;
        // const allowedTripsActions = res.allowedActions && res.allowedActions.allowedTripsActions;
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
          // allowedActions,
          // allowedReportsActions,
          // allowedTripsActions,
          // allowedAdvancesActions,
          orgs,
          isDelegatee
        );

        /* These below conditions have been added to place the divider in the sidenav:-
        - if 'Advances' is enabled, the divider will be placed under 'Advances',
        - else if 'Trips' is enabled, the divider will be placed under 'Trips',
        - else it will be placed under 'Reports'
      */
        this.setDividerTitle();
      });
  }

  getCardOptions() {
    return [
      {
        title: 'Corporate Cards',
        isVisible: this.orgSettings.corporate_credit_card_settings.enabled,
        // icon: 'fy-corporate-card',
        route: ['/', 'enterprise', 'corporate_card_expenses'],
        // disabled: !isConnected
      },
      {
        title: 'Personal Cards',
        isVisible: environment.ROOT_URL === 'https://staging.fyle.tech',
        // icon: 'fy-cards-new',
        route: ['/', 'enterprise', 'personal_cards'],
        // disabled: !isConnected
      },
    ];
  }

  getTeamOptions(allowedReportsActions, allowedTripsActions, allowedAdvancesActions) {
    return [
      {
        title: 'Team Reports',
        isVisible: allowedReportsActions && allowedReportsActions.approve,
        // icon: 'teams',
        route: ['/', 'enterprise', 'team_reports'],
        cssClass: 'team-trips',
        // disabled: !isConnected
      },
      {
        title: 'Team Trips',
        isVisible: this.orgSettings.trip_requests.enabled && allowedTripsActions && allowedReportsActions.approve,
        // icon: 'fy-team-trips-new',
        route: ['/', 'enterprise', 'team_trips'],
        // disabled: !isConnected
      },
      {
        title: 'Team Advances',
        isVisible: allowedAdvancesActions && allowedAdvancesActions.approve,
        // icon: 'fy-team-advances-new',
        route: ['/', 'enterprise', 'team_advance'],
        // disabled: !isConnected
      },
    ];
  }

  setPrimarySidemenuOptions(isConnected) {
    const { allowedReportsActions, allowedTripsActions, allowedAdvancesActions } = this.allowedActions;

    // const isConnected = this.isConnected;
    return [
      {
        title: 'Dashboard',
        isVisible: true,
        icon: 'fy-dashboard-new',
        route: ['/', 'enterprise', 'my_dashboard'],
      },
      {
        title: 'Expenses',
        isVisible: true,
        icon: 'expense',
        route: ['/', 'enterprise', 'my_expenses'],
      },
      {
        title: 'Cards',
        isVisible:
          this.orgSettings.corporate_credit_card_settings.enabled ||
          environment.ROOT_URL === 'https://staging.fyle.tech',
        icon: 'fy-corporate-card',
        disabled: !isConnected,
        isDropdownOpen: false,
        dropdownOptions: this.getCardOptions(),
      },
      {
        title: 'Reports',
        isVisible: true,
        icon: 'fy-report',
        route: ['/', 'enterprise', 'my_reports'],
        disabled: !isConnected,
      },
      {
        title: 'Trips',
        // eslint-disable-next-line max-len
        isVisible:
          this.orgSettings.trip_requests.enabled &&
          (!this.orgSettings.trip_requests.enable_for_certain_employee ||
            (this.orgSettings.trip_requests.enable_for_certain_employee &&
              this.orgUserSettings.trip_request_org_user_settings.enabled)),
        icon: 'fy-trips-new',
        route: ['/', 'enterprise', 'my_trips'],
        disabled: !isConnected,
      },
      {
        title: 'Advances',
        isVisible: this.orgSettings.advances.enabled || this.orgSettings.advance_requests.enabled,
        icon: 'advances',
        route: ['/', 'enterprise', 'my_advances'],
        disabled: !isConnected,
      },
      {
        title: 'Teams',
        isVisible: allowedReportsActions && allowedReportsActions.approve,
        icon: 'teams',
        isDropdownOpen: false,
        disabled: !isConnected,
        dropdownOptions: this.getTeamOptions(allowedReportsActions, allowedTripsActions, allowedAdvancesActions),
      },
    ];
  }

  // TODO: Reduce number of params being passed
  // eslint-disable-next-line max-params
  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  setupSideMenu(
    isConnected: boolean,
    // allowedActions,
    // allowedReportsActions: any,
    // allowedTripsActions: any,
    // allowedAdvancesActions: any,
    orgs,
    isDelegatee: boolean
  ) {
    // if (isConnected) {
    //   this.setSideMenuOnline(
    //     allowedReportsActions,
    //     allowedTripsActions,
    //     allowedAdvancesActions,
    //     orgs,
    //     isDelegatee
    //   );
    // } else {
    //   this.setSideMenuOffline(
    //     allowedReportsActions,
    //     allowedTripsActions,
    //     allowedAdvancesActions,
    //     orgs,
    //     isDelegatee
    //   );
    // }

    // const cardOptions = [];
    // const teamOptions = [
    //   {
    //     title: 'Team Reports',
    //     isVisible: allowedReportsActions && allowedReportsActions.approve,
    //     // icon: 'teams',
    //     route: ['/', 'enterprise', 'team_reports'],
    //     cssClass: 'team-trips',
    //     disabled: !isConnected
    //   },
    //   {
    //     title: 'Team Trips',
    //     isVisible: this.orgSettings.trip_requests.enabled && allowedTripsActions && allowedReportsActions.approve,
    //     // icon: 'fy-team-trips-new',
    //     route: ['/', 'enterprise', 'team_trips'],
    //     disabled: !isConnected
    //   },
    //   {
    //     title: 'Team Advances',
    //     isVisible: allowedAdvancesActions && allowedAdvancesActions.approve,
    //     // icon: 'fy-team-advances-new',
    //     route: ['/', 'enterprise', 'team_advance'],
    //     disabled: !isConnected
    //   }
    // ]

    const sidemenuList = [
      ...this.setPrimarySidemenuOptions(isConnected),
      {
        title: 'Delegated Accounts',
        isVisible: isDelegatee && !this.isSwitchedToDelegator,
        icon: 'delegate-switch',
        route: ['/', 'enterprise', 'delegated_accounts'],
        disabled: !isConnected,
      },
      {
        title: 'Switch back to my account',
        isVisible: this.isSwitchedToDelegator,
        icon: 'fy-switch',
        route: ['/', 'enterprise', 'delegated_accounts', { switchToOwn: true }],
        disabled: !isConnected,
      },
      {
        title: 'Switch Organization',
        isVisible: orgs.length > 1 && !this.isSwitchedToDelegator,
        icon: 'swap',
        route: ['/', 'auth', 'switch_org', { choose: true }],
        disabled: !isConnected,
      },
      {
        title: 'Settings',
        isVisible: true,
        icon: 'fy-settings',
        route: ['/', 'enterprise', 'my_profile'],
      },
      {
        title: 'Live Chat',
        isVisible:
          this.orgUserSettings &&
          this.orgUserSettings.in_app_chat_settings &&
          this.orgUserSettings.in_app_chat_settings.allowed &&
          this.orgUserSettings.in_app_chat_settings.enabled,
        icon: 'fy-chat-2',
        openLiveChat: true,
        disabled: !isConnected,
      },
      {
        title: 'Help',
        isVisible: true,
        icon: 'help',
        route: ['/', 'enterprise', 'help'],
        disabled: !isConnected,
      },
    ];

    this.filteredSidemenuList = sidemenuList.filter((sidemenuItem) => sidemenuItem.isVisible);
  }

  // TODO: Breakdown to make this easier to
  // eslint-disable-next-line
  // setSideMenuOffline(
  //   orgSettings: any,
  //   orgUserSettings: OrgUserSettings,
  //   allowedReportsActions: any,
  //   allowedTripsActions: any,
  //   allowedAdvancesActions: any,
  //   orgs: any,
  //   isDelegatee: boolean
  // ) {
  //   this.sideMenuList = [
  //     {
  //       title: 'Dashboard',
  //       isVisible: true,
  //       icon: 'fy-dashboard-new',
  //       route: ['/', 'enterprise', 'my_dashboard'],
  //     },
  //     {
  //       title: 'Expenses',
  //       isVisible: true,
  //       icon: 'fy-expenses-new',
  //       route: ['/', 'enterprise', 'my_expenses'],
  //     },
  //     {
  //       title: 'Cards',
  //       isVisible: orgSettings.corporate_credit_card_settings.enabled,
  //       icon: 'fy-cards-new',
  //       route: ['/', 'enterprise', 'corporate_card_expenses'],
  //       disabled: true,
  //     },
  //     {
  //       title: 'Reports',
  //       isVisible: true,
  //       icon: 'fy-reports-new',
  //       route: ['/', 'enterprise', 'my_reports'],
  //       disabled: true,
  //     },
  //     {
  //       title: 'Trips',
  //       // eslint-disable-next-line max-len
  //       isVisible:
  //         orgSettings.trip_requests.enabled &&
  //         (!orgSettings.trip_requests.enable_for_certain_employee ||
  //           (orgSettings.trip_requests.enable_for_certain_employee &&
  //             orgUserSettings.trip_request_org_user_settings.enabled)),
  //       icon: 'fy-trips-new',
  //       route: ['/', 'enterprise', 'my_trips'],
  //       disabled: true,
  //     },
  //     {
  //       title: 'Advances',
  //       isVisible: orgSettings.advances.enabled || orgSettings.advance_requests.enabled,
  //       icon: 'fy-advances-new',
  //       route: ['/', 'enterprise', 'my_advances'],
  //       disabled: true,
  //     },
  //     {
  //       title: 'Team Reports',
  //       isVisible: allowedReportsActions && allowedReportsActions.approve,
  //       icon: 'fy-team-reports-new',
  //       route: ['/', 'enterprise', 'team_reports'],
  //       cssClass: 'team-trips',
  //       disabled: true,
  //     },
  //     {
  //       title: 'Team Trips',
  //       isVisible: orgSettings.trip_requests.enabled && allowedTripsActions && allowedReportsActions.approve,
  //       icon: 'fy-team-trips-new',
  //       route: ['/', 'enterprise', 'team_trips'],
  //       disabled: true,
  //     },
  //     {
  //       title: 'Team Advances',
  //       isVisible: allowedAdvancesActions && allowedAdvancesActions.approve,
  //       icon: 'fy-team-advances-new',
  //       route: ['/', 'enterprise', 'team_advance'],
  //       disabled: true,
  //     },
  //   ];
  //   this.sideMenuSecondaryList = [
  //     {
  //       title: 'Live Chat',
  //       isVisible:
  //         orgUserSettings &&
  //         orgUserSettings.in_app_chat_settings &&
  //         orgUserSettings.in_app_chat_settings.allowed &&
  //         orgUserSettings.in_app_chat_settings.enabled,
  //       icon: 'fy-chat',
  //       openHelp: true,
  //       disabled: true,
  //     },
  //     {
  //       title: 'Settings',
  //       isVisible: true,
  //       icon: 'fy-settings',
  //       route: ['/', 'enterprise', 'my_profile'],
  //     },
  //     {
  //       title: 'Switch Organization',
  //       isVisible: orgs.length > 1,
  //       icon: 'fy-switch-new',
  //       route: ['/', 'auth', 'switch_org', { choose: true }],
  //       disabled: true,
  //     },
  //     {
  //       title: 'Delegated Accounts',
  //       isVisible: isDelegatee && !this.isSwitchedToDelegator,
  //       icon: 'fy-delegate-switch',
  //       route: ['/', 'enterprise', 'delegated_accounts'],
  //       disabled: true,
  //     },
  //     {
  //       title: 'Switch back to my account',
  //       isVisible: this.isSwitchedToDelegator,
  //       icon: 'fy-switch',
  //       route: ['/', 'enterprise', 'delegated_accounts', { switchToOwn: true }],
  //       disabled: true,
  //     },
  //     {
  //       title: 'Help',
  //       isVisible: true,
  //       icon: 'fy-help-new',
  //       route: ['/', 'enterprise', 'help'],
  //       disabled: true,
  //     },
  //   ];
  // }

  // eslint-disable-next-line
  setSideMenuOnline(
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
        icon: 'expense',
        route: ['/', 'enterprise', 'my_expenses'],
      },
      {
        title: 'Cards',
        isVisible: this.orgSettings.corporate_credit_card_settings.enabled,
        icon: 'fy-corporate-card',
        route: ['/', 'enterprise', 'corporate_card_expenses'],
      },
      {
        title: 'Personal Cards',
        isVisible: environment.ROOT_URL === 'https://staging.fyle.tech',
        // icon: 'fy-cards-new',
        route: ['/', 'enterprise', 'personal_cards'],
      },
      {
        title: 'Reports',
        isVisible: true,
        icon: 'fy-report',
        route: ['/', 'enterprise', 'my_reports'],
      },
      {
        title: 'Trips',
        // eslint-disable-next-line max-len
        isVisible:
          this.orgSettings.trip_requests.enabled &&
          (!this.orgSettings.trip_requests.enable_for_certain_employee ||
            (this.orgSettings.trip_requests.enable_for_certain_employee &&
              this.orgUserSettings.trip_request_org_user_settings.enabled)),
        icon: 'fy-trips-new',
        route: ['/', 'enterprise', 'my_trips'],
      },
      {
        title: 'Advances',
        isVisible: this.orgSettings.advances.enabled || this.orgSettings.advance_requests.enabled,
        icon: 'advances',
        route: ['/', 'enterprise', 'my_advances'],
      },
      {
        title: 'Team Reports',
        isVisible: allowedReportsActions && allowedReportsActions.approve,
        icon: 'teams',
        route: ['/', 'enterprise', 'team_reports'],
        cssClass: 'team-trips',
      },
      {
        title: 'Team Trips',
        isVisible: this.orgSettings.trip_requests.enabled && allowedTripsActions && allowedReportsActions.approve,
        // icon: 'fy-team-trips-new',
        route: ['/', 'enterprise', 'team_trips'],
      },
      {
        title: 'Team Advances',
        isVisible: allowedAdvancesActions && allowedAdvancesActions.approve,
        // icon: 'fy-team-advances-new',
        route: ['/', 'enterprise', 'team_advance'],
      },
    ];
    this.sideMenuSecondaryList = [
      {
        title: 'Live Chat',
        isVisible:
          this.orgUserSettings &&
          this.orgUserSettings.in_app_chat_settings &&
          this.orgUserSettings.in_app_chat_settings.allowed &&
          this.orgUserSettings.in_app_chat_settings.enabled,
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
        icon: 'swap',
        route: ['/', 'auth', 'switch_org', { choose: true }],
      },
      {
        title: 'Delegated Accounts',
        isVisible: isDelegatee && !this.isSwitchedToDelegator,
        icon: 'delegate-switch',
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
        icon: 'help',
        route: ['/', 'enterprise', 'help'],
      },
    ];
  }

  setDividerTitle() {
    this.dividerTitle = 'Reports';
    if (
      this.orgSettings.trip_requests.enabled &&
      (!this.orgSettings.trip_requests.enable_for_certain_employee ||
        (this.orgSettings.trip_requests.enable_for_certain_employee &&
          this.orgUserSettings.trip_request_org_user_settings.enabled))
    ) {
      this.dividerTitle = 'Trips';
    }
    if (this.orgSettings.advances.enabled || this.orgSettings.advance_requests.enabled) {
      this.dividerTitle = 'Advances';
    }
  }
}
