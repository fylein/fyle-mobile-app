import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IonicModule, Platform } from '@ionic/angular';
import { Router } from '@angular/router';

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
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const tasksServiceSpy = jasmine.createSpyObj('TasksService', ['getTotalTaskCount']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['tasksPageOpened', 'footerHomeTabClicked']);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['navigateRoot', 'back']);
    spenderOnboardingServiceSpy.setOnboardingStatusAsComplete.and.returnValue(of(null));

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
  });
});
