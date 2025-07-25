import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { DeviceService } from 'src/app/core/services/device.service';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { SidemenuService } from 'src/app/core/services/sidemenu.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgService } from 'src/app/core/services/org.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { SidemenuComponent } from './sidemenu.component';
import { of, take } from 'rxjs';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, NO_ERRORS_SCHEMA, Output } from '@angular/core';
import { extendedDeviceInfoMockData } from 'src/app/core/mock-data/extended-device-info.data';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { currentEouRes } from 'src/app/core/test-data/org-user.service.spec.data';
import { orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { employeeSettingsData } from 'src/app/core/mock-data/employee-settings.data';
import { cloneDeep } from 'lodash';
import { sidemenuAllowedActions } from 'src/app/core/mock-data/sidemenu-allowed-actions.data';
import {
  sidemenuData1,
  PrimaryOptionsRes1,
  UpdatedOptionsRes,
  PrimaryOptionsRes2,
  getPrimarySidemenuOptionsRes1,
  getSecondarySidemenuOptionsRes1,
  setSideMenuRes,
} from 'src/app/core/mock-data/sidemenu.data';
import { delegatorData } from 'src/app/core/mock-data/platform/v1/delegator.data';
import { SpenderOnboardingService } from 'src/app/core/services/spender-onboarding.service';

describe('SidemenuComponent', () => {
  let component: SidemenuComponent;
  let fixture: ComponentFixture<SidemenuComponent>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let routerAuthService: jasmine.SpyObj<RouterAuthService>;
  let router: jasmine.SpyObj<Router>;
  let menuController: jasmine.SpyObj<MenuController>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let sidemenuService: jasmine.SpyObj<SidemenuService>;
  let launchDarklyService: jasmine.SpyObj<LaunchDarklyService>;
  let orgService: jasmine.SpyObj<OrgService>;
  let authService: jasmine.SpyObj<AuthService>;
  let platformEmployeeSettingsService: jasmine.SpyObj<PlatformEmployeeSettingsService>;
  let spenderOnboardingService: jasmine.SpyObj<SpenderOnboardingService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  @Component({
    selector: 'app-sidemenu',
    template: '<ion-menu></ion-menu>',
  })
  class MockIonMenuComponent {
    @Input() side: string;

    @Input() class: string;

    @Input() contentId: string;

    @Input() swipeGesture: boolean;
  }
  beforeEach(waitForAsync(() => {
    const deviceServiceSpy = jasmine.createSpyObj('DeviceService', ['getDeviceInfo']);
    const routerAuthServiceSpy = jasmine.createSpyObj('RouterAuthService', ['isLoggedIn']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const menuControllerSpy = jasmine.createSpyObj('MenuController', ['close']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', [
      'findDelegatedAccounts',
      'excludeByStatus',
      'isSwitchedToDelegator',
      'getCurrent',
    ]);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const sidemenuServiceSpy = jasmine.createSpyObj('SidemenuService', ['getAllowedActions']);
    const launchDarklyServiceSpy = jasmine.createSpyObj('LaunchDarklyService', ['initializeUser']);
    const orgServiceSpy = jasmine.createSpyObj('OrgService', ['getOrgs', 'getCurrentOrg', 'getPrimaryOrg']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    authServiceSpy.getEou.and.resolveTo(apiEouRes);
    const platformEmployeeSettingsServiceSpy = jasmine.createSpyObj('PlatformEmployeeSettingsService', ['get']);
    const spenderOnboardingServiceSpy = jasmine.createSpyObj('SpenderOnboardingService', [
      'checkForRedirectionToOnboarding',
    ]);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      declarations: [SidemenuComponent],
      imports: [IonicModule.forRoot(), TranslocoModule],
      providers: [
        { provide: DeviceService, useValue: deviceServiceSpy },
        { provide: RouterAuthService, useValue: routerAuthServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MenuController, useValue: menuControllerSpy },
        { provide: OrgUserService, useValue: orgUserServiceSpy },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpy },
        { provide: NetworkService, useValue: networkServiceSpy },
        { provide: SidemenuService, useValue: sidemenuServiceSpy },
        { provide: LaunchDarklyService, useValue: launchDarklyServiceSpy },
        { provide: OrgService, useValue: orgServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: PlatformEmployeeSettingsService, useValue: platformEmployeeSettingsServiceSpy },
        { provide: SpenderOnboardingService, useValue: spenderOnboardingServiceSpy },
        { provide: TranslocoService, useValue: translocoServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
    routerAuthService = TestBed.inject(RouterAuthService) as jasmine.SpyObj<RouterAuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    menuController = TestBed.inject(MenuController) as jasmine.SpyObj<MenuController>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    sidemenuService = TestBed.inject(SidemenuService) as jasmine.SpyObj<SidemenuService>;
    launchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;
    orgService = TestBed.inject(OrgService) as jasmine.SpyObj<OrgService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    platformEmployeeSettingsService = TestBed.inject(
      PlatformEmployeeSettingsService
    ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
    spenderOnboardingService = TestBed.inject(SpenderOnboardingService) as jasmine.SpyObj<SpenderOnboardingService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'sidemenu.personalCards': 'Personal cards',
        'sidemenu.expenseReports': 'Expense reports',
        'sidemenu.advances': 'Advances',
        'sidemenu.home': 'Home',
        'sidemenu.getStarted': 'Get started',
        'sidemenu.myExpenses': 'My expenses',
        'sidemenu.cards': 'Cards',
        'sidemenu.myExpenseReports': 'My expense reports',
        'sidemenu.myAdvances': 'My advances',
        'sidemenu.team': 'Team',
        'sidemenu.settings': 'Settings',
        'sidemenu.delegatedAccounts': 'Delegated accounts',
        'sidemenu.switchBackToMyAccount': 'Switch back to my account',
        'sidemenu.switchOrganization': 'Switch organization',
        'sidemenu.liveChat': 'Live chat',
        'sidemenu.help': 'Help',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });
    networkService.connectivityWatcher.and.returnValue(new EventEmitter());

    spyOn(document, 'getElementById').and.returnValue(document.createElement('div'));
    fixture = TestBed.createComponent(SidemenuComponent);
    component = fixture.componentInstance;
    component.eou = apiEouRes;

    Object.freeze(orgSettingsRes);
    Object.freeze(employeeSettingsData);
    Object.freeze(orgData1);

    component.orgSettings = cloneDeep(orgSettingsRes);
    component.employeeSettings = cloneDeep(employeeSettingsData);
    component.allowedActions = sidemenuAllowedActions;
    component.activeOrg = { name: apiEouRes.ou.org_name };
    component.appVersion = extendedDeviceInfoMockData.appVersion;
    component.isConnected$ = of(true);
    component.isSwitchedToDelegator = false;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('setupNetworkWatcher(): should setup the network watcher', fakeAsync(() => {
    networkService.isOnline.and.returnValue(of(true));
    const eventEmitterMock = new EventEmitter<boolean>();
    networkService.connectivityWatcher.and.returnValue(eventEmitterMock);

    component.setupNetworkWatcher();
    component.isConnected$.pipe(take(1)).subscribe((connectionStatus) => {
      expect(connectionStatus).toBeTrue();
    });
    eventEmitterMock.emit(false);
    tick(500);
    component.isConnected$.pipe(take(1)).subscribe((connectionStatus) => {
      expect(connectionStatus).toBeFalse();
    });
  }));

  describe('showSideMenuOffline():', () => {
    it('should show the sidemenu when offline', fakeAsync(() => {
      const setupSidemenuSpy = spyOn(component, 'setupSideMenu');
      deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData));
      component.showSideMenuOffline();
      tick(500);
      fixture.detectChanges();
      expect(component.appVersion).toEqual(extendedDeviceInfoMockData.appVersion);
      expect(component.activeOrg).toEqual({ name: apiEouRes.ou.org_name });
      expect(setupSidemenuSpy).toHaveBeenCalledTimes(1);
    }));

    it('should show the sidemenu when offline along with app version', fakeAsync(() => {
      const setupSidemenuSpy = spyOn(component, 'setupSideMenu');
      deviceService.getDeviceInfo.and.returnValue(of(null));
      component.showSideMenuOffline();
      tick(500);
      fixture.detectChanges();
      expect(component.appVersion).toEqual('1.2.3');
      expect(component.activeOrg).toEqual({ name: apiEouRes.ou.org_name });
      expect(setupSidemenuSpy).toHaveBeenCalledTimes(1);
    }));
  });

  it('getPrimarySidemenuOptionsOffline(): should get the primary sidemenu options when offline', () => {
    const primaryMenuOptions = component.getPrimarySidemenuOptionsOffline();
    fixture.detectChanges();

    expect(primaryMenuOptions.length).toBe(3);
    primaryMenuOptions.forEach((option, index) => {
      expect(option.title).toBe(sidemenuData1[index].title);
      expect(option.icon).toBe(sidemenuData1[index].icon);
      expect(option.route).toEqual(sidemenuData1[index].route);
    });
  });

  it('getCardOptions: should get card options', () => {
    component.orgSettings = {
      ...orgSettingsRes,
      org_personal_cards_settings: {
        allowed: true,
        enabled: true,
      },
    };

    const cardOpt = component.getCardOptions(false);
    fixture.detectChanges();
    expect(cardOpt).toEqual([
      {
        title: 'Personal cards',
        isVisible: true,
        route: ['/', 'enterprise', 'personal_cards'],
      },
    ]);
  });

  it('getTeamOptions: should get team options', () => {
    component.allowedActions = sidemenuAllowedActions;
    const teamOpt = component.getTeamOptions(false);
    fixture.detectChanges();
    expect(teamOpt.length).toBe(2);
    expect(teamOpt).toEqual([
      {
        title: 'Expense reports',
        isVisible: component.allowedActions.allowedReportsActions?.approve,
        route: ['/', 'enterprise', 'team_reports'],
      },
      {
        title: 'Advances',
        isVisible: component.allowedActions.allowedAdvancesActions?.approve,
        route: ['/', 'enterprise', 'team_advance'],
      },
    ]);
  });

  it('updateSidemenuOption(): should update the sidemenu option', () => {
    const primOpt = PrimaryOptionsRes1.concat(PrimaryOptionsRes2);
    const updSidemenuOpt = component.updateSidemenuOption(primOpt, 'Cards', UpdatedOptionsRes);
    fixture.detectChanges();
    expect(updSidemenuOpt).toEqual(PrimaryOptionsRes2);
  });

  describe('getPrimarySidemenuOptions():', () => {
    it('should get the primary sidemenu options', () => {
      const primOpt = PrimaryOptionsRes1.concat(PrimaryOptionsRes2);
      const resData = primOpt.filter((option) => option.title !== 'Personal cards');
      const cardOptSpy = spyOn(component, 'getCardOptions').and.returnValue([]);
      const teamOptSpy = spyOn(component, 'getTeamOptions').and.returnValue([]);
      const result = component.getPrimarySidemenuOptions(true, false);
      fixture.detectChanges();
      expect(result.length).toBe(4);
      result.forEach((option, index) => {
        expect(option.title).toBe(resData[index].title);
        expect(option.icon).toBe(resData[index].icon);
        expect(option.route).toEqual(resData[index].route);
        expect(option.icon).toEqual(resData[index].icon);
      });
      expect(cardOptSpy).toHaveBeenCalledTimes(1);
      expect(teamOptSpy).toHaveBeenCalledTimes(1);
    });

    it('should show the card option if there is at least one card option available', () => {
      const resData = PrimaryOptionsRes1;
      const teamOptSpy = spyOn(component, 'getTeamOptions').and.returnValue([]);
      const cardOptSpy = spyOn(component, 'getCardOptions').and.returnValue([
        {
          title: 'Personal cards',
          isVisible: true,
          route: ['/', 'enterprise', 'personal_cards'],
        },
      ]);
      const result = component.getPrimarySidemenuOptions(true, false);
      fixture.detectChanges();
      expect(result.length).toBe(5);
      result.forEach((option, index) => {
        expect(option.title).toBe(resData[index].title);
        expect(option.icon).toBe(resData[index].icon);
        expect(option.route).toEqual(resData[index].route);
        expect(option.icon).toEqual(resData[index].icon);
      });
      expect(cardOptSpy).toHaveBeenCalledTimes(1);
      expect(teamOptSpy).toHaveBeenCalledTimes(1);
    });

    it('should show the team option if there is at least one team option available', () => {
      const resData = getPrimarySidemenuOptionsRes1;
      const cardOptSpy = spyOn(component, 'getCardOptions').and.returnValue([]);
      const teamOptSpy = spyOn(component, 'getTeamOptions').and.returnValue([
        {
          title: 'Expense reports',
          isVisible: true,
          route: ['/', 'enterprise', 'team_reports'],
        },
      ]);
      const result = component.getPrimarySidemenuOptions(true, false);
      fixture.detectChanges();
      expect(result.length).toBe(5);
      result.forEach((option, index) => {
        expect(option.title).toBe(resData[index].title);
        expect(option.icon).toBe(resData[index].icon);
        expect(option.route).toEqual(resData[index].route);
        expect(option.icon).toEqual(resData[index].icon);
      });
      expect(cardOptSpy).toHaveBeenCalledTimes(1);
      expect(teamOptSpy).toHaveBeenCalledTimes(1);
    });

    it('should show Advances option when advance request is enabled', () => {
      component.orgSettings.advances.enabled = false;
      component.orgSettings.advance_requests.enabled = true;
      const resData = [
        {
          title: 'Home',
          isVisible: true,
          icon: 'dashboard',
          route: ['/', 'enterprise', 'my_dashboard'],
        },
        {
          title: 'My expenses',
          isVisible: true,
          icon: 'list',
          route: ['/', 'enterprise', 'my_expenses'],
        },
        {
          title: 'My expense reports',
          isVisible: true,
          icon: 'folder',
          route: ['/', 'enterprise', 'my_reports'],
          disabled: false,
        },
        {
          title: 'My advances',
          isVisible: component.orgSettings.advance_requests.enabled,
          icon: 'wallet',
          route: ['/', 'enterprise', 'my_advances'],
          disabled: false,
        },
        {
          title: 'Team',
          isVisible: true,
          icon: 'user-three',
          isDropdownOpen: false,
          disabled: false,
          dropdownOptions: [
            {
              title: 'Expense reports',
              isVisible: true,
              route: ['/', 'enterprise', 'team_reports'],
            },
            {
              title: 'Advances',
              isVisible: true,
              route: ['/', 'enterprise', 'team_advance'],
            },
          ],
        },
      ];

      const result = component.getPrimarySidemenuOptions(true, false);
      fixture.detectChanges();
      expect(result.length).toBe(5);
      result.forEach((option, index) => {
        expect(option.title).toBe(resData[index].title);
        expect(option.icon).toBe(resData[index].icon);
        expect(option.route).toEqual(resData[index].route);
        expect(option.icon).toEqual(resData[index].icon);
      });
    });
  });

  describe('getSecondarySidemenuOptions():', () => {
    it('should get the secondary options', () => {
      const resData = getSecondarySidemenuOptionsRes1;
      const result = component.getSecondarySidemenuOptions(orgData1, true, true, false);
      fixture.detectChanges();
      expect(result.length).toBe(4);
      result.forEach((option, index) => {
        expect(option.title).toBe(resData[index].title);
        expect(option.icon).toBe(resData[index].icon);
        expect(option.route).toEqual(resData[index].route);
        expect(option.icon).toEqual(resData[index].icon);
      });
    });

    it('should not show the Delegated Accounts option when there is no delegatee', () => {
      const resData = getSecondarySidemenuOptionsRes1.filter((option) => option.title !== 'Delegated accounts');
      const result = component.getSecondarySidemenuOptions(orgData1, false, true, false);
      fixture.detectChanges();
      expect(result.length).toBe(3);
      result.forEach((option, index) => {
        expect(option.title).toBe(resData[index].title);
        expect(option.icon).toBe(resData[index].icon);
        expect(option.route).toEqual(resData[index].route);
        expect(option.icon).toEqual(resData[index].icon);
      });
    });

    it('should show Switch Organization option if not switched to delegator', () => {
      const orgData2 = [...orgData1, ...orgData1];
      component.isSwitchedToDelegator = false;
      const resData = [
        {
          title: 'Delegated accounts',
          isVisible: true,
          icon: 'user-two',
          route: ['/', 'enterprise', 'delegated_accounts'],
          disabled: false,
        },
        {
          title: 'Switch organization',
          isVisible: orgData2.length > 1 && !component.isSwitchedToDelegator,
          icon: 'swap',
          route: ['/', 'auth', 'switch_org', { choose: true, navigate_back: true }],
          disabled: false,
        },
        {
          title: 'Settings',
          isVisible: true,
          icon: 'gear',
          route: ['/', 'enterprise', 'my_profile'],
        },
        {
          title: 'Live chat',
          isVisible: true,
          icon: 'chat',
          openLiveChat: true,
          disabled: false,
        },
        {
          title: 'Help',
          isVisible: true,
          icon: 'question-square-outline',
          route: ['/', 'enterprise', 'help'],
          disabled: false,
        },
      ];
      const result = component.getSecondarySidemenuOptions(orgData2, true, true, false);
      fixture.detectChanges();
      expect(result.length).toBe(5);
      result.forEach((option, index) => {
        expect(option.title).toBe(resData[index].title);
        expect(option.icon).toBe(resData[index].icon);
        expect(option.route).toEqual(resData[index].route);
        expect(option.icon).toEqual(resData[index].icon);
      });
    });
  });

  describe('setupSideMenu(): ', () => {
    beforeEach(() => {
      spenderOnboardingService.checkForRedirectionToOnboarding.and.returnValue(of(false));
    });

    it('should setup the side menu', fakeAsync(() => {
      const getPrimarySidemenuOptionsSpy = spyOn(component, 'getPrimarySidemenuOptions').and.returnValue(
        getPrimarySidemenuOptionsRes1
      );
      const getSecondarySidemenuOptionsSpy = spyOn(component, 'getSecondarySidemenuOptions').and.returnValue(
        getSecondarySidemenuOptionsRes1
      );
      const resData = setSideMenuRes;
      component.setupSideMenu(true, orgData1, true);
      tick();
      fixture.detectChanges();
      expect(component.filteredSidemenuList).toEqual(resData);
      expect(getPrimarySidemenuOptionsSpy).toHaveBeenCalledOnceWith(true, false);
      expect(getSecondarySidemenuOptionsSpy).toHaveBeenCalledOnceWith(orgData1, true, true, false);
    }));

    it('should only get the primary options when there is no internet connection', fakeAsync(() => {
      const getPrimarySidemenuOptionsOfflineSpy = spyOn(component, 'getPrimarySidemenuOptionsOffline').and.returnValue(
        sidemenuData1
      );
      const resData = sidemenuData1;
      component.setupSideMenu(false, orgData1, false);
      fixture.detectChanges();
      tick();
      expect(component.filteredSidemenuList).toEqual(resData);
      expect(getPrimarySidemenuOptionsOfflineSpy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('goToProfile():', () => {
    it('should navigate to my profile page and close the menu when isTrusted is true', () => {
      const event = { isTrusted: true };
      component.goToProfile(event as Event);
      fixture.detectChanges();
      expect(router.navigate).toHaveBeenCalledWith(['/', 'enterprise', 'my_profile']);
      expect(menuController.close).toHaveBeenCalledTimes(1);
    });

    it('should navigate to my profile page and close the menu when isTrusted is false', () => {
      const event = { isTrusted: false };
      component.goToProfile(event as Event);
      fixture.detectChanges();
      expect(router.navigate).not.toHaveBeenCalledWith(['/', 'enterprise', 'my_profile']);
      expect(menuController.close).not.toHaveBeenCalledTimes(1);
    });
  });

  describe('showSideMenuOnline', () => {
    it('should return false when there is internet connection and the user is not logged in', fakeAsync(() => {
      routerAuthService.isLoggedIn.and.resolveTo(false);
      component.showSideMenuOnline();
      tick(500);
      expect(routerAuthService.isLoggedIn).toHaveBeenCalledTimes(1);
    }));

    it('should return true when there is internet connection and the user is logged in', fakeAsync(() => {
      component.isConnected$ = of(true);
      routerAuthService.isLoggedIn.and.resolveTo(true);
      orgService.getOrgs.and.returnValue(of(orgData1));
      orgService.getCurrentOrg.and.returnValue(of(orgData1[0]));
      orgService.getPrimaryOrg.and.returnValue(of(orgData1[0]));
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));
      orgUserService.findDelegatedAccounts.and.returnValue(of([delegatorData]));
      deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData));
      orgUserService.isSwitchedToDelegator.and.resolveTo(false);
      orgUserService.getCurrent.and.returnValue(of(currentEouRes));

      sidemenuService.getAllowedActions.and.returnValue(of(sidemenuAllowedActions));
      spenderOnboardingService.checkForRedirectionToOnboarding.and.returnValue(of(false));

      component.showSideMenuOnline();
      tick(500);
      expect(routerAuthService.isLoggedIn).toHaveBeenCalledTimes(1);
      expect(orgService.getOrgs).toHaveBeenCalledTimes(1);
      expect(orgUserService.isSwitchedToDelegator).toHaveBeenCalledTimes(1);
      expect(sidemenuService.getAllowedActions).toHaveBeenCalledTimes(1);
      expect(orgService.getCurrentOrg).toHaveBeenCalledTimes(1);
      expect(orgService.getPrimaryOrg).toHaveBeenCalledTimes(1);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      expect(platformEmployeeSettingsService.get).toHaveBeenCalledTimes(1);
      expect(orgUserService.findDelegatedAccounts).toHaveBeenCalledTimes(1);
      expect(deviceService.getDeviceInfo).toHaveBeenCalledTimes(1);
    }));
  });
});
