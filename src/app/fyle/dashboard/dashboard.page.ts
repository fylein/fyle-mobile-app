import { Component, EventEmitter, OnDestroy, ViewChild, inject, signal, viewChild } from '@angular/core';
import { combineLatest, concat, forkJoin, from, noop, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, map, shareReplay, switchMap, take, takeUntil } from 'rxjs/operators';
import {
  ActionSheetButton,
  ActionSheetController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
  ModalController,
  NavController,
  Platform,
  PopoverController,
} from '@ionic/angular/standalone';
import { NetworkService } from '../../core/services/network.service';
import { StatsComponent } from './stats/stats.component';
import { ActivatedRoute, NavigationStart, Params, Router } from '@angular/router';
import { FooterState } from '../../shared/components/footer/footer-state.enum';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TasksComponent } from './tasks/tasks.component';
import { TasksService } from 'src/app/core/services/tasks.service';
import { RebrandingPopupComponent } from 'src/app/shared/components/rebranding-popup/rebranding-popup.component';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { PlatformOrgSettingsService } from 'src/app/core/services/platform/v1/spender/org-settings.service';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { BackButtonService } from 'src/app/core/services/back-button.service';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import { CardStatsComponent } from './card-stats/card-stats.component';
import { PlatformCategory } from 'src/app/core/models/platform/platform-category.model';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { FeatureConfigService } from 'src/app/core/services/platform/v1/spender/feature-config.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { PromoteOptInModalComponent } from 'src/app/shared/components/promote-opt-in-modal/promote-opt-in-modal.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { DashboardState } from 'src/app/core/enums/dashboard-state.enum';
import { FyOptInComponent } from 'src/app/shared/components/fy-opt-in/fy-opt-in.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { Driver, driver, DriveStep } from 'driver.js';
import { WalkthroughService } from 'src/app/core/services/walkthrough.service';
import { FooterService } from 'src/app/core/services/footer.service';
import { TimezoneService } from 'src/app/core/services/timezone.service';
import { EmployeeSettings } from 'src/app/core/models/employee-settings.model';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import SwiperCore, { Pagination, Autoplay } from 'swiper';
import { PaginationOptions, Swiper, SwiperOptions } from 'swiper/types';
import { SwiperComponent, SwiperModule } from 'swiper/angular';
import { FyMenuIconComponent } from '../../shared/components/fy-menu-icon/fy-menu-icon.component';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { DashboardOptInComponent } from '../../shared/components/dashboard-opt-in/dashboard-opt-in.component';
import { DashboardEmailOptInComponent } from '../../shared/components/dashboard-email-opt-in/dashboard-email-opt-in.component';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';

// install Swiper modules
SwiperCore.use([Pagination, Autoplay]);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [
    AsyncPipe,
    CardStatsComponent,
    DashboardEmailOptInComponent,
    DashboardOptInComponent,
    FyMenuIconComponent,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonSkeletonText,
    IonTitle,
    IonToolbar,
    MatIcon,
    MatTab,
    MatTabGroup,
    NgClass,
    StatsComponent,
    SwiperModule,
    TasksComponent,
    TranslocoPipe,
  ],
})
export class DashboardPage {
  private currencyService = inject(CurrencyService);

  private networkService = inject(NetworkService);

  private activatedRoute = inject(ActivatedRoute);

  private router = inject(Router);

  private trackingService = inject(TrackingService);

  private actionSheetController = inject(ActionSheetController);

  private tasksService = inject(TasksService);

  private platformEmployeeSettingsService = inject(PlatformEmployeeSettingsService);

  private orgSettingsService = inject(PlatformOrgSettingsService);

  private categoriesService = inject(CategoriesService);

  private platform = inject(Platform);

  private backButtonService = inject(BackButtonService);

  private navController = inject(NavController);

  private modalController = inject(ModalController);

  private utilityService = inject(UtilityService);

  private featureConfigService = inject(FeatureConfigService);

  private modalProperties = inject(ModalPropertiesService);

  private authService = inject(AuthService);

  private matSnackBar = inject(MatSnackBar);

  private snackbarProperties = inject(SnackbarPropertiesService);

