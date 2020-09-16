import { Component, OnInit, Input } from '@angular/core';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { pipe, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
// import { humanizeCurrency } from 'src/app/shared/pipe/humanize-currency.pipe';




@Component({
  selector: 'app-enterprise-dashboard-card',
  templateUrl: './enterprise-dashboard-card.component.html',
  styleUrls: ['./enterprise-dashboard-card.component.scss'],
})
export class EnterpriseDashboardCardComponent implements OnInit {
	item: any

  @Input() dashboardList: any[];
  @Input() index: number;
  expandedCard: string;
  detailedStats: any[];
  constructor(
    private transactionService: TransactionService
  ) { }

  isBlank = function (item) {
    return item === '' ? {} : item;
  };

  getExpensesExpandedDetails() {
    const readyToReportStats$ = this.transactionService.getPaginatedETxncStats(this.transactionService.getUserTransactionParams('all'));
    const policyFlaggedStats$ = this.transactionService.getPaginatedETxncStats(this.transactionService.getUserTransactionParams('flagged'));
    const manualFlaggedStats$ = this.transactionService.getPaginatedETxncStats({policy_flag: false, manual_flag: true, policy_amount: ['is:null', 'gt:0.0001']});
    const needReviewStats$ = this.transactionService.getPaginatedETxncStats(this.transactionService.getUserTransactionParams('draft'));
    const cannotReportStats$ = this.transactionService.getPaginatedETxncStats(this.transactionService.getUserTransactionParams('critical'));
    const needsReceiptStats$ = this.transactionService.getPaginatedETxncStats(this.transactionService.getUserTransactionParams('needsReceipt'));

    const expensesExpandedDetails$ = forkJoin({
      readyToReportStats$,
      policyFlaggedStats$,
      manualFlaggedStats$,
      needReviewStats$,
      cannotReportStats$,
      needsReceiptStats$,
    });
    return expensesExpandedDetails$.pipe(
      map(res => {
        console.log(res);
        res.readyToReportStats$ = this.isBlank(res.readyToReportStats$);
        res.needReviewStats$ = this.isBlank(res.needReviewStats$);
        res.cannotReportStats$ = this.isBlank(res.cannotReportStats$);
        res.needsReceiptStats$ = this.isBlank(res.needsReceiptStats$);

        res.needReviewStats$['title'] = 'Needs Review';
        res.needReviewStats$['state'] = 'needsReview';
        res.needReviewStats$['warning'] = true;

        res.cannotReportStats$['title'] = 'Cannot Report';
        res.cannotReportStats$['state'] = 'cannotReport';
        res.cannotReportStats$['warning'] = true;

        res.readyToReportStats$['title'] = 'Ready to Report';
        res.readyToReportStats$['state'] = 'readyToReport';

        res.needsReceiptStats$['title'] = 'Needs Receipt';
        res.needsReceiptStats$['state'] = 'needsReceipt';
        res.needsReceiptStats$['warning'] = true;


        res['flaggedStats$'] = {};
        res['flaggedStats$']['title'] = 'Flagged';
        res['flaggedStats$']['state'] = 'policyViolated';
        res['flaggedStats$']['warning'] = true;
        res['flaggedStats$']['total_count'] = res.policyFlaggedStats$['total_count'] + res.manualFlaggedStats$['total_count'];
        res['flaggedStats$']['total_amount'] = res.policyFlaggedStats$['total_amount'] + res.manualFlaggedStats$['total_amount'];

        var stats = [res.needReviewStats$, res.needsReceiptStats$, res['flaggedStats$'], res.cannotReportStats$, res.readyToReportStats$];
        return stats;
      })
    );
  }

  getExpandedDetails (title) {
    var title = title.replace(' ', '_');
    var expandedCardDetailsMap = {
      expenses: this.getExpensesExpandedDetails,
      // reports: getReportsExpandedDetails,
      // trips: getTripsExpandedDetails,
      // advances: getAdvancesExpandedDetails,
      // corporate_cards: getCCCEExpandedDetails
    };
    return expandedCardDetailsMap[title].apply(this);
  }

  filterToState(a,b) {
    console.log("coming soon");
  }


  expandCard(item) {
    this.expandedCard = this.item && this.item.title ? this.item.title : '';
    this.dashboardList = this.dashboardList.map(function (item) {
      item.isCollapsed = true;
      return item;
    });
    
    this.item.isCollapsed = false;
    if (this.item && this.item.title) {
      const expandedDetails$ = this.getExpandedDetails(this.item.title);
      expandedDetails$.subscribe((res) => {
        this.detailedStats = res;
      })
    }
  }

  ngOnInit() {
    this.item = this.dashboardList[this.index];
  }

}
