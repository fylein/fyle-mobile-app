import { Component, EventEmitter, ViewChild } from '@angular/core';
import { concat, Observable, of, Subject, Subscription } from 'rxjs';
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

  @ViewChild(TasksComponent) tasksComponent: TasksComponent;

  orgUserSettings$: Observable<OrgUserSettings>;

  orgSettings$: Observable<OrgSettings>;

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
    private platform: Platform,
    private backButtonService: BackButtonService,
    private navController: NavController,
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
      shareReplay(1),
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
    this.homeCurrency$ = this.currencyService.getHomeCurrency().pipe(shareReplay(1));

    this.orgSettings$.subscribe((orgSettings) => {
      this.setupActionSheet(orgSettings);
    });

    this.statsComponent.init();
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

  setupActionSheet(orgSettings: OrgSettings): void {
    const that = this;
    const mileageEnabled = orgSettings.mileage.enabled;
    const isPerDiemEnabled = orgSettings.per_diem.enabled;
    that.actionSheetButtons = [
      {
        text: 'Capture Receipt',
        icon: 'assets/svg/fy-camera.svg',
        cssClass: 'capture-receipt',
        handler: (): void => {
          that.trackingService.dashboardActionSheetButtonClicked({
            Action: 'Capture Receipt',
          });
          that.router.navigate([
            '/',
            'enterprise',
            'camera_overlay',
            {
              navigate_back: true,
            },
          ]);
        },
      },
      {
        text: 'Add Manually',
        icon: 'assets/svg/fy-expense.svg',
        cssClass: 'capture-receipt',
        handler: (): void => {
          that.trackingService.dashboardActionSheetButtonClicked({
            Action: 'Add Manually',
          });
          that.router.navigate([
            '/',
            'enterprise',
            'add_edit_expense',
            {
              navigate_back: true,
            },
          ]);
        },
      },
    ];

    if (mileageEnabled) {
      this.actionSheetButtons.push({
        text: 'Add Mileage',
        icon: 'assets/svg/fy-mileage.svg',
        cssClass: 'capture-receipt',
        handler: () => {
          that.trackingService.dashboardActionSheetButtonClicked({
            Action: 'Add Mileage',
          });
          that.router.navigate([
            '/',
            'enterprise',
            'add_edit_mileage',
            {
              navigate_back: true,
            },
          ]);
        },
      });
    }

    if (isPerDiemEnabled) {
      that.actionSheetButtons.push({
        text: 'Add Per Diem',
        icon: 'assets/svg/fy-calendar.svg',
        cssClass: 'capture-receipt',
        handler: () => {
          that.trackingService.dashboardActionSheetButtonClicked({
            Action: 'Add Per Diem',
          });
          that.router.navigate([
            '/',
            'enterprise',
            'add_edit_per_diem',
            {
              navigate_back: true,
            },
          ]);
        },
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
