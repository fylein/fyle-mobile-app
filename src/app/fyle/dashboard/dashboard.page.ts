import { Component, EventEmitter, ViewChild } from '@angular/core';
import { concat, forkJoin, from, noop, Observable, of, Subject, Subscription } from 'rxjs';
import { map, shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { ActionSheetButton, ActionSheetController, ModalController, NavController, Platform } from '@ionic/angular';
import { NetworkService } from '../../core/services/network.service';
import { OrgUserSettings } from 'src/app/core/models/org_user_settings.model';
import { StatsComponent } from './stats/stats.component';
import { ActivatedRoute, NavigationStart, Params, Router } from '@angular/router';
import { FooterState } from '../../shared/components/footer/footer-state.enum';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TasksComponent } from './tasks/tasks.component';
import { TasksService } from 'src/app/core/services/tasks.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { SmartlookService } from 'src/app/core/services/smartlook.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
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
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { driver, Driver, DriveStep } from 'driver.js';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage {
  @ViewChild(StatsComponent) statsComponent: StatsComponent;

  @ViewChild(CardStatsComponent) cardStatsComponent: CardStatsComponent;

  @ViewChild(TasksComponent) tasksComponent: TasksComponent;

  orgUserSettings$: Observable<OrgUserSettings>;

  orgSettings$: Observable<OrgSettings>;

  specialCategories$: Observable<PlatformCategory[]>;

  homeCurrency$: Observable<string>;

  isConnected$: Observable<boolean>;

  onPageExit$ = new Subject();

  currentStateIndex = 0;

  currentActiveState = FooterState.HOME;

  actionSheetButtons: ActionSheetButton[] = [];

  taskCount = 0;

  hardwareBackButtonAction: Subscription;

  optInShowTimer;

  navigationSubscription: Subscription;

  canShowOptInBanner$: Observable<boolean>;

  eou$: Observable<ExtendedOrgUser>;

  isUserFromINCluster$: Observable<boolean>;

  private driver: Driver;

  constructor(
    private currencyService: CurrencyService,
    private networkService: NetworkService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private trackingService: TrackingService,
    private actionSheetController: ActionSheetController,
    private tasksService: TasksService,
    private smartlookService: SmartlookService,
    private orgUserSettingsService: OrgUserSettingsService,
    private orgSettingsService: OrgSettingsService,
    private categoriesService: CategoriesService,
    private platform: Platform,
    private backButtonService: BackButtonService,
    private navController: NavController,
    private modalController: ModalController,
    private utilityService: UtilityService,
    private featureConfigService: FeatureConfigService,
    private modalProperties: ModalPropertiesService,
    private authService: AuthService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService
  ) {}

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

  initializeTour(): void {
    this.driver = driver({
      overlayOpacity: 0.75,
      allowClose: true,
      overlayClickBehavior: 'nextStep',
      showProgress: true,
      stageRadius: 8,
      popoverClass: 'custom-popover',
      doneBtnText: 'Ok',
      nextBtnText: 'Next',
      prevBtnText: 'Back',
    });

    const steps: DriveStep[] = [
      {
        element: '#tab-button-expenses',
        popover: {
          description: 'You can now access Expenses directly from the navigation bar.',
          side: 'top',
          align: 'start',
          showButtons: ['next'],
        },
      },
      {
        element: '#tab-button-reports',
        popover: {
          description: 'You can now access Reports directly from the navigation bar.',
          side: 'top',
          align: 'end',
        },
      },
    ];

    this.driver.setSteps(steps);
    this.driver.drive();
  }

  ionViewWillLeave(): void {
    clearTimeout(this.optInShowTimer as number);
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
      shareReplay(1)
    );
  }

  setShowOptInBanner(): void {
    const optInBannerConfig = {
      feature: 'DASHBOARD_OPT_IN_BANNER',
      key: 'OPT_IN_BANNER_SHOWN',
    };

    const isBannerShown$ = this.featureConfigService
      .getConfiguration(optInBannerConfig)
      .pipe(map((config) => config?.value));

    this.canShowOptInBanner$ = forkJoin({
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
      })
    );
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

  ionViewWillEnter(): void {
    this.setupNetworkWatcher();
    this.registerBackButtonAction();
    this.smartlookService.init();
    this.initializeTour();
    this.taskCount = 0;
    const currentState =
      this.activatedRoute.snapshot.queryParams.state === 'tasks' ? DashboardState.tasks : DashboardState.home;
    if (currentState === DashboardState.tasks) {
      this.currentActiveState = FooterState.TASKS;
      this.currentStateIndex = 1;
    } else {
      this.currentActiveState = FooterState.HOME;
      this.currentStateIndex = 0;
    }

    this.orgUserSettings$ = this.orgUserSettingsService.get().pipe(shareReplay(1));
    this.orgSettings$ = this.orgSettingsService.get().pipe(shareReplay(1));
    this.specialCategories$ = this.categoriesService.getMileageOrPerDiemCategories().pipe(shareReplay(1));
    this.homeCurrency$ = this.currencyService.getHomeCurrency().pipe(shareReplay(1));
    this.eou$ = from(this.authService.getEou()).pipe(shareReplay(1));
    this.isUserFromINCluster$ = from(this.utilityService.isUserFromINCluster());

    this.setShowOptInBanner();

    const openSMSOptInDialog = this.activatedRoute.snapshot.params.openSMSOptInDialog as string;
    if (openSMSOptInDialog === 'true') {
      this.eou$
        .pipe(
          map((eou) => {
            if (eou.ou.mobile_verified) {
              this.showInfoToastMessage('You are already opted into text messaging!');
            } else {
              this.openSMSOptInDialog(eou);
            }
          })
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
      this.backButtonActionHandler
    );
  }

  onTaskClicked(): void {
    this.currentStateIndex = 1;
    this.currentActiveState = FooterState.TASKS;
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

  onExpensesClicked(): void {
    this.currentActiveState = FooterState.EXPENSES;
    this.router.navigate(
      [
        '/',
        'enterprise',
        'my_expenses',
        {
          navigate_back: true,
        },
      ],
      { skipLocationChange: true, replaceUrl: true }
    );
  }

  onReportsClicked(): void {
    this.currentActiveState = FooterState.REPORTS;
    this.router.navigate(
      [
        '/',
        'enterprise',
        'my_reports',
        {
          navigate_back: true,
        },
      ],
      { skipLocationChange: true, replaceUrl: true }
    );
  }

  onHomeClicked(): void {
    this.currentStateIndex = 0;
    this.currentActiveState = FooterState.HOME;
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

    if (data.isOptedIn) {
      this.trackingService.optedInFromDashboardBanner();
      this.eou$ = this.authService.refreshEou();
      this.tasksComponent.doRefresh();
    } else {
      this.trackingService.skipOptInFromDashboardBanner();
    }
  }

  hideOptInDashboardBanner(): void {
    this.canShowOptInBanner$ = of(false);
  }
}
