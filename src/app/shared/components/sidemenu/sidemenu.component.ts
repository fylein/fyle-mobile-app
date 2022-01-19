import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as Sentry from '@sentry/angular';
import { Observable, from, forkJoin, concat, combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { DeviceService } from 'src/app/core/services/device.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { FreshChatService } from 'src/app/core/services/fresh-chat.service';
import { SidemenuService } from 'src/app/core/services/sidemenu.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { OrgUserSettings } from 'src/app/core/models/org_user_settings.model';
import { Org } from 'src/app/core/models/org.model';
import { SidemenuItem } from 'src/app/core/models/sidemenu-item.model';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss'],
})
export class SidemenuComponent implements OnInit {
  @Output() switchDelegator = new EventEmitter<boolean>();

  appVersion: string;

  activeOrg: string;

  isConnected$: Observable<any>;

  isSwitchedToDelegator: boolean;

  eou: ExtendedOrgUser;

  orgSettings: any;

  orgUserSettings: OrgUserSettings;

  allowedActions: any;

  filteredSidemenuList: Partial<SidemenuItem>[];

  primaryOptionsCount: number;

  constructor(
    private offlineService: OfflineService,
    private deviceService: DeviceService,
    private routerAuthService: RouterAuthService,
    private orgUserService: OrgUserService,
    private freshChatService: FreshChatService,
    private networkService: NetworkService,
    private sidemenuService: SidemenuService
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
    const allowedActions$ = this.sidemenuService.getAllowedActions();

    combineLatest([
      forkJoin({
        orgs: orgs$,
        currentOrg: currentOrg$,
        orgSettings: orgSettings$,
        orgUserSettings: orgUserSettings$,
        delegatedAccounts: delegatedAccounts$,
        allowedActions: allowedActions$,
        deviceInfo: deviceInfo$,
        isSwitchedToDelegator: isSwitchedToDelegator$,
        eou: this.offlineService.getCurrentUser(),
      }),
      this.isConnected$,
    ]).subscribe(
      ([
        {
          orgs,
          currentOrg,
          orgSettings,
          orgUserSettings,
          delegatedAccounts,
          allowedActions,
          deviceInfo,
          isSwitchedToDelegator,
          eou,
        },
        isConnected,
      ]) => {
        this.activeOrg = currentOrg;
        this.orgSettings = orgSettings;
        this.orgUserSettings = orgUserSettings;
        const isDelegatee = delegatedAccounts.length > 0;
        this.appVersion = (deviceInfo && deviceInfo.appVersion) || '1.2.3';
        this.allowedActions = allowedActions;
        this.isSwitchedToDelegator = isSwitchedToDelegator;
        this.eou = eou;

        if (eou) {
          Sentry.setUser({
            id: eou.us.email + ' - ' + eou.ou.id,
            email: eou.us.email,
            orgUserId: eou.ou.id,
          });
        }

        this.switchDelegator.emit(this.isSwitchedToDelegator);
        this.freshChatService.setupNetworkWatcher();
        this.setupSideMenu(isConnected, orgs, isDelegatee);
      }
    );
  }

  getCardOptions() {
    const cardOptions = [
      {
        title: 'Corporate Cards',
        isVisible: this.orgSettings.corporate_credit_card_settings.enabled,
        route: ['/', 'enterprise', 'corporate_card_expenses'],
      },
      {
        title: 'Personal Cards',
        isVisible:
          this.orgSettings.org_personal_cards_settings.allowed &&
          this.orgSettings.org_personal_cards_settings.enabled &&
          this.orgUserSettings.personal_cards_settings?.enabled,
        route: ['/', 'enterprise', 'personal_cards'],
      },
    ];
    return cardOptions.filter((cardOption) => cardOption.isVisible);
  }

  getTeamOptions() {
    const { allowedReportsActions, allowedTripsActions, allowedAdvancesActions } = this.allowedActions;
    const teamOptions = [
      {
        title: 'Team Reports',
        isVisible: allowedReportsActions && allowedReportsActions.approve,
        route: ['/', 'enterprise', 'team_reports'],
      },
      {
        title: 'Team Trips',
        isVisible: this.orgSettings.trip_requests.enabled && allowedTripsActions && allowedReportsActions.approve,
        route: ['/', 'enterprise', 'team_trips'],
      },
      {
        title: 'Team Advances',
        isVisible: allowedAdvancesActions && allowedAdvancesActions.approve,
        route: ['/', 'enterprise', 'team_advance'],
      },
    ];
    return teamOptions.filter((teamOption) => teamOption.isVisible);
  }

  getPrimarySidemenuOptions(isConnected: boolean) {
    const teamOptions = this.getTeamOptions();
    const cardOptions = this.getCardOptions();

    const primaryOptions = [
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
        isVisible: cardOptions.length ? true : false,
        icon: 'fy-corporate-card',
        disabled: !isConnected,
        isDropdownOpen: false,
        dropdownOptions: cardOptions,
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
        isVisible: teamOptions.length ? true : false,
        icon: 'teams',
        isDropdownOpen: false,
        disabled: !isConnected,
        dropdownOptions: teamOptions,
      },
    ].filter((sidemenuItem) => sidemenuItem.isVisible);

    this.primaryOptionsCount = primaryOptions.length;

    if (cardOptions.length === 1) {
      primaryOptions.splice(
        primaryOptions.findIndex((option) => option.title === 'Cards'),
        1,
        {
          ...cardOptions[0],
          icon: 'fy-corporate-card',
          disabled: !isConnected,
        }
      );
    }

    if (teamOptions.length === 1) {
      primaryOptions.splice(
        primaryOptions.findIndex((option) => option.title === 'Teams'),
        1,
        {
          ...teamOptions[0],
          icon: 'teams',
          disabled: !isConnected,
        }
      );
    }

    return primaryOptions;
  }

  getSecondarySidemenuOptions(orgs: Org[], isDelegatee: boolean, isConnected: boolean) {
    return [
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
        route: ['/', 'auth', 'switch_org', { choose: true, navigate_back: true }],
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
    ].filter((sidemenuItem) => sidemenuItem.isVisible);
  }

  setupSideMenu(isConnected: boolean, orgs: Org[], isDelegatee: boolean) {
    this.filteredSidemenuList = [
      ...this.getPrimarySidemenuOptions(isConnected),
      ...this.getSecondarySidemenuOptions(orgs, isDelegatee, isConnected),
    ];
  }
}
