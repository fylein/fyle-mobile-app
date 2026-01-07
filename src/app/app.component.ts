import { Component, OnInit, EventEmitter, NgZone, ViewChild, AfterViewInit, inject } from '@angular/core';
import { IonApp, IonFooter, IonRouterOutlet, MenuController, NavController, Platform } from '@ionic/angular/standalone';
import { from, concat, Observable, noop, forkJoin, of } from 'rxjs';
import { switchMap, shareReplay, filter, take, map } from 'rxjs/operators';
import { Router, NavigationEnd, NavigationStart, ActivatedRoute, Params, UrlTree } from '@angular/router';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { DeviceService } from 'src/app/core/services/device.service';
import { AppVersionService } from './core/services/app-version.service';
import { RouterAuthService } from './core/services/router-auth.service';
import { NetworkService } from './core/services/network.service';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { FreshChatService } from './core/services/fresh-chat.service';
import { DeepLinkService } from './core/services/deep-link.service';
import { TrackingService } from './core/services/tracking.service';
import { SidemenuComponent } from './shared/components/sidemenu/sidemenu.component';
import { ExtendedOrgUser } from './core/models/extended-org-user.model';
import { PerfTrackers } from './core/models/perf-trackers.enum';
import { ExtendedDeviceInfo } from './core/models/extended-device-info.model';
import { BackButtonActionPriority } from './core/models/back-button-action-priority.enum';
import { BackButtonService } from './core/services/back-button.service';
import { TextZoom } from '@capacitor/text-zoom';
import { GmapsService } from './core/services/gmaps.service';
import { SpenderOnboardingService } from './core/services/spender-onboarding.service';
import { FooterState } from './shared/components/footer/footer-state.enum';
import { FooterService } from './core/services/footer.service';
import { TasksService } from './core/services/tasks.service';
import { DelegatedAccMessageComponent } from './shared/components/delegated-acc-message/delegated-acc-message.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NgClass } from '@angular/common';
import { FyConnectionComponent } from './shared/components/fy-connection/fy-connection.component';
import { Capacitor } from '@capacitor/core';
import { ActionPerformed, PushNotificationSchema, PushNotifications, Token } from '@capacitor/push-notifications';
import { AppShortcuts } from '@capawesome/capacitor-app-shortcuts';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    DelegatedAccMessageComponent,
    FooterComponent,
    FyConnectionComponent,
    IonApp,
    IonFooter,
    IonRouterOutlet,
    NgClass,
    SidemenuComponent,
  ],
})
export class AppComponent implements OnInit, AfterViewInit {
  private platform = inject(Platform);

  private router = inject(Router);

  private activatedRoute = inject(ActivatedRoute);

  private userEventService = inject(UserEventService);

  private menuController = inject(MenuController);

  private deviceService = inject(DeviceService);

  private appVersionService = inject(AppVersionService);

  private routerAuthService = inject(RouterAuthService);

  private networkService = inject(NetworkService);

  private freshChatService = inject(FreshChatService);

  private zone = inject(NgZone);

  private deepLinkService = inject(DeepLinkService);

  private trackingService = inject(TrackingService);

  private navController = inject(NavController);

  private backButtonService = inject(BackButtonService);

  private gmapsService = inject(GmapsService);

  private spenderOnboardingService = inject(SpenderOnboardingService);

  private footerService = inject(FooterService);

