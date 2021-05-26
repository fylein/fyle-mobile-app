import {Component, OnInit, Output} from '@angular/core';
import {StatBadgeColors} from '../stat-badge/stat-badge-colors';
import {DashboardService} from '../dashboard.service';
import {Observable} from 'rxjs/internal/Observable';
import {shareReplay} from 'rxjs/internal/operators/shareReplay';
import {map, startWith, tap} from 'rxjs/operators';
import {CurrencyService} from '../../../core/services/currency.service';
import {Params, Router} from '@angular/router';
import {ActionSheetController} from '@ionic/angular';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit {
  initialEmptyReportStats = {
    draft: {
      sum: 0,
      count: 0
    },
    report: {
      sum: 0,
      count: 0
    },
    approved: {
      sum: 0,
      count: 0
    },
    paymentPending: {
      sum: 0,
      count: 0
    }
  };

  initialEmptyExpenseStats = {
    totalCount: 0,
    totalAmount: 0
  };

  get StatBadgeColors() {
    return StatBadgeColors;
  }

  draftStats$: Observable<{ count: number, sum: number }>;
  reportedStats$: Observable<{ count: number, sum: number }>;
  approvedStats$: Observable<{ count: number, sum: number }>;
  paymentPendingStats$: Observable<{ count: number, sum: number }>;
  homeCurrency$: Observable<string>;

  unreportedExpensesCount$: Observable<number>;
  unreportedExpensesAmount$: Observable<number>;

  constructor(
      private dashboardService: DashboardService,
      private currencyService: CurrencyService,
      private router: Router,
      private actionSheetController: ActionSheetController
  ) {
  }

  initializeReportStats() {
    const reportStats$ = this.dashboardService.getReportsStats().pipe(
        startWith(this.initialEmptyReportStats),
        shareReplay(1)
    );

    this.draftStats$ = reportStats$.pipe(
        map(stats => stats.draft)
    );

    this.reportedStats$ = reportStats$.pipe(
        map(stats => stats.report)
    );

    this.approvedStats$ = reportStats$.pipe(
        map(stats => stats.approved)
    );

    this.paymentPendingStats$ = reportStats$.pipe(
        map(stats => stats.paymentPending)
    );
  }

  initializeExpensesStats() {
    const unreportedExpensesStats$ = this.dashboardService.getUnreportedExpensesStats().pipe(
        startWith(this.initialEmptyExpenseStats),
        shareReplay(1),
        tap(console.log)
    );

    this.unreportedExpensesCount$ = unreportedExpensesStats$.pipe(
        map(stats => stats.totalCount)
    );

    this.unreportedExpensesAmount$ = unreportedExpensesStats$.pipe(
        map(stats => stats.totalAmount)
    );
  }

  /*
  * This is required because ionic dosnt reload the page every time we enter, it initializes via ngOnInit only on first entry.
  * The ionViewWillEnter is an alternative for this but not present in child pages.
  * Here, I am setting up the initialize method to be called from the parent's ionViewWillEnter method.
  * **/
  init() {
    this.homeCurrency$ = this.currencyService.getHomeCurrency().pipe(
        shareReplay(1)
    );
    this.initializeReportStats();
    this.initializeExpensesStats();
  }

  ngOnInit() {
    this.homeCurrency$ = this.currencyService.getHomeCurrency().pipe(
        shareReplay(1)
    );
  }

  redirectToReportsPage(queryParams: Params) {
    this.router.navigate(['/', 'enterprise', 'my_reports'], {
      queryParams
    });
  }

  goToDraftState() {
    const queryParams: Params = {filters: JSON.stringify({state: 'DRAFT'})};
    this.redirectToReportsPage(queryParams);
  }

  goToReportedState() {
    const queryParams: Params = {filters: JSON.stringify({state: 'APPROVER_PENDING'})};
    this.redirectToReportsPage(queryParams);
  }

  goToApprovedState() {
    const queryParams: Params = {filters: JSON.stringify({state: 'APPROVED'})};
    this.redirectToReportsPage(queryParams);
  }

  goToPaymentPendingState() {
    const queryParams: Params = {filters: JSON.stringify({state: 'PAYMENT_PENDING'})};
    this.redirectToReportsPage(queryParams);
  }

  onExpenseStatsCardClick() {
    const queryParams: Params = {filters: JSON.stringify({state: 'READY_TO_REPORT'})};
    this.router.navigate(['/', 'enterprise', 'my_expenses'], {
      queryParams
    });
  }

  async openAddExpenseActionSheet() {
    const that = this;
    const actionSheet = await this.actionSheetController.create({
      header: 'Add Expense',
      mode: 'md',
      buttons: [{
        text: 'Capture Receipt',
        icon: 'camera',
        handler: () => {
          that.router.navigate(['/', 'enterprise', 'camera_overlay']);
        }
      }, {
        text: 'Add Manually',
        icon: 'document-text',
        handler: () => {
          that.router.navigate(['/', 'enterprise', 'add_edit_expense']);
        }
      }, {
        text: 'Add Mileage',
        icon: 'speedometer',
        handler: () => {
          that.router.navigate(['/', 'enterprise', 'add_edit_mileage']);
        }
      }, {
        text: 'Add Per Diem',
        icon: 'calendar',
        handler: () => {
          that.router.navigate(['/', 'enterprise', 'add_edit_per_diem']);
        }
      }]
    });
    await actionSheet.present();
  }
}
