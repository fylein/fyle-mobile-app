import { Component, EventEmitter, ViewChild } from '@angular/core';
import { concat, forkJoin, Observable, of, Subject, Subscription } from 'rxjs';
import { shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { ActionSheetButton, ActionSheetController, NavController, Platform } from '@ionic/angular';
import { NetworkService } from '../../core/services/network.service';
import { OrgUserSettings } from 'src/app/core/models/org_user_settings.model';
import { StatsComponent } from './stats/stats.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FooterState } from '../../shared/components/footer/footer-state';
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

enum DashboardState {
  home,
  tasks,
}

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

  actionSheetButtons: ActionSheetButton[] = [];

  taskCount = 0;

  hardwareBackButtonAction: Subscription;

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
    private navController: NavController
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
    return this.tasksComponent?.filterPills;
  }

  ionViewWillLeave(): void {
    this.onPageExit$.next(null);
    this.hardwareBackButtonAction?.unsubscribe();
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      takeUntil(this.onPageExit$),
      shareReplay(1)
    );
  }

  ionViewWillEnter(): void {
    this.setupNetworkWatcher();
    this.registerBackButtonAction();
    this.smartlookService.init();
    this.taskCount = 0;
    const currentState =
      this.activatedRoute.snapshot.queryParams.state === 'tasks' ? DashboardState.tasks : DashboardState.home;
    if (currentState === DashboardState.tasks) {
      this.currentStateIndex = 1;
    } else {
      this.currentStateIndex = 0;
    }

    this.orgUserSettings$ = this.orgUserSettingsService.get().pipe(shareReplay(1));
    this.orgSettings$ = this.orgSettingsService.get().pipe(shareReplay(1));
    this.specialCategories$ = this.categoriesService.getMileageOrPerDiemCategories().pipe(shareReplay(1));
    this.homeCurrency$ = this.currencyService.getHomeCurrency().pipe(shareReplay(1));

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
        text: 'Capture Receipt',
        icon: 'assets/svg/camera.svg',
        cssClass: 'capture-receipt',
        handler: this.actionSheetButtonsHandler('Capture Receipt', 'camera_overlay'),
      },
      {
        text: 'Add Manually',
        icon: 'assets/svg/expense.svg',
        cssClass: 'capture-receipt',
        handler: this.actionSheetButtonsHandler('Add Manually', 'add_edit_expense'),
      },
    ];

    if (mileageEnabled) {
      that.actionSheetButtons.push({
        text: 'Add Mileage',
        icon: 'assets/svg/mileage.svg',
        cssClass: 'capture-receipt',
        handler: this.actionSheetButtonsHandler('Add Mileage', 'add_edit_mileage'),
      });
    }

    if (isPerDiemEnabled) {
      that.actionSheetButtons.push({
        text: 'Add Per Diem',
        icon: 'assets/svg/calendar.svg',
        cssClass: 'capture-receipt',
        handler: this.actionSheetButtonsHandler('Add Per Diem', 'add_edit_per_diem'),
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
}
