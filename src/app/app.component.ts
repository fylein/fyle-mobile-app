import { Component, OnInit } from '@angular/core';
import { Platform, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { pipe, forkJoin } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { UserEventService } from 'src/app/core/services/user-event.service';

import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { Org } from 'src/app/core/models/org.model';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  eou: ExtendedOrgUser;
  orgs: Org[]; 
  activeOrg: any; 
  orgSettings: any;
  orgUserSettings: any;
  allowedReportsActions: any;
  allowedAdvancesActions: any;
  allowedTripsActions: any;
  isSwitchedToDelegator: boolean;
  sideMenuList: any[];
  isDelegatee: boolean;

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
    private menuController: MenuController
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
    if (route.indexOf("switch-org") > -1) {
      this.userEventService.clearCache();
      // TODO: Clear all caches also
    }
    
    this.router.navigate(route);
  }

  ngOnInit() {
    const eou$ = this.authService.getEou();
    const orgs$ = this.offlineService.getOrgs();
    const currentOrg$ = this.offlineService.getCurrentOrg();
    const orgSettings$ = this.offlineService.getOrgSettings();
    const orgUserSettings$ = this.orgUserSettingsService.get();
    const delegatedAccounts$ = this.orgUserService.findDelegatedAccounts().pipe(
      map(res => {
        return this.orgUserService.excludeByStatus(res, 'ACTIVE');
      })
    );

    orgSettings$.pipe(
      tap(() => console.log("/")),
      switchMap(orgSettings => {
        // Left with Team view bevuse of some issue in permission service
        console.log(orgSettings);
        const a$ = this.offlineService.getReportActions(orgSettings).pipe(tap(() => console.log("|||||||||")));
        // const b$ = this.offlineService.getReportActions(orgSettings);
        const c$ = this.offlineService.getOrgs();

        return forkJoin({
          c: c$
        })
      })
    ).subscribe(res=> {
      console.log("not coming here");
      console.log(res);
    })


        // PermissionService.allowedActions('advances', ['approve', 'create', 'delete'], orgSettings).then( function (allowedAdvancesActions) {
        //   vm.allowedAdvancesActions = allowedAdvancesActions;
        // });

        // PermissionService.allowedActions('trips', ['approve', 'create', 'edit', 'cancel'], orgSettings).then( function (allowedTripsActions) {
        //   vm.allowedTripsActions = allowedTripsActions;
        // });

        // if (vm.settings.access_delegation.enabled) {
        //   vm.isSwitchedToDelegator = OrgUserService.isSwitchedToDelegator();
        // }

    const primaryData$ = forkJoin({
      eou: eou$,
      orgs: orgs$,
      currentOrg: currentOrg$,
      orgSettings: orgSettings$,
      orgUserSettings: orgUserSettings$,
      delegatedAccounts: delegatedAccounts$
    });

    primaryData$.subscribe((res) => { 

      console.log(res);
      this.eou = res.eou;
      this.orgs = res.orgs;
      this.activeOrg = res.currentOrg;
      this.orgSettings = res.orgSettings;
      this.orgUserSettings = res.orgUserSettings;
      let isDelegatee = res.delegatedAccounts.length > 0;
      // Left with delegator
      //this.orgUserService.isSwitchedToDelegator();

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
          route: ['/', 'enterprise', 'my_dashboard']
        },
        {
          title: 'Reports',
          isVisible: true,
          icon: '../../../assets/svg/fy-reports-new.svg',
          route: ['/', 'enterprise', 'my_dashboard']
        },
        {
          title: 'Advances',
          isVisible: this.orgSettings.advances.enabled || this.orgSettings.advance_requests.enabled,
          icon: '../../../assets/svg/fy-advances-new.svg',
          route: ['/', 'enterprise', 'my_dashboard']
        },
        {
          title: 'Trips',
          isVisible: this.orgSettings.trip_requests.enabled && (!this.orgSettings.trip_requests.enable_for_certain_employee || (this.orgSettings.trip_requests.enable_for_certain_employee && this.orgUserSettings.trip_request_org_user_settings.enabled)),
          icon: '../../../assets/svg/fy-trips-new.svg',
          route: ['/', 'enterprise', 'my_dashboard']
        },
        {
          title: 'Delegated Accounts',
          isVisible: isDelegatee, // need to fix later with permission service
          icon: '../../../assets/svg/fy-delegate-switch.svg',
          route: ['/', 'enterprise', 'my_dashboard']
        },
        {
          title: 'Corporate Cards',
          isVisible: this.orgSettings.corporate_credit_card_settings.enabled,
          icon: '../../../assets/svg/fy-cards-new.svg',
          route: ['/', 'enterprise', 'my_dashboard']
        },
        {
          title: 'Receipts',
          isVisible: this.orgSettings.receipt_settings.enabled,
          icon: '../../../assets/svg/fy-receipts-new.svg',
          route: ['/', 'enterprise', 'my_dashboard']
        },
        {
          title: 'Switch to own account',
          isVisible: true, // need to fix later with permission service
          icon: '../../../assets/svg/fy-switch.svg',
          route: ['/', 'enterprise', 'my_dashboard']
        },
        {
          title: 'Profile',
          isVisible: true,
          icon: '../../../assets/svg/fy-profile-new.svg',
          route: ['/', 'enterprise', 'my_dashboard']
        },
        {
          title: 'Team Reports',
          isVisible: true, // need to fix later with permission service
          icon: '../../../assets/svg/fy-team-reports-new.svg',
          route: ['/', 'enterprise', 'my_dashboard']
        },
        {
          title: 'Team Trips',
          isVisible: true, // need to fix later with permission service
          icon: '../../../assets/svg/fy-team-trips-new.svg',
          route: ['/', 'enterprise', 'my_dashboard']
        },
        {
          title: 'Team Advances',
          isVisible: true, // need to fix later with permission service
          icon: '../../../assets/svg/fy-team-advances-new.svg',
          route: ['/', 'enterprise', 'my_dashboard']
        },
        {
          title: 'Help',
          isVisible: true,
          icon: '../../../assets/svg/fy-help-new.svg',
          route: ['/', 'enterprise', 'my_dashboard']
        },
        {
          title: 'Switch Accounts',
          isVisible: (this.orgs.length > 1),
          icon: '../../../assets/svg/fy-switch-new.svg',
          route: ['/', 'auth', 'switch-org']
        },
      ]
    })




    // Left with isonline/is offline method


  }
}
