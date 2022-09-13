import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { OfflineService } from 'src/app/core/services/offline.service';
import { concat, forkJoin, from, Observable, of, Subject } from 'rxjs';
import { filter, shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { ActionSheetController, PopoverController } from '@ionic/angular';
import { NetworkService } from '../../core/services/network.service';
import { OrgUserSettings } from 'src/app/core/models/org_user_settings.model';
import { StatsComponent } from './stats/stats.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FooterState } from '../../shared/components/footer/footer-state';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TasksComponent } from './tasks/tasks.component';
import { TasksService } from 'src/app/core/services/tasks.service';
import { RateApp } from 'capacitor-rate-app';

enum DashboardState {
  home,
  tasks,
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  @ViewChild(StatsComponent) statsComponent: StatsComponent;

  @ViewChild(TasksComponent) tasksComponent: TasksComponent;

  orgUserSettings$: Observable<OrgUserSettings>;

  orgSettings$: Observable<any>;

  homeCurrency$: Observable<any>;

  isConnected$: Observable<boolean>;

  onPageExit$ = new Subject();

  currentStateIndex = 0;

  actionSheetButtons = [];

  taskCount = 0;

  isOfflineFormsRemoved = false;

  constructor(
    private offlineService: OfflineService,
    private transactionService: TransactionService,
    private storageService: StorageService,
    private popoverController: PopoverController,
    private networkService: NetworkService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private trackingService: TrackingService,
    private actionSheetController: ActionSheetController,
    private tasksService: TasksService
  ) {}

  get displayedTaskCount() {
    if (this.activatedRoute.snapshot.queryParams.state === 'tasks') {
      return this.tasksComponent?.taskCount;
    } else {
      return this.taskCount;
    }
  }

  get FooterState() {
    return FooterState;
  }

  get filterPills() {
    return this.tasksComponent?.filterPills;
  }

  ionViewWillLeave() {
    this.onPageExit$.next(null);
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      takeUntil(this.onPageExit$),
      shareReplay(1)
    );
  }

  ionViewWillEnter() {
    this.setupNetworkWatcher();
    from(this.storageService.get('isOfflineFormsRemoved')).subscribe((res) => {
      this.isOfflineFormsRemoved = res;
    });
    this.taskCount = 0;
    const currentState =
      this.activatedRoute.snapshot.queryParams.state === 'tasks' ? DashboardState.tasks : DashboardState.home;
    if (currentState === DashboardState.tasks) {
      this.currentStateIndex = 1;
    } else {
      this.currentStateIndex = 0;
    }

    this.orgUserSettings$ = this.offlineService.getOrgUserSettings().pipe(shareReplay(1));
    this.orgSettings$ = this.offlineService.getOrgSettings().pipe(shareReplay(1));
    this.homeCurrency$ = this.offlineService.getHomeCurrency().pipe(shareReplay(1));

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

  ionViewDidEnter() {
    RateApp.requestReview();
  }

  ngOnInit() {
    const that = this;
    that.offlineService.getOrgSettings().subscribe((orgSettings) => {
      this.setupActionSheet(orgSettings);
    });
  }

  onTaskClicked() {
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

  openFilters() {
    this.tasksComponent.openFilters();
  }

  onCameraClicked() {
    this.router.navigate([
      '/',
      'enterprise',
      'camera_overlay',
      {
        navigate_back: true,
      },
    ]);
  }

  onHomeClicked() {
    this.currentStateIndex = 0;
    const queryParams: Params = { state: 'home' };
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams,
    });
  }

  setupActionSheet(orgSettings) {
    const that = this;
    const mileageEnabled = orgSettings.mileage.enabled;
    const isPerDiemEnabled = orgSettings.per_diem.enabled;
    that.actionSheetButtons = [
      {
        text: 'Capture Receipt',
        icon: 'assets/svg/fy-camera.svg',
        cssClass: 'capture-receipt',
        handler: () => {
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
        handler: () => {
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

  async openAddExpenseActionSheet() {
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
