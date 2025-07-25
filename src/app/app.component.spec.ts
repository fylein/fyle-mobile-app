import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IonicModule, Platform, MenuController } from '@ionic/angular';
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
import { NavController } from '@ionic/angular';
import { TranslocoService } from '@jsverse/transloco';
import { UserEventService } from './core/services/user-event.service';
import { DeviceService } from './core/services/device.service';
import { GmapsService } from './core/services/gmaps.service';

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
  let translocoService: jasmine.SpyObj<TranslocoService>;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let gmapsService: jasmine.SpyObj<GmapsService>;
  let menuController: jasmine.SpyObj<MenuController>;
  beforeEach(waitForAsync(() => {
    platformReadySpy = Promise.resolve();
    platformSpy = jasmine.createSpyObj('Platform', { ready: platformReadySpy });
    platformSpy.backButton = {
      subscribeWithPriority: (priority: number, callback: (processNextHandler: () => void) => Promise<any> | void) => {
        return { unsubscribe: jasmine.createSpy('unsubscribe') };
      },
      next: jasmine.createSpy('next'),
      error: jasmine.createSpy('error'),
      complete: jasmine.createSpy('complete'),
      subscribe: jasmine.createSpy('subscribe'),
      unsubscribe: jasmine.createSpy('unsubscribe'),
      observers: [],
      closed: false,
      isStopped: false,
      hasError: false,
      thrownError: null,
    } as any;
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const appVersionServiceSpy = jasmine.createSpyObj('AppVersionService', ['load', 'getUserAppVersionDetails']);
    const routerAuthServiceSpy = jasmine.createSpyObj('RouterAuthService', ['isLoggedIn']);
    routerAuthServiceSpy.isLoggedIn.and.returnValue(of(true));
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline'], {
      isOnline$: of(true),
    });
    const freshChatServiceSpy = jasmine.createSpyObj('FreshChatService', ['destroy']);
    const spenderOnboardingServiceSpy = jasmine.createSpyObj('SpenderOnboardingService', [
      'setOnboardingStatusAsComplete',
    ]);
    const footerServiceSpy = jasmine.createSpyObj('FooterService', ['updateCurrentStateIndex', 'updateSelectionMode'], {
      selectionMode$: of(false),
      footerCurrentStateIndex$: of(1),
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'parseUrl']);
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
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'tasksPageOpened',
      'footerHomeTabClicked',
      'footerExpensesTabClicked',
      'footerReportsTabClicked',
    ]);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['navigateRoot', 'back']);
    spenderOnboardingServiceSpy.setOnboardingStatusAsComplete.and.returnValue(of(null));
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventService', ['onSetToken', 'onLogout']);
    const deviceServiceSpy = jasmine.createSpyObj('DeviceService', ['getDeviceInfo']);
    const gmapsServiceSpy = jasmine.createSpyObj('GmapsService', ['loadLibrary']);
    const menuControllerSpy = jasmine.createSpyObj('MenuController', ['swipeGesture']);

    // Configure tracking service with missing methods
    trackingServiceSpy.updateIdentityIfNotPresent = jasmine.createSpy('updateIdentityIfNotPresent').and.resolveTo();
    trackingServiceSpy.onSignOut = jasmine.createSpy('onSignOut');
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
        { provide: TranslocoService, useValue: translocoServiceSpy },
        { provide: UserEventService, useValue: userEventServiceSpy },
        { provide: DeviceService, useValue: deviceServiceSpy },
        { provide: GmapsService, useValue: gmapsServiceSpy },
        { provide: MenuController, useValue: menuControllerSpy },
      ],
      imports: [IonicModule.forRoot()],
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
    // adding transloco service to the testbed
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
    gmapsService = TestBed.inject(GmapsService) as jasmine.SpyObj<GmapsService>;
    menuController = TestBed.inject(MenuController) as jasmine.SpyObj<MenuController>;
  }));

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
    (component as any).getTotalTasksCount();
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
