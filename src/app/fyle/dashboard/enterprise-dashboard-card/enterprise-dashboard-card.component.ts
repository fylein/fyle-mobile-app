import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ReportService } from 'src/app/core/services/report.service';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { DashboardService } from 'src/app/fyle/dashboard/dashboard.service';
import { MobileEventService } from 'src/app/core/services/mobile-event.service';
import { forkJoin } from 'rxjs';
import { map, finalize } from 'rxjs/operators';
import { LoaderService } from 'src/app/core/services/loader.service';
import { Router } from '@angular/router';
import {TrackingService} from '../../../core/services/tracking.service';

@Component({
  selector: 'app-enterprise-dashboard-card',
  templateUrl: './enterprise-dashboard-card.component.html',
  styleUrls: ['./enterprise-dashboard-card.component.scss'],
})
export class EnterpriseDashboardCardComponent implements OnInit {
  item: any;

  @Input() dashboardList: any[];
  @Input() index: number;
  @Input() homeCurrency: any;
  expandedCard: string;
  detailedStats: any[];
  stats: any;
  needsAttentionStats: any = {
    count: 0
  };

  @Output() dashboardToggle: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private transactionService: TransactionService,
    private reportService: ReportService,
    private advanceRequestService: AdvanceRequestService,
    private tripRequestsService: TripRequestsService,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private dashboardService: DashboardService,
    private mobileEventService: MobileEventService,
    private loaderService: LoaderService,
    private router: Router,
    private trackingService: TrackingService
  ) { }

  isBlank(item) {
    return ((item === '') || (item === null)) ? {} : item;
  }

  getExpensesExpandedDetails() {
    const readyToReportStats$ = this.transactionService.getPaginatedETxncStats(this.transactionService.getUserTransactionParams('all'));
    const policyFlaggedStats$ = this.transactionService.getPaginatedETxncStats(this.transactionService.getUserTransactionParams('flagged'));
    const manualFlaggedStats$ = this.transactionService.getPaginatedETxncStats({ policy_flag: false, manual_flag: true, policy_amount: ['is:null', 'gt:0.0001'] });
    const needReviewStats$ = this.transactionService.getPaginatedETxncStats(this.transactionService.getUserTransactionParams('draft'));
    const cannotReportStats$ = this.transactionService.getPaginatedETxncStats(this.transactionService.getUserTransactionParams('critical'));
    const needsReceiptStats$ = this.transactionService.getPaginatedETxncStats(this.transactionService.getUserTransactionParams('needsReceipt'));

    const expensesExpandedDetails$ = forkJoin({
      readyToReportStats: readyToReportStats$,
      policyFlaggedStats: policyFlaggedStats$,
      manualFlaggedStats: manualFlaggedStats$,
      needReviewStats: needReviewStats$,
      cannotReportStats: cannotReportStats$,
      needsReceiptStats: needsReceiptStats$,
    });
    return expensesExpandedDetails$.pipe(
      map((res: any) => {
        res.readyToReportStats = this.isBlank(res.readyToReportStats);
        res.needReviewStats = this.isBlank(res.needReviewStats);
        res.cannotReportStats = this.isBlank(res.cannotReportStats);
        res.needsReceiptStats = this.isBlank(res.needsReceiptStats);

        res.needReviewStats.title = 'Needs Review';
        res.needReviewStats.state = 'needsReview';
        res.needReviewStats.warning = true;

        res.cannotReportStats.title = 'Cannot Report';
        res.cannotReportStats.state = 'cannotReport';
        res.cannotReportStats.warning = true;

        res.readyToReportStats.title = 'Ready to Report';
        res.readyToReportStats.state = 'readyToReport';

        res.needsReceiptStats.title = 'Needs Receipt';
        res.needsReceiptStats.state = 'needsReceipt';
        res.needsReceiptStats.warning = true;


        res.flaggedStats = {};
        res.flaggedStats.title = 'Flagged';
        res.flaggedStats.state = 'policyViolated';
        res.flaggedStats.warning = true;
        res.flaggedStats.total_count = res.policyFlaggedStats.total_count + res.manualFlaggedStats.total_count;
        res.flaggedStats.total_amount = res.policyFlaggedStats.total_amount + res.manualFlaggedStats.total_amount;

        const stats = [res.needReviewStats, res.needsReceiptStats, res.flaggedStats, res.cannotReportStats, res.readyToReportStats];
        return stats;
      })
    );
  }

  getReportsExpandedDetails() {
    const draftStats$ = this.reportService.getPaginatedERptcStats(this.reportService.getUserReportParams('draft'));
    const reportedStats$ = this.reportService.getPaginatedERptcStats(this.reportService.getUserReportParams('pending'));
    const inquiryStats$ = this.reportService.getPaginatedERptcStats(this.reportService.getUserReportParams('inquiry'));
    const approvedStats$ = this.reportService.getPaginatedERptcStats(this.reportService.getUserReportParams('approved'));

    const reportsExpandedDetails$ = forkJoin({
      draftStats: draftStats$,
      reportedStats: reportedStats$,
      inquiryStats: inquiryStats$,
      approvedStats: approvedStats$
    });

    return reportsExpandedDetails$.pipe(
      map(res => {
        res.draftStats = this.isBlank(res.draftStats);
        res.reportedStats = this.isBlank(res.reportedStats);
        res.inquiryStats = this.isBlank(res.inquiryStats);
        res.approvedStats = this.isBlank(res.approvedStats);

        res.draftStats.title = 'Draft';
        res.draftStats.state = 'DRAFT';

        res.reportedStats.title = 'Reported';
        res.reportedStats.state = 'APPROVER_PENDING';

        res.inquiryStats.title = 'Inquiry';
        res.inquiryStats.state = 'APPROVER_INQUIRY';
        res.inquiryStats.warning = true;

        res.approvedStats.title = 'Approved';
        res.approvedStats.state = 'APPROVED';

        const stats = [res.draftStats, res.inquiryStats, res.reportedStats, res.approvedStats];
        return stats;
      })
    );
  }

  getAdvancesExpandedDetails() {
    const draftStats$ = this.advanceRequestService.getPaginatedEAdvanceRequestsStats(this.advanceRequestService.getUserAdvanceRequestParams('draft'));
    const inquiryStats$ = this.advanceRequestService.getPaginatedEAdvanceRequestsStats(this.advanceRequestService.getUserAdvanceRequestParams('inquiry'));
    const pendingStats$ = this.advanceRequestService.getPaginatedEAdvanceRequestsStats(this.advanceRequestService.getUserAdvanceRequestParams('pending'));

    const advancesExpandedDetails$ = forkJoin({
      draftStats: draftStats$,
      inquiryStats: inquiryStats$,
      pendingStats: pendingStats$
    });

    return advancesExpandedDetails$.pipe(
      map(res => {
        res.draftStats = this.isBlank(res.draftStats);
        res.inquiryStats = this.isBlank(res.inquiryStats);
        res.pendingStats = this.isBlank(res.pendingStats);

        res.draftStats.title = 'Draft';

        res.inquiryStats.title = 'Inquiry';
        res.inquiryStats.warning = true;

        res.pendingStats.title = 'Pending';

        const stats = [res.draftStats, res.inquiryStats, res.pendingStats];
        return stats;
      })
    );
  }

  getTripsExpandedDetails() {
    const draftStats$ = this.tripRequestsService.getPaginatedMyETripRequestsCount(this.tripRequestsService.getUserTripRequestStateParams('draft'));
    const inquiryStats$ = this.tripRequestsService.getPaginatedMyETripRequestsCount(this.tripRequestsService.getUserTripRequestStateParams('inquiry'));
    const toCloseStats$ = this.tripRequestsService.getPaginatedMyETripRequestsCount(this.tripRequestsService.getUserTripRequestStateParams('to_close'));
    const submitted$ = this.tripRequestsService.getPaginatedMyETripRequestsCount(this.tripRequestsService.getUserTripRequestStateParams('submitted'));

    const tripsExpandedDetails$ = forkJoin({
      draftStats: draftStats$,
      inquiryStats: inquiryStats$,
      toCloseStats: toCloseStats$,
      submitted: submitted$
    });

    return tripsExpandedDetails$.pipe(
      map(res => {
        res.draftStats = this.isBlank(res.draftStats);
        res.inquiryStats = this.isBlank(res.inquiryStats);
        res.toCloseStats = this.isBlank(res.toCloseStats);
        res.submitted = this.isBlank(res.submitted);

        res.draftStats.title = 'Draft';

        res.inquiryStats.title = 'Inquiry';
        res.inquiryStats.warning = true;

        res.submitted.title = 'Submitted';

        res.toCloseStats.title = 'To Close';

        const stats = [res.draftStats, res.inquiryStats, res.submitted, res.toCloseStats];
        return stats;
      })
    );
  }

  getCCCEExpandedDetails() {
    const CCCEExpandedDetails$ = this.corporateCreditCardExpenseService.getPaginatedECorporateCreditCardExpenseStats({ state: 'INITIALIZED' });

    return CCCEExpandedDetails$.pipe(
      map((res: any) => {
        res = this.isBlank(res);
        res.title = 'Unclassified Transaction' + (Number(res.total_count) > 1 ? 's' : '');
        res.warning = true;

        const stats = [res];
        return stats;
      })
    );
  }


  getExpandedDetails(title) {
    title = title.replace(' ', '_');
    const expandedCardDetailsMap = {
      expenses: this.getExpensesExpandedDetails,
      reports: this.getReportsExpandedDetails,
      advances: this.getAdvancesExpandedDetails,
      trips: this.getTripsExpandedDetails,
      corporate_cards: this.getCCCEExpandedDetails
    };
    return expandedCardDetailsMap[title].apply(this);
  }

  goToCreateReport() {
    this.trackingService.clickCreateReport({Asset: 'Mobile'});
    this.router.navigate(['/', 'enterprise', 'my_create_report', { isRedirectedFromDashboard: true }]);
  }

  filterToState(type, state) {
    if (type === 'expenses') {
      if (state !== 'readyToReport') {
        this.router.navigate(['/', 'enterprise', 'my_expenses', { state, navigateBack: true }]);
      } else {
        this.goToCreateReport();
      }
    } else if (type === 'reports') {
      this.router.navigate(['/', 'enterprise', 'my_reports', { state, navigateBack: true }]);
    } else {
      const navigateToMap = {
        trips: ['/', 'enterprise', 'my_trips'],
        advances: ['/', 'enterprise', 'my_advances'],
        'corporate cards' : ['/', 'enterprise', 'corporate_card_expenses']
      };
      this.router.navigate([...navigateToMap[type], {navigateBack: true}]);
    }
  }

  async expandCard() {
    if (this.item.title !== this.expandedCard) {
      await this.loaderService.showLoader();

      this.expandedCard = this.item && this.item.title ? this.item.title : '';
      this.dashboardList = this.dashboardList.map((dashboardItem) => {
        dashboardItem.isCollapsed = true;
        return dashboardItem;
      });

      this.item.isCollapsed = false;
      if (this.item && this.item.title) {
        const expandedDetails$ = this.getExpandedDetails(this.item.title).pipe(
          finalize(async () => {
            await this.loaderService.hideLoader();
          })
        );
        expandedDetails$.subscribe((res) => {
          this.detailedStats = res;
          this.mobileEventService.dashboardCardExpanded();
          this.dashboardService.setDashBoardState(this.item.title);
        });
      }
    } else {
      this.dashboardToggle.emit(true);
    }
  }

  getExpenseNeedAttentionStats() {
    const policyFlaggedCount$ = this.transactionService.getPaginatedETxncCount(this.transactionService.getUserTransactionParams('flagged'));
    const manualFlaggedCount$ = this.transactionService.getPaginatedETxncCount({ policy_flag: false, manual_flag: true, policy_amount: ['is:null', 'gt:0.0001'] });
    const needReviewCount$ = this.transactionService.getPaginatedETxncCount(this.transactionService.getUserTransactionParams('draft'));
    const cannotReportCount$ = this.transactionService.getPaginatedETxncCount(this.transactionService.getUserTransactionParams('critical'));
    const needsReceiptCount$ = this.transactionService.getPaginatedETxncCount(this.transactionService.getUserTransactionParams('needsReceipt'));

    return forkJoin({
      policyFlaggedCount$,
      manualFlaggedCount$,
      needReviewCount$,
      cannotReportCount$,
      needsReceiptCount$
    });
  }

  getReportNeedAttentionStats() {
    return this.reportService.getPaginatedERptcCount({ state: 'APPROVER_INQUIRY' });
  }

  getAdvanceNeedAttentionStats() {
    return this.advanceRequestService.getPaginatedMyEAdvanceRequestsCount(this.advanceRequestService.getUserAdvanceRequestParams('inquiry'));
  }

  getTripNeedAttentionStats() {
    return this.tripRequestsService.getPaginatedMyETripRequestsCount(this.tripRequestsService.getUserTripRequestStateParams('inquiry'));
  }

  getNeedAttentionCount(stats) {
    if (this.dashboardList && this.dashboardList[this.index]) {
      if (this.dashboardList[this.index].title === 'corporate cards') {
        this.needsAttentionStats.count = stats && stats.total_count;
      } else {
        const countMap = {
          expenses: this.getExpenseNeedAttentionStats(),
          reports: this.getReportNeedAttentionStats(),
          advances: this.getAdvanceNeedAttentionStats(),
          trips: this.getTripNeedAttentionStats()
        };

        const count$ = countMap[this.dashboardList[this.index].title];

        count$.subscribe((res) => {
          if (this.dashboardList[this.index].title === 'expenses') {
            this.needsAttentionStats.count = (res.policyFlaggedCount$.count || 0) + (res.manualFlaggedCount$.count || 0) + (res.needReviewCount$.count || 0) + (res.cannotReportCount$.count || 0);
          } else {
            this.needsAttentionStats.count = res.count;
          }
        });
      }
    }
  }

  async getStats() {
    if (this.dashboardList && this.dashboardList[this.index]) {
      // await this.loaderService.showLoader();
      this.dashboardList[this.index].isLoading = true;
      const title = this.dashboardList[this.index].title.replace(' ', '_');

      const statsMap = {
        expenses: this.transactionService.getPaginatedETxncStats(this.transactionService.getUserTransactionParams('all')),
        reports: this.reportService.getPaginatedERptcStats(this.reportService.getUserReportParams('pending')),
        advances: this.advanceRequestService.getPaginatedEAdvanceRequestsStats(this.advanceRequestService.getUserAdvanceRequestParams('pending')),
        trips: this.tripRequestsService.getPaginatedMyETripRequestsCount(this.tripRequestsService.getUserTripRequestStateParams('submitted')),
        corporate_cards: this.corporateCreditCardExpenseService.getPaginatedECorporateCreditCardExpenseStats({ state: 'INITIALIZED' })
      };

      const stats$ = statsMap[title].pipe(
        finalize(async () => {
          //await this.loaderService.hideLoader();
        })
      );

      stats$.subscribe((res) => {
        this.stats = res;
        this.getNeedAttentionCount(this.stats);
      });
    }
  }

  ngOnInit() {
    this.item = this.dashboardList[this.index];
    this.getStats();
  }
}
