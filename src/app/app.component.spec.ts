import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { Platform, MenuController } from '@ionic/angular/standalone';
import { NavigationEnd, Router } from '@angular/router';

import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { AppVersionService } from './core/services/app-version.service';
import { RouterAuthService } from './core/services/router-auth.service';
import { NetworkService } from './core/services/network.service';
import { FreshChatService } from './core/services/fresh-chat.service';
import { SpenderOnboardingService } from './core/services/spender-onboarding.service';
import { FooterService } from './core/services/footer.service';
import { TasksService } from './core/services/tasks.service';
import { of } from 'rxjs';
import { FooterState } from './shared/components/footer/footer-state.enum';
import { TrackingService } from './core/services/tracking.service';
import { NavController } from '@ionic/angular/standalone';
import { UserEventService } from './core/services/user-event.service';
import { DeviceService } from './core/services/device.service';
import { GmapsService } from './core/services/gmaps.service';

import { SplashScreen } from '@capacitor/splash-screen';
import { BackButtonService } from './core/services/back-button.service';
import { getTranslocoTestingModule } from './core/testing/transloco-testing.utils';
import { SidemenuComponent } from './shared/components/sidemenu/sidemenu.component';
import { FyConnectionComponent } from './shared/components/fy-connection/fy-connection.component';
import { FooterComponent } from './shared/components/footer/footer.component';

// mock side menu component
@Component({
  selector: 'app-sidemenu',
})
class MockSidemenuComponent {}

// mock connection component
@Component({
  selector: 'app-fy-connection',
})
class MockFyConnectionComponent {}

// mock footer component
@Component({
  selector: 'app-fy-footer',
})
class MockFyFooterComponent {}

