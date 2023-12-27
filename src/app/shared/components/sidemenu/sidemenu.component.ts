import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as Sentry from '@sentry/angular';
import { Observable, from, forkJoin, concat, combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { DeviceService } from 'src/app/core/services/device.service';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { FreshChatService } from 'src/app/core/services/fresh-chat.service';
import { SidemenuService } from 'src/app/core/services/sidemenu.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { OrgUserSettings } from 'src/app/core/models/org_user_settings.model';
import { Org } from 'src/app/core/models/org.model';
import { SidemenuItem } from 'src/app/core/models/sidemenu-item.model';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgService } from 'src/app/core/services/org.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ExtendedDeviceInfo } from 'src/app/core/models/extended-device-info.model';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss'],
})
export class SidemenuComponent implements OnInit {
  @Output() switchDelegator = new EventEmitter<boolean>();

  appVersion: string;

  activeOrg: Org | { name: string };

  isConnected$: Observable<any>;

  isSwitchedToDelegator: boolean;

  eou: ExtendedOrgUser;

  orgSettings: any;

  orgUserSettings: OrgUserSettings;

  allowedActions: any;

  filteredSidemenuList: Partial<SidemenuItem>[];

  primaryOptionsCount: number;

  deviceInfo: Observable<ExtendedDeviceInfo>;

  constructor(
    private deviceService: DeviceService,
    private routerAuthService: RouterAuthService,
    private router: Router,
    private menuController: MenuController,
    private orgUserService: OrgUserService,
    private orgSettingsService: OrgSettingsService,
    private networkService: NetworkService,
    private sidemenuService: SidemenuService,
    private launchDarklyService: LaunchDarklyService,
    private orgService: OrgService,
    private authService: AuthService,
    private orgUserSettingsService: OrgUserSettingsService
  ) {}