  private walkthroughService = inject(WalkthroughService);

  private footerService = inject(FooterService);

  private timezoneService = inject(TimezoneService);

  private translocoService = inject(TranslocoService);

  private orgUserService = inject(OrgUserService);

  private launchDarklyService = inject(LaunchDarklyService);

  private popoverController = inject(PopoverController);

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild(StatsComponent) statsComponent: StatsComponent;

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild(CardStatsComponent) cardStatsComponent: CardStatsComponent;

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild(TasksComponent) tasksComponent: TasksComponent;

  readonly swiperComponent = viewChild<SwiperComponent>('optInSwiper');

  employeeSettings$: Observable<EmployeeSettings>;

  orgSettings$: Observable<OrgSettings>;

  specialCategories$: Observable<PlatformCategory[]>;

  homeCurrency$: Observable<string>;

  isConnected$: Observable<boolean>;

  onPageExit$ = new Subject();

  currentStateIndex = 0;

  actionSheetButtons: ActionSheetButton[] = [];

  taskCount = 0;

  hardwareBackButtonAction: Subscription;

  optInShowTimer;

  dashboardAddExpenseWalkthroughTimer;

  navigationSubscription: Subscription;

  canShowOptInBanner$: Observable<boolean>;

  canShowEmailOptInBanner$: Observable<boolean>;

  eou$: Observable<ExtendedOrgUser>;

  isUserFromINCluster$: Observable<boolean>;

  isWalkthroughComplete = false;

  isWalkthroughPaused = false;

  isWalkThroughOver = false; // used to check if the walkthrough is over for that momemnt by the user so we can show the add expense walkthrough

  // variable to check for the overlay bg click for the walkthrough
  // This needs to be true at the start as driver.js does not have a default overlay click event
  // We make this false if the driver is destroyed by other than overlay click
  isOverlayClicked = true;

  overlayClickCount = 0;

  walkthroughOverlayStartIndex = 0;

  userName = '';

  swiperConfig: SwiperOptions;

  rebrandingPopupShown = signal<boolean>(false);

  optInBannerPagination: PaginationOptions = {
    dynamicBullets: true,
    renderBullet(index, className): string {
      return '<span class="opt-in-banners ' + className + '"> </span>';
    },
  };

  dashboardAddExpenseWalkthroughDriverInstance: Driver;

  get displayedTaskCount(): number {
    if (this.activatedRoute.snapshot.queryParams.state === 'tasks') {
      return this.tasksComponent?.taskCount;
    } else {
      return this.taskCount;
    }
  }

  get FooterState(): typeof FooterState {
    return FooterState;
  }

  get filterPills(): FilterPill[] {
    return this.tasksComponent.filterPills;
  }

  private get swiperInstance(): Swiper | undefined {
    return this.swiperComponent()?.swiperRef;
  }

  startDashboardAddExpenseWalkthrough(): void {
    const dashboardAddExpenseWalkthroughSteps: DriveStep[] =
      this.walkthroughService.getDashboardAddExpenseWalkthroughConfig();
    this.dashboardAddExpenseWalkthroughDriverInstance = driver({
      overlayOpacity: 0.5,
      allowClose: true,
      overlayClickBehavior: 'close',
      showProgress: false,
      overlayColor: '#161528',
      stageRadius: 6,
      stagePadding: 4,
      popoverClass: 'custom-popover',
      doneBtnText: 'Ok',
      showButtons: ['close', 'next'],
      onDestroyed: () => {
        this.setDashboardAddExpenseWalkthroughFeatureConfigFlag();
      },
    });

    this.dashboardAddExpenseWalkthroughDriverInstance.setSteps(dashboardAddExpenseWalkthroughSteps);
    this.dashboardAddExpenseWalkthroughDriverInstance.drive();
  }

  setDashboardAddExpenseWalkthroughFeatureConfigFlag(): void {
    const featureConfigParams = {
      feature: 'WALKTHROUGH',
      key: 'DASHBOARD_ADD_EXPENSE',
    };

    const eventTrackName = 'Dashboard Add Expense Walkthrough Completed';

    const featureConfigValue = {
      isShown: true,
      isFinished: true,
    };

    this.trackingService.eventTrack(eventTrackName, {
      Asset: 'Mobile',
      from: 'Dashboard',
    });

    this.featureConfigService
      .saveConfiguration({
        ...featureConfigParams,
        value: featureConfigValue,
      })
      .subscribe(noop);
  }