  private tasksService = inject(TasksService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild('sidemenuRef') sidemenuRef: SidemenuComponent;

  eou$: Observable<ExtendedOrgUser>;

  appVersion: string;

  isConnected$: Observable<boolean>;

  eou: ExtendedOrgUser;

  device;

  previousUrl: string;

  isSwitchedToDelegator: boolean;

  isUserLoggedIn = false;

  isOnline: boolean;

  showFooter: boolean;

  currentActiveState = FooterState.HOME;

  currentPath: string;

  totalTasksCount: number;

  routesWithFooter = [
    'my_dashboard',
    'my_expenses',
    'my_advances',
    'my_reports',
    'team_advance',
    'personal_cards',
    'team_reports',
  ];

  constructor() {
    this.initializeApp();
    this.registerBackButtonAction();
  }

  ngAfterViewInit(): void {
    // Move platform ready check here after view is initialized
    setTimeout(async () => {
      await SplashScreen.hide();
    }, 2000);
  }

  registerBackButtonAction(): void {
    this.platform.backButton.subscribeWithPriority(BackButtonActionPriority.LOW, () => {
      if (this.router.url.includes('sign_in')) {
        this.backButtonService.showAppCloseAlert();
      } else if (this.router.url.includes('switch_org') || this.router.url.includes('delegated_accounts')) {
        if (this.previousUrl && this.previousUrl.includes('enterprise')) {
          this.navController.back();
        } else {
          this.router.navigate(['/', 'enterprise', 'my_dashboard']);
        }
      } else {
        this.navController.back();
      }
    });
  }

  initializeApp(): void {
    // Sample url - "https://fyle.app.link/branchio_redirect?redirect_uri=https%3A%2F%2Fstaging.fylehq.ninja%2Fapp%2Fmain%2F%23%2Fenterprise%2Freports%2Frpsv8oKuAfGe&org_id=orrjqbDbeP9p"

    App.addListener('appUrlOpen', (data) => {
      this.zone.run(() => {
        this.deepLinkService.redirect(this.deepLinkService.getJsonFromUrl(data.url));
      });
    });

    // Handle app shortcuts (Home Screen Quick Actions)
    if (Capacitor.isNativePlatform()) {
      AppShortcuts.addListener('click', (event) => {
        this.zone.run(() => {
          this.handleAppShortcut(event.shortcutId);
        });
      });
    }

    this.platform.ready().then(async () => {
      if (Capacitor.isNativePlatform()) {
        await StatusBar.setStyle({
          style: Style.Default,
        });
      }

      /*
       * Use the app's font size irrespective of the user's device font size.
       * This is to ensure that the app's UI is consistent across devices.
       * Ref: https://www.npmjs.com/package/@capacitor/text-zoom
       */
      if (Capacitor.isNativePlatform()) {
        await TextZoom.set({ value: 1 });
      }

      from(this.routerAuthService.isLoggedIn())
        .pipe(
          filter((isLoggedIn) => !!isLoggedIn),
          switchMap(() => this.deviceService.getDeviceInfo()),
          filter((deviceInfo: ExtendedDeviceInfo) => ['android', 'ios'].includes(deviceInfo.platform.toLowerCase())),
          switchMap((deviceInfo) => {
            this.appVersionService.load(deviceInfo);
            return this.appVersionService.getUserAppVersionDetails(deviceInfo);
          }),
          filter((userAppVersionDetails) => !!userAppVersionDetails),
        )
        .subscribe((userAppVersionDetails) => {
          const { appSupportDetails, lastLoggedInVersion, deviceInfo } = userAppVersionDetails;
          this.trackingService.eventTrack('Auto Logged out', {
            lastLoggedInVersion,
            appVersion: deviceInfo.appVersion,
          });
          this.router.navigate(['/', 'auth', 'app_version', { message: appSupportDetails.message }]);
        });
    });
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      shareReplay(1),
    );
  }