  ngOnInit(): void {
    this.setupNetworkWatcher();
    this.authService.getEou().then((eou) => {
      this.eou = eou;
    });
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = this.networkService.connectivityWatcher(new EventEmitter<boolean>());
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      shareReplay(1)
    );
  }

  showSideMenuOffline() {
    this.deviceService
      .getDeviceInfo()
      .pipe(shareReplay(1))
      .subscribe((deviceInfo) => {
        this.appVersion = (deviceInfo && deviceInfo.liveUpdateAppVersion) || '1.2.3';
        this.activeOrg = {
          name: this.eou.ou.org_name,
        };
        this.setupSideMenu();
      });
  }

  async showSideMenuOnline() {
    const isLoggedIn = await this.routerAuthService.isLoggedIn();
    if (!isLoggedIn) {
      return 0;
    }
    const orgs$ = this.orgService.getOrgs();
    const currentOrg$ = this.orgService.getCurrentOrg().pipe(shareReplay(1));
    const orgSettings$ = this.orgSettingsService.get().pipe(shareReplay(1));
    const orgUserSettings$ = this.orgUserSettingsService.get();
    const delegatedAccounts$ = this.orgUserService
      .findDelegatedAccounts()
      .pipe(map((res) => this.orgUserService.excludeByStatus(res, 'DISABLED')));
    const deviceInfo$ = this.deviceService.getDeviceInfo().pipe(shareReplay(1));
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
        eou: this.orgUserService.getCurrent(),
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
        const isDelegatee = delegatedAccounts?.length > 0;
        this.appVersion = (deviceInfo && deviceInfo.liveUpdateAppVersion) || '1.2.3';
        this.allowedActions = allowedActions;
        this.isSwitchedToDelegator = isSwitchedToDelegator;
        this.eou = eou;

        if (eou) {
          Sentry.setUser({
            id: eou.us.email + ' - ' + eou.ou.id,
            email: eou.us.email,
            orgUserId: eou.ou.id,
          });

          if (isConnected) {
            this.launchDarklyService.initializeUser({
              key: eou.ou.user_id,
              custom: {
                org_id: eou.ou.org_id,
                org_user_id: eou.ou.id,
                org_currency: currentOrg?.currency,
                org_created_at: currentOrg?.created_at?.toString(),
                asset: `MOBILE - ${deviceInfo?.platform.toUpperCase()}`,
              },
            });
          }
        }

        this.switchDelegator.emit(this.isSwitchedToDelegator);
        this.setupSideMenu(isConnected, orgs, isDelegatee);
      }
    );
  }

  getCardOptions() {
    const cardOptions = [
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
    const { allowedReportsActions, allowedAdvancesActions } = this.allowedActions;
    const teamOptions = [
      {
        title: 'Team Reports',
        isVisible: allowedReportsActions && allowedReportsActions.approve,
        route: ['/', 'enterprise', 'team_reports'],
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
        icon: 'dashboard',
        route: ['/', 'enterprise', 'my_dashboard'],
      },
      {
        title: 'Expenses',
        isVisible: true,
        icon: 'list',
        route: ['/', 'enterprise', 'my_expenses'],
      },
      {
        title: 'Cards',
        isVisible: cardOptions.length ? true : false,
        icon: 'card',
        disabled: !isConnected,
        isDropdownOpen: false,
        dropdownOptions: cardOptions,
      },
      {
        title: 'Reports',
        isVisible: true,
        icon: 'folder',
        route: ['/', 'enterprise', 'my_reports'],
        disabled: !isConnected,
      },
      {
        title: 'Advances',
        isVisible: this.orgSettings.advances.enabled || this.orgSettings.advance_requests.enabled,
        icon: 'wallet',
        route: ['/', 'enterprise', 'my_advances'],
        disabled: !isConnected,
      },
      {
        title: 'Team',
        isVisible: teamOptions.length ? true : false,
        icon: 'user-three',
        isDropdownOpen: false,
        disabled: !isConnected,
        dropdownOptions: teamOptions,
      },
    ].filter((sidemenuItem) => sidemenuItem.isVisible);

    this.primaryOptionsCount = primaryOptions.length;

    if (cardOptions.length === 1) {
      this.updateSidemenuOption(primaryOptions, 'Cards', {
        ...cardOptions[0],
        icon: 'card',
        disabled: !isConnected,
      });
    }

    if (teamOptions.length === 1) {
      this.updateSidemenuOption(primaryOptions, 'Team', {
        ...teamOptions[0],
        icon: 'user-three',
        disabled: !isConnected,
      });
    }

    return primaryOptions;
  }

  updateSidemenuOption(
    primaryOptions: Partial<SidemenuItem>[],
    dropdownTitle: string,
    updatedOption: Partial<SidemenuItem>
  ) {
    return primaryOptions.splice(
      primaryOptions.findIndex((option) => option.title === dropdownTitle),
      1,
      updatedOption
    );
  }

  getPrimarySidemenuOptionsOffline() {
    return [
      {
        title: 'Dashboard',
        isVisible: true,
        icon: 'dashboard',
        route: ['/', 'enterprise', 'my_dashboard'],
      },
      {
        title: 'Expenses',
        isVisible: true,
        icon: 'list',
        route: ['/', 'enterprise', 'my_expenses'],
      },
      {
        title: 'Settings',
        isVisible: true,
        icon: 'gear',
        route: ['/', 'enterprise', 'my_profile'],
      },
    ];
  }

  getSecondarySidemenuOptions(orgs: Org[], isDelegatee: boolean, isConnected: boolean) {
    return [
      {
        title: 'Delegated Accounts',
        isVisible: isDelegatee && !this.isSwitchedToDelegator,
        icon: 'user-two',
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
        icon: 'gear',
        route: ['/', 'enterprise', 'my_profile'],
      },
      {
        title: 'Live Chat',
        isVisible:
          this.orgUserSettings &&
          this.orgUserSettings.in_app_chat_settings &&
          this.orgUserSettings.in_app_chat_settings.allowed &&
          this.orgUserSettings.in_app_chat_settings.enabled,
        icon: 'chat',
        openLiveChat: true,
        disabled: !isConnected,
      },
      {
        title: 'Help',
        isVisible: true,
        icon: 'question-square-outline',
        route: ['/', 'enterprise', 'help'],
        disabled: !isConnected,
      },
    ].filter((sidemenuItem) => sidemenuItem.isVisible);
  }

  goToProfile(event: Event) {
    if (event.isTrusted) {
      this.router.navigate(['/', 'enterprise', 'my_profile']);
      this.menuController.close();
    }
  }

  setupSideMenu(isConnected?: boolean, orgs?: Org[], isDelegatee?: boolean) {
    if (isConnected) {
      this.filteredSidemenuList = [
        ...this.getPrimarySidemenuOptions(isConnected),
        ...this.getSecondarySidemenuOptions(orgs, isDelegatee, isConnected),
      ];
    } else {
      this.filteredSidemenuList = [...this.getPrimarySidemenuOptionsOffline()];
    }
  }
}