  showDashboardAddExpenseWalkthrough(): void {
    // Clear any existing timer to prevent multiple timers running simultaneously
    clearTimeout(this.dashboardAddExpenseWalkthroughTimer as number);

    this.featureConfigService
      .getConfiguration<{
        isShown?: boolean;
        isFinished?: boolean;
      }>({
        feature: 'WALKTHROUGH',
        key: 'DASHBOARD_ADD_EXPENSE',
      })
      .subscribe((config) => {
        const featureConfigValue = config?.value || {};
        const isFinished = featureConfigValue?.isFinished || false;

        // Only show add expense walkthrough if navbar walkthrough is finished or over for that moment by the user
        if (!isFinished && (this.isWalkthroughComplete || this.isWalkThroughOver)) {
          this.dashboardAddExpenseWalkthroughTimer = setTimeout(() => {
            this.startDashboardAddExpenseWalkthrough();
          }, 1000);
        }
      });
  }

  setNavbarWalkthroughFeatureConfigFlag(overlayClicked: boolean): void {
    this.isWalkThroughOver = true;
    // now call the dashboard add expense walkthrough
    this.showDashboardAddExpenseWalkthrough();
    const featureConfigParams = {
      feature: 'WALKTHROUGH',
      key: 'DASHBOARD_SHOW_NAVBAR',
    };

    const eventTrackName =
      overlayClicked && this.overlayClickCount < 1
        ? 'Navbar Walkthrough Skipped with overlay clicked'
        : 'Navbar Walkthrough Completed';

    const featureConfigValue =
      overlayClicked && this.overlayClickCount < 1
        ? {
            isShown: true,
            isFinished: false,
            overlayClickCount: this.overlayClickCount + 1,
            currentStepIndex: this.walkthroughService.getActiveWalkthroughIndex(),
          }
        : {
            isShown: true,
            isFinished: true,
          };

    this.trackingService.eventTrack(eventTrackName, {
      Asset: 'Mobile',
      from: 'Dashboard',
    });

    this.featureConfigService
      .saveConfiguration({
        ...featureConfigParams,
        value: featureConfigValue,
      })
      .subscribe(noop);
  }

  startTour(isApprover: boolean): void {
    const navbarWalkthroughSteps = this.walkthroughService.getNavBarWalkthroughConfig(isApprover);
    const driverInstance = driver({
      overlayOpacity: 0.5,
      allowClose: true,
      overlayClickBehavior: 'close',
      showProgress: true,
      overlayColor: '#161528',
      stageRadius: 6,
      stagePadding: 4,
      popoverClass: 'custom-popover',
      doneBtnText: 'Ok',
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      // Callback used for the cancel walkthrough button
      onCloseClick: () => {
        this.walkthroughService.setIsOverlayClicked(false);
        this.setNavbarWalkthroughFeatureConfigFlag(false);
        driverInstance.destroy();
      },
      //Callback used for registering the active index of the walkthrough
      onDeselected: () => {
        const activeIndex = driverInstance.getActiveIndex();
        if (activeIndex) {
          this.walkthroughService.setActiveWalkthroughIndex(activeIndex);
        }
      },
      // Callback used to check for the next step and finish button
      onNextClick: () => {
        driverInstance.moveNext();
        if (this.walkthroughService.getActiveWalkthroughIndex() === navbarWalkthroughSteps.length - 1) {
          this.walkthroughService.setIsOverlayClicked(false);
        }
      },
      // Callback used for performing actions when the walkthrough is destroyed
      onDestroyStarted: () => {
        if (this.walkthroughService.getIsOverlayClicked()) {
          this.setNavbarWalkthroughFeatureConfigFlag(true);
          driverInstance.destroy();
        } else {
          this.setNavbarWalkthroughFeatureConfigFlag(false);
          driverInstance.destroy();
        }
      },
    });

    let activeStepIndex = this.walkthroughService.getActiveWalkthroughIndex();

    driverInstance.setSteps(navbarWalkthroughSteps);
    if (this.overlayClickCount > 0) {
      activeStepIndex = this.walkthroughOverlayStartIndex;
    }
    driverInstance.drive(activeStepIndex);
  }

