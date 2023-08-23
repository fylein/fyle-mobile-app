import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { concat, forkJoin, Observable, of, Subject, Subscription } from 'rxjs';
import { shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { ActionSheetController, NavController, Platform, PopoverController } from '@ionic/angular';
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
import { CardStatsComponent } from './card-stats/card-stats.component';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { AddCorporateCardComponent } from '../manage-corporate-cards/add-corporate-card/add-corporate-card.component';
import { OverlayResponse } from 'src/app/core/models/overlay-response.modal';
import { CardAddedComponent } from '../manage-corporate-cards/card-added/card-added.component';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';

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

  @ViewChild(CardStatsComponent) cardStatsComponent: CardStatsComponent;

  @ViewChild(TasksComponent) tasksComponent: TasksComponent;

  orgUserSettings$: Observable<OrgUserSettings>;

  orgSettings$: Observable<OrgSettings>;

  homeCurrency$: Observable<string>;

  isConnected$: Observable<boolean>;

  onPageExit$ = new Subject();

  currentStateIndex = 0;

  actionSheetButtons = [];

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
    private popoverController: PopoverController,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService
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
    this.hardwareBackButtonAction?.unsubscribe();
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

  registerBackButtonAction() {
    this.hardwareBackButtonAction = this.platform.backButton.subscribeWithPriority(BackButtonActionPriority.LOW, () => {
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
    });
  }

  ngOnInit() {}

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

    this.trackingService.footerHomeTabClicked({
      page: 'Dashboard',
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

  openAddCorporateCardPopover(): void {
    forkJoin([this.orgSettings$, this.orgUserSettings$]).subscribe(async ([orgSettings, orgUserSettings]) => {
      const isVisaRTFEnabled =
        orgSettings.visa_enrollment_settings.allowed && orgSettings.visa_enrollment_settings.enabled;

      const isMastercardRTFEnabled =
        orgSettings.mastercard_enrollment_settings.allowed && orgSettings.mastercard_enrollment_settings.enabled;

      const isYodleeEnabled =
        orgSettings.bank_data_aggregation_settings.allowed &&
        orgSettings.bank_data_aggregation_settings.enabled &&
        orgUserSettings.bank_data_aggregation_settings.enabled;

      const popover = await this.popoverController.create({
        component: AddCorporateCardComponent,
        cssClass: 'fy-dialog-popover',
        componentProps: {
          isVisaRTFEnabled,
          isMastercardRTFEnabled,
          isYodleeEnabled,
        },
      });

      await popover.present();
      const popoverResponse = (await popover.onDidDismiss()) as OverlayResponse<{ success: boolean }>;

      if (popoverResponse.data?.success) {
        this.handleEnrollmentSuccess();
      }
    });
  }

  private handleEnrollmentSuccess(): void {
    this.corporateCreditCardExpenseService.clearCache().subscribe(async () => {
      this.cardStatsComponent.init();

      const cardAddedModal = await this.popoverController.create({
        component: CardAddedComponent,
        cssClass: 'pop-up-in-center',
      });

      await cardAddedModal.present();
    });
  }
}