describe('AppComponent', () => {
  let platformReadySpy;
  let platformSpy: jasmine.SpyObj<Platform>;
  let authService: jasmine.SpyObj<AuthService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let appVersionService: jasmine.SpyObj<AppVersionService>;
  let routerAuthService: jasmine.SpyObj<RouterAuthService>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let freshChatService: jasmine.SpyObj<FreshChatService>;
  let spenderOnboardingService: jasmine.SpyObj<SpenderOnboardingService>;
  let footerService: jasmine.SpyObj<FooterService>;
  let tasksService: jasmine.SpyObj<TasksService>;
  let router: jasmine.SpyObj<Router>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let navController: jasmine.SpyObj<NavController>;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let gmapsService: jasmine.SpyObj<GmapsService>;
  let menuController: jasmine.SpyObj<MenuController>;
  let backButtonService: jasmine.SpyObj<BackButtonService>;
  beforeEach(waitForAsync(() => {
    platformReadySpy = Promise.resolve();
    platformSpy = jasmine.createSpyObj('Platform', { ready: platformReadySpy });
    const backButtonSpy = jasmine.createSpyObj('backButton', ['subscribeWithPriority']);
    backButtonSpy.subscribeWithPriority.and.callFake((priority: number, callback: () => void) => {
      // Store the callback for later use in tests
      backButtonSpy.lastCallback = callback;
      return { unsubscribe: jasmine.createSpy('unsubscribe') };
    });
    platformSpy.backButton = backButtonSpy;
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const appVersionServiceSpy = jasmine.createSpyObj('AppVersionService', ['load', 'getUserAppVersionDetails']);
    const routerAuthServiceSpy = jasmine.createSpyObj('RouterAuthService', ['isLoggedIn']);
    routerAuthServiceSpy.isLoggedIn.and.returnValue(of(true));
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline'], {
      isOnline$: of(true),
    });
    networkServiceSpy.isOnline.and.returnValue(of(true));
    const freshChatServiceSpy = jasmine.createSpyObj('FreshChatService', ['destroy']);
    const spenderOnboardingServiceSpy = jasmine.createSpyObj('SpenderOnboardingService', [
      'setOnboardingStatusAsComplete',
    ]);
    const footerServiceSpy = jasmine.createSpyObj('FooterService', ['updateCurrentStateIndex', 'updateSelectionMode'], {
      selectionMode$: of(false),
      footerCurrentStateIndex$: of(1),
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'parseUrl'], {
      url: '',
      events: of(new NavigationEnd(1, '/test', '/test')),
    });
    // Configure parseUrl to return a mock UrlTree
    routerSpy.parseUrl.and.returnValue({
      root: {
        children: {
          primary: {
            segments: [{ path: 'my_dashboard', parameters: {} }],
          },
        },
      },
      queryParams: { state: 'home' },
    });
    const tasksServiceSpy = jasmine.createSpyObj('TasksService', ['getTotalTaskCount']);
    tasksServiceSpy.getTotalTaskCount.and.returnValue(of(0));
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'tasksPageOpened',
      'footerHomeTabClicked',
      'footerExpensesTabClicked',
      'footerReportsTabClicked',
    ]);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['navigateRoot', 'back']);
    spenderOnboardingServiceSpy.setOnboardingStatusAsComplete.and.returnValue(of(null));
    const userEventServiceSpy = jasmine.createSpyObj('UserEventService', {
      onSetToken: (callback) => callback(),
      onLogout: (callback) => callback(),
    });
    const deviceServiceSpy = jasmine.createSpyObj('DeviceService', ['getDeviceInfo']);
    const gmapsServiceSpy = jasmine.createSpyObj('GmapsService', ['loadLibrary']);
    const menuControllerSpy = jasmine.createSpyObj('MenuController', ['swipeGesture']);
    const backButtonServiceSpy = jasmine.createSpyObj('BackButtonService', ['showAppCloseAlert']);

    // Configure tracking service with missing methods
    trackingServiceSpy.updateIdentityIfNotPresent = jasmine.createSpy('updateIdentityIfNotPresent').and.resolveTo();
    trackingServiceSpy.onSignOut = jasmine.createSpy('onSignOut');
    TestBed.configureTestingModule({
      imports: [getTranslocoTestingModule(), AppComponent],
      providers: [
        { provide: Platform, useValue: platformSpy },
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {
                state: 'tasks',
              },
              params: {},
            },
          },
        },
        { provide: AppVersionService, useValue: appVersionServiceSpy },
        { provide: RouterAuthService, useValue: routerAuthServiceSpy },
        { provide: NetworkService, useValue: networkServiceSpy },
        { provide: FreshChatService, useValue: freshChatServiceSpy },
        { provide: SpenderOnboardingService, useValue: spenderOnboardingServiceSpy },
        { provide: FooterService, useValue: footerServiceSpy },
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: NavController, useValue: navControllerSpy },
        { provide: UserEventService, useValue: userEventServiceSpy },
        { provide: DeviceService, useValue: deviceServiceSpy },
        { provide: GmapsService, useValue: gmapsServiceSpy },
        { provide: MenuController, useValue: menuControllerSpy },
        { provide: BackButtonService, useValue: backButtonServiceSpy },
      ],
    }).overrideComponent(AppComponent, {
      remove: {
        imports: [SidemenuComponent, FyConnectionComponent, FooterComponent],
      },
      add: {
        imports: [MockSidemenuComponent, MockFyConnectionComponent, MockFyFooterComponent],
        schemas: [NO_ERRORS_SCHEMA]
      },
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    appVersionService = TestBed.inject(AppVersionService) as jasmine.SpyObj<AppVersionService>;
    routerAuthService = TestBed.inject(RouterAuthService) as jasmine.SpyObj<RouterAuthService>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    freshChatService = TestBed.inject(FreshChatService) as jasmine.SpyObj<FreshChatService>;
    spenderOnboardingService = TestBed.inject(SpenderOnboardingService) as jasmine.SpyObj<SpenderOnboardingService>;
    footerService = TestBed.inject(FooterService) as jasmine.SpyObj<FooterService>;
    tasksService = TestBed.inject(TasksService) as jasmine.SpyObj<TasksService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    navController = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
    gmapsService = TestBed.inject(GmapsService) as jasmine.SpyObj<GmapsService>;
    menuController = TestBed.inject(MenuController) as jasmine.SpyObj<MenuController>;
    backButtonService = TestBed.inject(BackButtonService) as jasmine.SpyObj<BackButtonService>;
  }));

  describe('ngAfterViewInit', () => {
    let splashScreenSpy: jasmine.SpyObj<typeof SplashScreen>;

    beforeEach(() => {
      splashScreenSpy = jasmine.createSpyObj('SplashScreen', ['hide']);
      splashScreenSpy.hide.and.resolveTo();
      // Replace the global SplashScreen object
      Object.defineProperty(window, 'SplashScreen', {
        value: splashScreenSpy,
        writable: true,
        configurable: true,
      });
      jasmine.clock().install();
      jasmine.clock().mockDate();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
      // Clean up the global SplashScreen object
      delete (window as any).SplashScreen;
    });

    it('should initialize after view is ready', async () => {
      const fixture = TestBed.createComponent(AppComponent);
      const component = fixture.componentInstance;
      component.isLoading = true;
      component.isUserLoggedIn = true;
      component.isOnline = true;

      // Mock sidemenuRef
      const sidemenuSpy = jasmine.createSpyObj('SidemenuComponent', ['showSideMenuOnline', 'showSideMenuOffline']);
      component.sidemenuRef = sidemenuSpy;

      // Mock router events
      (router.events as any) = of(new NavigationEnd(1, '/test', '/test'));

      // Initialize component
      component.ngOnInit();

      // Create a promise that resolves when platform is ready
      let platformReadyResolve: (value: string) => void;
      const platformReadyPromise = new Promise<string>((resolve) => {
        platformReadyResolve = resolve;
      });
      platformSpy.ready.and.returnValue(platformReadyPromise);

      // Call ngAfterViewInit
      component.ngAfterViewInit();

      // Resolve platform ready
      platformReadyResolve('ready');
      await platformReadyPromise;

      // Fast-forward the setTimeout
      jasmine.clock().tick(1500);

      // Wait for all promises to resolve
      await fixture.whenStable();

      // Run change detection
      fixture.detectChanges();

      // Fast-forward any remaining timers
      jasmine.clock().tick(1000);

      expect(component.isLoading).toBeFalse();
    });
  });

  xdescribe('sidemenu initialization', () => {
    it('should show online menu when user is logged in and online', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const component = fixture.componentInstance;

      component.sidemenuRef = {
        showSideMenuOnline: jasmine.createSpy('showSideMenuOnline'),
        showSideMenuOffline: jasmine.createSpy('showSideMenuOffline'),
      } as any;

      component.isUserLoggedIn = true;
      component.isOnline = true;

      // Trigger token set event
      userEventService.onSetToken.calls.mostRecent().args[0]();
      jasmine.clock().tick(500);

      expect(component.sidemenuRef.showSideMenuOnline).toHaveBeenCalled();
      expect(component.sidemenuRef.showSideMenuOffline).not.toHaveBeenCalled();
    });

    it('should show offline menu when user is logged in but offline', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const component = fixture.componentInstance;

      component.sidemenuRef = {
        showSideMenuOnline: jasmine.createSpy('showSideMenuOnline'),
        showSideMenuOffline: jasmine.createSpy('showSideMenuOffline'),
      } as any;

      component.isUserLoggedIn = true;
      component.isOnline = false;

      // Trigger token set event
      userEventService.onSetToken.calls.mostRecent().args[0]();
      jasmine.clock().tick(500);

      expect(component.sidemenuRef.showSideMenuOnline).not.toHaveBeenCalled();
      expect(component.sidemenuRef.showSideMenuOffline).toHaveBeenCalled();
    });

    it('should not show menu when sidemenuRef is not available', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const component = fixture.componentInstance;

      component.sidemenuRef = null;
      component.isUserLoggedIn = true;
      component.isOnline = true;

      // Trigger token set event
      userEventService.onSetToken.calls.mostRecent().args[0]();
      jasmine.clock().tick(500);

      // Should not throw any error
      expect().nothing();
    });
  });

  describe('registerBackButtonAction', () => {
    let fixture: ComponentFixture<AppComponent>;
    let component: AppComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
    });

    it('should show app close alert when on sign in page', () => {
      Object.defineProperty(router, 'url', { get: () => '/auth/sign_in' });

      component.registerBackButtonAction();
      const callback = (platformSpy.backButton as any).lastCallback;
      callback();

      expect(backButtonService.showAppCloseAlert).toHaveBeenCalled();
    });

    it('should navigate back when on switch_org page with enterprise in previous url', () => {
      Object.defineProperty(router, 'url', { get: () => '/auth/switch_org' });
      component.previousUrl = '/enterprise/some-page';

      component.registerBackButtonAction();
      const callback = (platformSpy.backButton as any).lastCallback;
      callback();

      expect(navController.back).toHaveBeenCalled();
    });

    it('should navigate to dashboard when on switch_org page without enterprise in previous url', () => {
      Object.defineProperty(router, 'url', { get: () => '/auth/switch_org' });
      component.previousUrl = '/some-other-page';

      component.registerBackButtonAction();
      const callback = (platformSpy.backButton as any).lastCallback;
      callback();

      expect(router.navigate).toHaveBeenCalledWith(['/', 'enterprise', 'my_dashboard']);
    });

    it('should navigate back when on delegated_accounts page with enterprise in previous url', () => {
      Object.defineProperty(router, 'url', { get: () => '/auth/delegated_accounts' });
      component.previousUrl = '/enterprise/some-page';

      component.registerBackButtonAction();
      const callback = (platformSpy.backButton as any).lastCallback;
      callback();

      expect(navController.back).toHaveBeenCalled();
    });

    it('should navigate back for any other page', () => {
      Object.defineProperty(router, 'url', { get: () => '/some-other-page' });

      component.registerBackButtonAction();
      const callback = (platformSpy.backButton as any).lastCallback;
      callback();

      expect(navController.back).toHaveBeenCalled();
    });
  });

  it('should create the app', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should initialize the app', async () => {
    TestBed.createComponent(AppComponent);
    expect(platformSpy.ready).toHaveBeenCalled();
    await platformReadySpy;
  });

  it('should navigate to home when onHomeClicked() is called', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.debugElement.componentInstance;
    component.currentPath = 'my_dashboard';
    component.onHomeClicked();
    expect(component.currentActiveState).toBe(FooterState.HOME);
    expect(footerService.updateCurrentStateIndex).toHaveBeenCalledWith(0);
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: activatedRoute,
      queryParams: { state: 'home' },
    });
    expect(trackingService.footerHomeTabClicked).toHaveBeenCalledWith({
      page: 'Dashboard',
    });
  });

  it('should navigate to tasks when onTasksClicked() is called', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.debugElement.componentInstance;
    component.currentPath = 'my_dashboard';
    component.onTaskClicked();
    expect(component.currentActiveState).toBe(FooterState.TASKS);
    expect(footerService.updateCurrentStateIndex).toHaveBeenCalledWith(1);
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: activatedRoute,
      queryParams: { state: 'tasks' },
    });
    expect(trackingService.tasksPageOpened).toHaveBeenCalledWith({
      Asset: 'Mobile',
      from: 'Dashboard',
    });
  });

  it('should navigate to camera when onCameraClicked() is called', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.debugElement.componentInstance;
    component.onCameraClicked();
    expect(router.navigate).toHaveBeenCalledWith([
      '/',
      'enterprise',
      'camera_overlay',
      {
        navigate_back: true,
      },
    ]);
  });

  it('should navigate to expenses when onExpensesClicked() is called', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.debugElement.componentInstance;
    component.onExpensesClicked();
    expect(router.navigate).toHaveBeenCalledWith([
      '/',
      'enterprise',
      'my_expenses',
      {
        navigate_back: true,
      },
    ]);
    expect(trackingService.footerExpensesTabClicked).toHaveBeenCalledTimes(1);
  });

  it('should navigate to reports when onReportsClicked() is called', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.debugElement.componentInstance;
    component.onReportsClicked();
    expect(router.navigate).toHaveBeenCalledWith([
      '/',
      'enterprise',
      'my_reports',
      {
        navigate_back: true,
      },
    ]);
    expect(trackingService.footerReportsTabClicked).toHaveBeenCalledTimes(1);
  });

  it('should update isSwitchedToDelegator when switchDelegator() is called', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.debugElement.componentInstance;

    component.switchDelegator(true);
    expect(component.isSwitchedToDelegator).toBeTrue();

    component.switchDelegator(false);
    expect(component.isSwitchedToDelegator).toBeFalse();
  });

  it('getShowFooter() should call getTotalTasksCount and handleRouteChanges', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.debugElement.componentInstance;
    spyOn(component, 'getTotalTasksCount');
    spyOn(component, 'handleRouteChanges');
    component.getShowFooter();
    expect(component.getTotalTasksCount).toHaveBeenCalledTimes(1);
    expect(component.handleRouteChanges).toHaveBeenCalledTimes(1);
  });

  it('getStateFromPath() should return correct state when query parameter exists', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.debugElement.componentInstance;
    const path = 'my_dashboard?state=tasks';
    const state = component.getStateFromPath(path);
    expect(state).toBe('tasks');
  });

  it('getStateFromPath() should return null when no query parameter exists', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.debugElement.componentInstance;
    const path = 'my_dashboard';
    const state = component.getStateFromPath(path);
    expect(state).toBeNull();
  });

  it('updateFooterState() should set currentActiveState and update index for my_dashboard without tasks state', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.debugElement.componentInstance;
    component.currentPath = 'my_dashboard';
    component.updateFooterState(null);
    expect(component.currentActiveState).toBe(FooterState.HOME);
    expect(footerService.updateCurrentStateIndex).toHaveBeenCalledWith(0);
  });

  it('updateFooterState() should set currentActiveState for my_expenses', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.debugElement.componentInstance;
    component.currentPath = 'my_expenses';
    component.updateFooterState(null);
    expect(component.currentActiveState).toBe(FooterState.EXPENSES);
  });

  it('updateFooterState() should set currentActiveState for my_reports', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.debugElement.componentInstance;
    component.currentPath = 'my_reports';
    component.updateFooterState(null);
    expect(component.currentActiveState).toBe(FooterState.REPORTS);
  });

  it('updateFooterState() should set currentActiveState to null for other paths', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.debugElement.componentInstance;
    component.currentPath = 'some_other_path';
    component.updateFooterState(null);
    expect(component.currentActiveState).toBeNull();
  });

  it('getTotalTasksCount() should update totalTasksCount when connected', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.debugElement.componentInstance;
    // When connected, return a specific task count from tasks service.
    tasksService.getTotalTaskCount.and.returnValue(of(5));
    component.isConnected$ = of(true);
    (router as any).events = of(new NavigationEnd(1, '/enterprise/my_dashboard', '/enterprise/my_dashboard'));
    spyOn(component, 'handleRouteChanges').and.callThrough();
    spyOn(component, 'getTotalTasksCount').and.callThrough();
    component.getShowFooter();
    expect(component.getTotalTasksCount).toHaveBeenCalledTimes(1);
    expect(tasksService.getTotalTaskCount).toHaveBeenCalledTimes(1);
    expect(component.totalTasksCount).toBe(5);
  });

  it('getTotalTasksCount() should update totalTasksCount to 0 when not connected', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.debugElement.componentInstance;
    // When not connected, our pipe should return 0.
    component.isConnected$ = of(false);
    component.getTotalTasksCount();
    expect(component.totalTasksCount).toBe(0);
  });

  describe('ngOnInit', () => {
    it('should initialize basic properties and call required methods', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const component = fixture.debugElement.componentInstance;

      spyOn(component, 'setupNetworkWatcher');
      spyOn(component, 'setSidenavPostOnboarding');
      spyOn(component, 'getShowFooter');

      // Mock sidemenuRef to prevent undefined errors
      component.sidemenuRef = {
        showSideMenuOnline: jasmine.createSpy('showSideMenuOnline'),
        showSideMenuOffline: jasmine.createSpy('showSideMenuOffline'),
      } as any;

      // Mock required properties
      component.isConnected$ = of(true);

      // Setup router events
      (router as any).events = of(new NavigationEnd(1, '/test', '/test'));

      component.ngOnInit();

      expect(component.setupNetworkWatcher).toHaveBeenCalled();
      expect(component.totalTasksCount).toBe(0);
      expect(component.setSidenavPostOnboarding).toHaveBeenCalled();
      expect(component.getShowFooter).toHaveBeenCalled();
      expect(gmapsService.loadLibrary).toHaveBeenCalled();
    });

    it('should handle footer selection mode changes', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const component = fixture.debugElement.componentInstance;

      spyOn(component, 'setupNetworkWatcher');
      spyOn(component, 'setSidenavPostOnboarding');
      spyOn(component, 'getShowFooter');

      // Mock sidemenuRef to prevent undefined errors
      component.sidemenuRef = {
        showSideMenuOnline: jasmine.createSpy('showSideMenuOnline'),
        showSideMenuOffline: jasmine.createSpy('showSideMenuOffline'),
      } as any;

      // Mock required properties
      component.isConnected$ = of(true);

      // Setup router events
      (router as any).events = of(new NavigationEnd(1, '/test', '/test'));

      // Test selection mode subscription
      footerService.selectionMode$ = of(true);

      component.ngOnInit();

      // Test with selection mode disabled
      footerService.selectionMode$ = of(false);
      component.ngOnInit();

      expect(component.showFooter).toBeTrue();
    });

    it('should set isOnline property based on network status', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const component = fixture.debugElement.componentInstance;

      spyOn(component, 'setupNetworkWatcher');
      spyOn(component, 'setSidenavPostOnboarding');
      spyOn(component, 'getShowFooter');

      // Mock sidemenuRef to prevent undefined errors
      component.sidemenuRef = {
        showSideMenuOnline: jasmine.createSpy('showSideMenuOnline'),
        showSideMenuOffline: jasmine.createSpy('showSideMenuOffline'),
      } as any;

      // Test with online status
      component.isConnected$ = of(true);
      (router as any).events = of(new NavigationEnd(1, '/test', '/test'));

      component.ngOnInit();

      expect(component.isOnline).toBeTrue();

      // Test with offline status
      component.isConnected$ = of(false);
      component.ngOnInit();

      expect(component.isOnline).toBeFalse();
    });
  });
});