  showNavbarWalkthrough(isApprover: boolean): void {
    const showNavbarWalkthroughConfig = {
      feature: 'WALKTHROUGH',
      key: 'DASHBOARD_SHOW_NAVBAR',
    };

    this.featureConfigService
      .getConfiguration<{
        isShown?: boolean;
        isFinished?: boolean;
        overlayClickCount?: number;
        currentStepIndex?: number;
      }>(showNavbarWalkthroughConfig)
      .subscribe((config) => {
        const featureConfigValue = config?.value || {};
        const isFinished = featureConfigValue?.isFinished || false;
        this.overlayClickCount = featureConfigValue?.overlayClickCount || 0;
        // index to start the walkthrough from is destroyed due to overlay click
        this.walkthroughOverlayStartIndex = featureConfigValue?.currentStepIndex || 0;
        this.isWalkthroughComplete = isFinished;

        if (isFinished) {
          this.showDashboardAddExpenseWalkthrough();
        }

        if (!isFinished) {
          this.startTour(isApprover);
        }
      });
  }

  ionViewWillLeave(): void {
    // handling the pause walkthrough when the user navigates to other pages
    if (!this.isWalkthroughComplete) {
      this.isWalkthroughPaused = true;
      this.walkthroughService.setActiveWalkthroughIndex(driver().getActiveIndex());
      driver().destroy();
    }
    clearTimeout(this.optInShowTimer as number);
    clearTimeout(this.dashboardAddExpenseWalkthroughTimer as number);
    this.navigationSubscription?.unsubscribe();
    this.utilityService.toggleShowOptInAfterAddingCard(false);
    this.onPageExit$.next(null);
    this.hardwareBackButtonAction.unsubscribe();
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      takeUntil(this.onPageExit$),
      shareReplay(1),
    );
  }

  setShowOptInBanner(): Observable<boolean> {
    const optInBannerConfig = {
      feature: 'DASHBOARD_OPT_IN_BANNER',
      key: 'OPT_IN_BANNER_SHOWN',
    };

    const isBannerShown$ = this.featureConfigService.getConfiguration(optInBannerConfig).pipe(
      map((config) => config?.value),
      shareReplay(1),
    );

    return forkJoin({
      isBannerShown: isBannerShown$,
      eou: this.eou$,
    }).pipe(
      map(({ isBannerShown, eou }) => {
        const isUSDorCADCurrency = ['USD', 'CAD'].includes(eou.org.currency);
        const isInvalidUSMobileNumber = eou.ou.mobile && !eou.ou.mobile.startsWith('+1');

        if (eou.ou.mobile_verified || !isUSDorCADCurrency || isInvalidUSMobileNumber || isBannerShown) {
          return false;
        }

        return true;
      }),
      shareReplay(1),
    );
  }

  setShowEmailOptInBanner(): Observable<boolean> {
    const optInBannerConfig = {
      feature: 'DASHBOARD_EMAIL_OPT_IN_BANNER',
      key: 'EMAIL_OPT_IN_BANNER_SHOWN',
    };

    return this.featureConfigService.getConfiguration(optInBannerConfig).pipe(
      map((config) => config?.value),
      map((isBannerShown) => !isBannerShown),
      shareReplay(1),
    );
  }

  canShowRebrandingPopup(): Observable<boolean> {
    if (this.rebrandingPopupShown()) {
      return of(false);
    }
    const rebrandingPopupConfig = {
      feature: 'DASHBOARD_REBRANDING_POPUP',
      key: 'REBRANDING_POPUP_SHOWN',
    };

    return this.featureConfigService.getConfiguration(rebrandingPopupConfig).pipe(
      map((config) => config?.value),
      map((isPopupShown) => !isPopupShown),
      shareReplay(1),
    );
  }

  setSwiperConfig(): void {
    // Set default config when observables are not ready
    if (!this.canShowOptInBanner$ || !this.canShowEmailOptInBanner$) {
      this.swiperConfig = {
        slidesPerView: 1,
        spaceBetween: 0,
        centeredSlides: true,
        loop: false,
        autoplay: false,
        pagination: false,
      };
      return;
    }

    combineLatest([this.canShowOptInBanner$, this.canShowEmailOptInBanner$])
      .pipe(take(1))
      .subscribe(([canShowOptInBanner, canShowEmailOptInBanner]) => {
        const showBothBanners = canShowOptInBanner && canShowEmailOptInBanner;
        const swiper = this.swiperInstance;

        if (!swiper) {
          return;
        }

        swiper.loopDestroy?.();
        swiper.pagination.destroy();
        swiper.update();

        if (showBothBanners) {
          swiper.loopCreate?.();
          swiper.params.autoplay = {
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          };
          swiper.autoplay?.start();
        } else {
          swiper.autoplay?.stop();
          swiper.params.autoplay = false;
          swiper.pagination.destroy();
        }
        swiper.update();
      });
  }

  async openSMSOptInDialog(extendedOrgUser: ExtendedOrgUser): Promise<void> {
    const optInModal = await this.modalController.create({
      component: FyOptInComponent,
      componentProps: {
        extendedOrgUser,
      },
    });

    return await optInModal.present();
  }

  showInfoToastMessage(message: string): void {
    const panelClass = 'msb-info';
    this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties('information', { message }),
      panelClass,
    });
    this.trackingService.showToastMessage({ ToastContent: message });
  }

  onPendingTasksStatClick(): void {
    const queryParams: Params = { state: 'tasks' };
    this.currentStateIndex = 1;
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams,
    });

    this.trackingService.dashboardPendingTasksNotificationClicked({
      Asset: 'Mobile',
      from: 'Dashboard',
    });
  }

  ionViewWillEnter(): void {
    this.isWalkthroughPaused = false;
    this.swiperConfig = {
      slidesPerView: 1,
      spaceBetween: 0,
      centeredSlides: true,
      pagination: this.optInBannerPagination,
    };
    this.setupNetworkWatcher();
    this.registerBackButtonAction();
    this.footerService.footerCurrentStateIndex$.subscribe((index) => {
      this.currentStateIndex = index;
    });
    this.taskCount = 0;
    const currentState =
      this.activatedRoute.snapshot.queryParams.state === 'tasks' ? DashboardState.tasks : DashboardState.home;
    if (currentState === DashboardState.tasks) {
      this.currentStateIndex = 1;
    } else {
      this.currentStateIndex = 0;
    }

    this.employeeSettings$ = this.platformEmployeeSettingsService.get().pipe(shareReplay(1));
    this.orgSettings$ = this.orgSettingsService.get().pipe(shareReplay(1));
    this.specialCategories$ = this.categoriesService.getMileageOrPerDiemCategories().pipe(shareReplay(1));
    this.homeCurrency$ = this.currencyService.getHomeCurrency().pipe(shareReplay(1));
    this.eou$ = from(this.authService.getEou()).pipe(shareReplay(1));
    this.isUserFromINCluster$ = from(this.utilityService.isUserFromINCluster());
    const openSMSOptInDialog = this.activatedRoute.snapshot.params.openSMSOptInDialog as string;

    this.employeeSettings$.subscribe((employeeSettings) => {
      this.timezoneService.setTimezone(employeeSettings?.locale);
    });

    if (openSMSOptInDialog !== 'true' && this.rebrandingPopupShown()) {
      this.eou$
        .pipe(
          map((eou) => {
            if (eou.ou.roles.includes('APPROVER') && eou.ou.is_primary) {
              this.showNavbarWalkthrough(true);
            } else {
              this.showNavbarWalkthrough(false);
            }

            this.userName = eou.us.full_name;
          }),
        )
        .subscribe(noop);
    }

    const optInBanner$ = this.setShowOptInBanner();
    const emailOptInBanner$ = this.setShowEmailOptInBanner();

    this.canShowOptInBanner$ = optInBanner$;
    this.canShowEmailOptInBanner$ = emailOptInBanner$;

    forkJoin({
      optInBanner: optInBanner$,
      emailOptInBanner: emailOptInBanner$,
      showRebrandingPopup: this.canShowRebrandingPopup(),
    })
      .pipe(take(1))
      .subscribe({
        next: ({ showRebrandingPopup }) => {
          this.setSwiperConfig();
          if (showRebrandingPopup) {
            this.showRebrandingPopup();
          }
        },
        error: () => {
          // If there's an error, still set up default swiper config
          this.setSwiperConfig();
        },
      });

    if (openSMSOptInDialog === 'true') {
      this.eou$
        .pipe(
          map((eou) => {
            if (eou.ou.mobile_verified) {
              this.showInfoToastMessage('You are already opted into text messaging!');
            } else {
              this.openSMSOptInDialog(eou);
            }
          }),
        )
        .subscribe();
    }

    forkJoin({
      orgSettings: this.orgSettings$,
      specialCategories: this.specialCategories$,
    }).subscribe(({ orgSettings, specialCategories }) => {
      const allowedExpenseTypes = {
        mileage: specialCategories.some((category) => category.system_category === 'Mileage'),
        perDiem: specialCategories.some((category) => category.system_category === 'Per Diem'),
      };
      this.setupActionSheet(orgSettings, allowedExpenseTypes);
    });

    this.statsComponent.init();
    this.cardStatsComponent.init();

    this.tasksComponent.init();
    /**
     * What does the _ mean in the subscribe block?
     * It means the response is not being used.
     * Heres a guy using it in the ionic forum
     * https://forum.ionicframework.com/t/angular-variable-is-not-updating-when-i-return-to-previous-page/202919
     * */

    this.isConnected$
      .pipe(switchMap((isConnected) => (isConnected ? this.tasksService.getTotalTaskCount() : of(0))))
      .subscribe((taskCount) => {
        this.taskCount = taskCount;
      });

    this.isConnected$.subscribe((isOnline) => {
      if (!isOnline) {
        const queryParams: Params = { state: 'home' };
        this.router.navigate(['/', 'enterprise', 'my_dashboard', { queryParams }]);
      }
    });

    // Check ACH suspension status
    this.checkAchSuspension();
  }

  backButtonActionHandler(): void {
    //If the user is on home page, show app close popup
    if (!this.router.url.includes('tasks')) {
      this.backButtonService.showAppCloseAlert();
    }

    // tasksFilters queryparam is not present when user navigates to tasks page from dashboard.
    else if (!this.activatedRoute.snapshot.queryParams.tasksFilters) {
      //Calling onHomeClicked() because angular does not reload the page if the query params changes.
      this.onHomeClicked();
    }

    //Else take the user back to the previous page
    else {
      this.navController.back();
    }
  }

  registerBackButtonAction(): void {
    this.hardwareBackButtonAction = this.platform.backButton.subscribeWithPriority(
      BackButtonActionPriority.LOW,
      this.backButtonActionHandler,
    );
  }

  onTaskClicked(): void {
    this.currentStateIndex = 1;
    const queryParams: Params = { state: 'tasks' };
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams,
    });
    this.trackingService.tasksPageOpened({
      Asset: 'Mobile',
      from: 'Dashboard',
    });
  }

  openFilters(): void {
    this.tasksComponent.openFilters();
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

  onHomeClicked(): void {
    this.currentStateIndex = 0;
    const queryParams: Params = { state: 'home' };
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams,
    });

    this.trackingService.footerHomeTabClicked({
      page: 'Dashboard',
    });
  }

  actionSheetButtonsHandler(action: string, route: string) {
    return (): void => {
      this.trackingService.dashboardActionSheetButtonClicked({
        Action: action,
      });
      this.router.navigate([
        '/',
        'enterprise',
        route,
        {
          navigate_back: true,
        },
      ]);
    };
  }

  setupActionSheet(orgSettings: OrgSettings, allowedExpenseTypes: Record<string, boolean>): void {
    const that = this;
    const mileageEnabled = orgSettings.mileage.enabled && allowedExpenseTypes.mileage;
    const isPerDiemEnabled = orgSettings.per_diem.enabled && allowedExpenseTypes.perDiem;
    that.actionSheetButtons = [
      {
        text: 'Capture receipt',
        icon: 'assets/svg/camera.svg',
        cssClass: 'capture-receipt',
        handler: this.actionSheetButtonsHandler('Capture receipt', 'camera_overlay'),
      },
      {
        text: 'Add manually',
        icon: 'assets/svg/list.svg',
        cssClass: 'capture-receipt',
        handler: this.actionSheetButtonsHandler('Add manually', 'add_edit_expense'),
      },
    ];

    if (mileageEnabled) {
      that.actionSheetButtons.push({
        text: 'Add mileage',
        icon: 'assets/svg/mileage.svg',
        cssClass: 'capture-receipt',
        handler: this.actionSheetButtonsHandler('Add mileage', 'add_edit_mileage'),
      });
    }

    if (isPerDiemEnabled) {
      that.actionSheetButtons.push({
        text: 'Add per diem',
        icon: 'assets/svg/calendar.svg',
        cssClass: 'capture-receipt',
        handler: this.actionSheetButtonsHandler('Add per diem', 'add_edit_per_diem'),
      });
    }
  }

  async openAddExpenseActionSheet(): Promise<void> {
    const that = this;
    if (this.dashboardAddExpenseWalkthroughDriverInstance) {
      this.dashboardAddExpenseWalkthroughDriverInstance.destroy();
    }
    that.trackingService.dashboardActionSheetOpened();
    const actionSheet = await this.actionSheetController.create({
      header: 'ADD EXPENSE',
      mode: 'md',
      cssClass: 'fy-action-sheet',
      buttons: that.actionSheetButtons,
    });
    await actionSheet.present();
  }

  async showPromoteOptInModal(): Promise<void> {
    this.trackingService.showOptInModalPostCardAdditionInDashboard();

    from(this.authService.getEou()).subscribe(async (eou) => {
      const optInPromotionalModal = await this.modalController.create({
        component: PromoteOptInModalComponent,
        mode: 'ios',
        componentProps: {
          extendedOrgUser: eou,
        },
        ...this.modalProperties.getModalDefaultProperties('promote-opt-in-modal'),
      });

      await optInPromotionalModal.present();

      const optInModalFeatureConfig = {
        feature: 'OPT_IN_POPUP_POST_CARD_ADDITION',
        key: 'OPT_IN_POPUP_SHOWN_COUNT',
        value: {
          count: 1,
        },
      };

      this.featureConfigService.saveConfiguration(optInModalFeatureConfig).subscribe(noop);

      const { data } = await optInPromotionalModal.onDidDismiss<{ skipOptIn: boolean }>();

      if (data?.skipOptIn) {
        this.trackingService.skipOptInModalPostCardAdditionInDashboard();
      } else {
        this.trackingService.optInFromPostPostCardAdditionInDashboard();
        this.tasksComponent.doRefresh();
        this.canShowOptInBanner$ = of(false);
      }
    });
  }

  async showAchSuspensionPopup(): Promise<void> {
    const achSuspensionPopover = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title: this.translocoService.translate<string>('dashboard.achSuspendedTitle'),
        message: this.translocoService.translate<string>('dashboard.achSuspendedMessage'),
        primaryCta: {
          text: this.translocoService.translate('dashboard.achSuspendedButton'),
          action: 'confirm',
        },
      },
      cssClass: 'pop-up-in-center',
    });

    await achSuspensionPopover.present();
    this.trackingService.eventTrack('ACH Reimbursements Suspended Popup Shown');
  }

  async showRebrandingPopup(): Promise<void> {
    const rebrandingPopover = await this.popoverController.create({
      component: RebrandingPopupComponent,
      cssClass: 'pop-up-in-center',
    });

    await rebrandingPopover.present();
    this.rebrandingPopupShown.set(true);

    // Mark the popup as shown in feature configs
    const rebrandingPopupConfig = {
      feature: 'DASHBOARD_REBRANDING_POPUP',
      key: 'REBRANDING_POPUP_SHOWN',
      value: true,
    };

    this.featureConfigService.saveConfiguration(rebrandingPopupConfig).subscribe(noop);
  }

  setModalDelay(): void {
    this.optInShowTimer = setTimeout(() => {
      this.showPromoteOptInModal();
    }, 4000);
  }

  setNavigationSubscription(): void {
    this.navigationSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        clearTimeout(this.optInShowTimer as number);

        const optInModalFeatureConfig = {
          feature: 'OPT_IN_POPUP_POST_CARD_ADDITION',
          key: 'OPT_IN_POPUP_SHOWN_COUNT',
        };

        this.utilityService.canShowOptInModal(optInModalFeatureConfig).subscribe((canShowOptInModal) => {
          if (canShowOptInModal) {
            this.showPromoteOptInModal();
          }
        });
      }
    });
  }

  onCardAdded(): void {
    const optInModalFeatureConfig = {
      feature: 'OPT_IN_POPUP_POST_CARD_ADDITION',
      key: 'OPT_IN_POPUP_SHOWN_COUNT',
    };

    this.utilityService.canShowOptInModal(optInModalFeatureConfig).subscribe((canShowOptInModal) => {
      if (canShowOptInModal) {
        this.setModalDelay();
        this.setNavigationSubscription();
        this.utilityService.toggleShowOptInAfterAddingCard(true);
      }
    });
  }

  toggleOptInBanner(data: { isOptedIn: boolean }): void {
    this.canShowOptInBanner$ = of(false);

    const optInBannerConfig = {
      feature: 'DASHBOARD_OPT_IN_BANNER',
      key: 'OPT_IN_BANNER_SHOWN',
      value: true,
    };

    this.featureConfigService.saveConfiguration(optInBannerConfig).subscribe(noop);

    // Update swiper config when banner is dismissed
    this.setSwiperConfig();

    if (data.isOptedIn) {
      this.trackingService.optedInFromDashboardBanner();
      this.eou$ = this.authService.refreshEou();
      this.tasksComponent.doRefresh();
    } else {
      this.trackingService.skipOptInFromDashboardBanner();
    }
  }

  toggleEmailOptInBanner(data: { optedIn: boolean }): void {
    this.canShowEmailOptInBanner$ = of(false);

    const optInBannerConfig = {
      feature: 'DASHBOARD_EMAIL_OPT_IN_BANNER',
      key: 'EMAIL_OPT_IN_BANNER_SHOWN',
      value: true,
    };

    this.featureConfigService.saveConfiguration(optInBannerConfig).subscribe(noop);

    // Update swiper config when banner is dismissed
    this.setSwiperConfig();

    if (data.optedIn) {
      this.trackingService.optedInFromDashboardEmailOptInBanner();
    } else {
      this.trackingService.skipOptInFromDashboardEmailOptInBanner();
    }
  }

  hideOptInDashboardBanner(): void {
    this.canShowOptInBanner$ = of(false);

    // Update swiper config when banner is hidden
    this.setSwiperConfig();
  }

  checkAchSuspension(): void {
    combineLatest([this.eou$, this.orgSettings$])
      .pipe(
        take(1),
        switchMap(([eou, orgSettings]) => {
          // Check LaunchDarkly feature flag first
          return this.launchDarklyService.getVariation('ach_improvement', false).pipe(
            switchMap((isAchImprovementEnabled) => {
              if (!isAchImprovementEnabled) {
                return of(null);
              }

              // Check if ACH is enabled and user hasn't seen the dialog
              if (!orgSettings?.ach_settings?.allowed || !orgSettings?.ach_settings?.enabled) {
                return of(null);
              }

              const dialogShownKey = `ach_suspension_dialog_shown_${eou.ou.id}`;
              if (sessionStorage.getItem(dialogShownKey)) {
                return of(null);
              }

              return this.orgUserService.getDwollaCustomer(eou.ou.id).pipe(
                map((dwollaCustomer) => {
                  if (dwollaCustomer?.customer_suspended) {
                    sessionStorage.setItem(dialogShownKey, 'true');
                    this.showAchSuspensionPopup();
                  }
                  return null;
                }),
                catchError(() => of(null)),
              );
            }),
          );
        }),
      )
      .subscribe();
  }
}
