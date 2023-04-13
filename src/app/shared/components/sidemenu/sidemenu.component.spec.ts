import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
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
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { SidemenuComponent } from './sidemenu.component';
import { of, take } from 'rxjs';
import { IonContent } from '@ionic/angular';

import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';

import { SidemenuContentComponent } from './sidemenu-content/sidemenu-content.component';
import { SidemenuFooterComponent } from './sidemenu-footer/sidemenu-footer.component';
import { SidemenuHeaderComponent } from './sidemenu-header/sidemenu-header.component';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { extendedDeviceInfoMockData } from 'src/app/core/mock-data/extended-device-info.data';

fdescribe('SidemenuComponent', () => {
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
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;

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
    const orgServiceSpy = jasmine.createSpyObj('OrgService', ['getOrgs', 'getCurrentOrg']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    authServiceSpy.getEou.and.returnValue(Promise.resolve(apiEouRes));
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get']);

    TestBed.configureTestingModule({
      declarations: [SidemenuComponent],
      imports: [IonicModule.forRoot()],
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
        { provide: OrgUserSettingsService, useValue: orgUserSettingsServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;

    networkService.connectivityWatcher.and.returnValue(new EventEmitter());
    fixture = TestBed.createComponent(SidemenuComponent);
    component = fixture.componentInstance;
    component.eou = apiEouRes;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('setupNetworkWatcher', fakeAsync(() => {
    networkService.isOnline.and.returnValue(of(true));
    const eventEmitterMock = new EventEmitter<boolean>();
    networkService.connectivityWatcher.and.returnValue(eventEmitterMock);

    component.setupNetworkWatcher();
    component.isConnected$.pipe(take(1)).subscribe((connectionStatus) => {
      expect(connectionStatus).toEqual(true);
    });
    eventEmitterMock.emit(false);
    tick(500);
    component.isConnected$.pipe(take(1)).subscribe((connectionStatus) => {
      expect(connectionStatus).toEqual(false);
    });
  }));

  fit('showSideMenuOffline', fakeAsync(() => {
    deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData));
    component.showSideMenuOffline();
    tick(500);
    fixture.detectChanges();

    expect(component.appVersion).toEqual(extendedDeviceInfoMockData.appVersion);
    expect(component.activeOrg).toEqual({ name: apiEouRes.ou.org_name });
  }));

  // xit("showSideMenuOnline", () => { });
  // xit("getCardOptions", () => { });
  // xit("getTeamOptions", () => { });
  // xit("getPrimarySidemenuOptions", () => { });
  // xit("updateSidemenuOption", () => { });
  // xit("getPrimarySidemenuOptionsOffline", () => { });
  // xit("getSecondarySidemenuOptions", () => { });
  // xit("goToProfile", () => { });
  // xit("setupSideMenu", () => { });
});