  setSidenavPostOnboarding(): void {
    this.spenderOnboardingService
      .setOnboardingStatusAsComplete()
      .pipe(
        switchMap(() => this.isConnected$.pipe(take(1))),
        map((isOnline) => {
          if (isOnline) {
            this.sidemenuRef.showSideMenuOnline();
          } else {
            this.sidemenuRef.showSideMenuOffline();
          }
        }),
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.setupNetworkWatcher();
    this.totalTasksCount = 0;
    //This is to subscribe to the selection mode and hide the footer when selection mode is enabled on the expenses page
    this.footerService.selectionMode$.subscribe((isEnabled) => {
      this.showFooter = !isEnabled;
    });

    // This was done as a security fix for appknox
    // eslint-disable-next-line
    if ((window as any) && (window as any).localStorage) {
      // eslint-disable-next-line
      const lstorage = (window as any).localStorage as { removeItem: (key: string) => void };

      Object.keys(lstorage)
        .filter((key) => key.match(/^fyle/))
        .forEach((key) => lstorage.removeItem(key));
    }

    this.isConnected$.subscribe((isOnline) => {
      this.isOnline = isOnline;
    });

    forkJoin({
      loggedInStatus: this.routerAuthService.isLoggedIn(),
      isOnline: this.isConnected$.pipe(take(1)),
    }).subscribe(({ loggedInStatus, isOnline }) => {
      this.isUserLoggedIn = loggedInStatus;

      if (this.isUserLoggedIn) {
        if (this.isOnline) {
          this.sidemenuRef.showSideMenuOnline();
        } else {
          this.sidemenuRef.showSideMenuOffline();
        }
      }

      const markOptions: PerformanceMarkOptions = {
        detail: this.isUserLoggedIn,
      };
      performance.mark(PerfTrackers.appLaunchStartTime, markOptions);
    });

    this.userEventService.onSetToken(() => {
      setTimeout(() => {
        if (this.isOnline) {
          this.sidemenuRef.showSideMenuOnline();
        } else {
          this.sidemenuRef.showSideMenuOffline();
        }
      }, 500);
    });

    this.setSidenavPostOnboarding();

    this.userEventService.onLogout(() => {
      this.trackingService.onSignOut();
      this.freshChatService.destroy();
      this.isSwitchedToDelegator = false;
      this.router.navigate(['/', 'auth', 'sign_in']);
    });

    this.router.events.subscribe((ev) => {
      // adding try catch because this may fail due to network issues
      // noop is no op - basically an empty function
      try {
        this.trackingService.updateIdentityIfNotPresent().then(noop).catch(noop);
      } catch (error) {}

      if (ev instanceof NavigationStart) {
        this.previousUrl = this.router.url;
      }
      if (ev instanceof NavigationEnd) {
        if (
          ev.urlAfterRedirects.indexOf('enterprise') > -1 &&
          !(ev.urlAfterRedirects.indexOf('delegated_accounts') > -1)
        ) {
          setTimeout(() => this.menuController.swipeGesture(true), 500);
        } else {
          setTimeout(() => this.menuController.swipeGesture(false), 500);
        }
      }
    });

    this.getShowFooter();

    this.gmapsService.loadLibrary();
  }

  getShowFooter(): void {
    this.getTotalTasksCount();
    this.handleRouteChanges();
  }

  onHomeClicked(): void {
    this.currentActiveState = FooterState.HOME;
    this.footerService.updateCurrentStateIndex(0);
    const queryParams: Params = { state: 'home' };
    if (this.currentPath === 'my_dashboard') {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams,
      });
    } else {
      this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
        queryParams,
      });
    }

    this.trackingService.footerHomeTabClicked({
      page: 'Dashboard',
    });
  }

  onTaskClicked(): void {
    this.currentActiveState = FooterState.TASKS;
    this.footerService.updateCurrentStateIndex(1);
    const queryParams: Params = { state: 'tasks' };
    if (this.currentPath === 'my_dashboard') {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams,
      });
    } else {
      this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
        queryParams,
      });
    }
    this.trackingService.tasksPageOpened({
      Asset: 'Mobile',
      from: 'Dashboard',
    });
  }

  onCameraClicked(): void {
    this.router.navigate([
      '/',
      'enterprise',
      'camera_overlay',
      {
        navigate_back: true,
      },
    ]);
  }

  onExpensesClicked(): void {
    this.currentActiveState = FooterState.EXPENSES;
    this.router.navigate([
      '/',
      'enterprise',
      'my_expenses',
      {
        navigate_back: true,
      },
    ]);

    this.trackingService.footerExpensesTabClicked();
  }

  onReportsClicked(): void {
    this.currentActiveState = FooterState.REPORTS;
    this.router.navigate([
      '/',
      'enterprise',
      'my_reports',
      {
        navigate_back: true,
      },
    ]);

    this.trackingService.footerReportsTabClicked();
  }

  switchDelegator(isSwitchedToDelegator: boolean): void {
    this.isSwitchedToDelegator = isSwitchedToDelegator;
  }

  /**
   * Handles app shortcuts (Home Screen Quick Actions)
   * @param shortcutId - The ID of the shortcut that was clicked
   */
  private handleAppShortcut(shortcutId: string): void {
    this.trackingService.appShortcutUsed({ action: shortcutId });

    switch (shortcutId) {
      case 'capture_receipt':
        this.router.navigate(['/', 'enterprise', 'camera_overlay', { navigate_back: true }]);
        break;
      case 'add_expense':
        this.router.navigate(['/', 'enterprise', 'add_edit_expense', { navigate_back: true }]);
        break;
      default:
        // Fallback to dashboard if unknown shortcut
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
        break;
    }
  }

  private getTotalTasksCount(): void {
    this.isConnected$
      .pipe(switchMap((isConnected) => (isConnected ? this.tasksService.getTotalTaskCount() : of(0))))
      .subscribe((taskCount) => {
        this.totalTasksCount = taskCount;
      });
  }

  private handleRouteChanges(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event: NavigationEnd) => {
          // Parse the URL using Angular's router
          const urlTree: UrlTree = this.router.parseUrl(event.urlAfterRedirects);

          // Get the last segment of the primary outlet (e.g., 'my_dashboard')
          const segments = urlTree.root.children.primary?.segments as
            | { path: string; parameters: { [key: string]: string } }[]
            | undefined;
          const lastSegment: string = segments && segments.length > 0 ? segments[segments.length - 1].path : '';

          // Get matrix params for the last segment
          const matrixParams: { [key: string]: string } =
            segments && segments.length > 0 ? segments[segments.length - 1].parameters : {};

          // Get query params (e.g., state)
          const queryParams: { [key: string]: string } = urlTree.queryParams;

          return { lastSegment, matrixParams, queryParams };
        }),
      )
      .subscribe(({ lastSegment, queryParams }: { lastSegment: string; queryParams: { [key: string]: string } }) => {
        this.currentPath = lastSegment;
        const state = queryParams.state || this.getStateFromPath(String(lastSegment));
        this.showFooter = this.routesWithFooter.includes(this.currentPath);
        this.updateFooterState(state);
      });
  }

  private getStateFromPath(path: string): string | null {
    if (path.includes('?')) {
      return path.split('?')[1].split('=')[1];
    }
    return null;
  }

  // this is to handle footer state changes when navigation is done from the sidebar
  private updateFooterState(state: string | null): void {
    switch (this.currentPath) {
      case 'my_dashboard':
        if (state === 'tasks') {
          this.currentActiveState = FooterState.TASKS;
          this.footerService.updateCurrentStateIndex(1);
        } else {
          this.currentActiveState = FooterState.HOME;
          this.footerService.updateCurrentStateIndex(0);
        }
        break;
      case 'my_expenses':
        this.currentActiveState = FooterState.EXPENSES;
        break;
      case 'my_reports':
        this.currentActiveState = FooterState.REPORTS;
        break;
      default:
        this.currentActiveState = null;
        break;
    }
  }
}
