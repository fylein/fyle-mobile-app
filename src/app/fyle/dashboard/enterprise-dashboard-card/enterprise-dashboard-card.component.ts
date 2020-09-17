import { Component, OnInit, Input } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { DashboardService } from 'src/app/fyle/dashboard/dashboard.service';
import { MobileEventService } from 'src/app/core/services/mobile-event.service';
import { pipe, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

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
  homeCurrency: string;
  stats: any;
  needsAttentionStats: any = {
    count: 0
  };
  constructor(
    private transactionService: TransactionService,
    private dashboardService: DashboardService,
    private mobileEventService: MobileEventService,
    private alertController: AlertController
  ) { }

  isBlank = function (item) {
    return item === '' ? {} : item;
  };

  getExpensesExpandedDetails() {
    // const readyToReportStats$ = this.transactionService.getPaginatedETxncStats(this.transactionService.getUserTransactionParams('all'));
    const readyToReportStats$ = this.dashboardService.getreadyToReportStats();
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
      reports: this.getExpensesExpandedDetails, //change this later
      trips: this.getExpensesExpandedDetails,
      advances: this.getExpensesExpandedDetails,
      corporate_cards: this.getExpensesExpandedDetails
    };
    return expandedCardDetailsMap[title].apply(this);
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Coming soon',
      buttons: ['Close']
    });

    await alert.present();
  }

  filterToState(a,b) {
    this.presentAlert();
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
        this.mobileEventService.dashboardCardExpanded();
        this.dashboardService.setDashBoardState(this.item.title);
      })
    }
  }

  getHomeCurrency() {
    // get home currency from homeCurrency srvice later
    this.homeCurrency = "INR";
  };

  getNeedAttentionCount(stats) {
    if (this.dashboardList && this.dashboardList[this.index]) {
      if (this.dashboardList[this.index].title === 'corporate cards') {
        // later for CCC
      } else if (this.dashboardList[this.index].title === 'expenses') {


        // var promises = {
          const policyFlaggedCount$ = this.transactionService.getPaginatedETxncCount(this.transactionService.getUserTransactionParams('flagged'));
          const manualFlaggedCount$ = this.transactionService.getPaginatedETxncCount({policy_flag: false, manual_flag: true, policy_amount: ['is:null', 'gt:0.0001']});
          const needReviewCount$ = this.transactionService.getPaginatedETxncCount(this.transactionService.getUserTransactionParams('draft'));
          const cannotReportCount$ = this.transactionService.getPaginatedETxncCount(this.transactionService.getUserTransactionParams('critical'));
          const needsReceiptCount$ = this.transactionService.getPaginatedETxncCount(this.transactionService.getUserTransactionParams('needsReceipt'));
        
          const expensesCount$ = forkJoin({
            policyFlaggedCount$,
            manualFlaggedCount$,
            needReviewCount$,
            cannotReportCount$,
            needsReceiptCount$
          });
          expensesCount$.subscribe((res) => {
            this.needsAttentionStats['count'] = (res.policyFlaggedCount$['count'] || 0) + (res.manualFlaggedCount$['count'] || 0) + (res.needReviewCount$['count'] || 0) + (res.cannotReportCount$['count'] || 0);
          })
      } else {
        // need to implement later for others
      }
    }
  };

  getStats() {
    if (this.dashboardList && this.dashboardList[this.index]) {
      this.dashboardList[this.index].isLoading = true;
      var title = this.dashboardList[this.index].title.replace(' ', '_');

      var statsMap = {
        expenses: this.dashboardService.getreadyToReportStats(),
        reports: this.dashboardService.getreadyToReportStats(),
        trips: this.dashboardService.getreadyToReportStats(),
        advances: this.dashboardService.getreadyToReportStats(),
        corporate_cards: this.dashboardService.getreadyToReportStats() 
      }

      var stats$ = statsMap[title]

      stats$.subscribe((res) => {
        this.stats = res;
        this.getNeedAttentionCount(this.stats);
      })
    }
  }

  ngOnInit() {
    this.item = this.dashboardList[this.index];
    this.getHomeCurrency();
    this.getStats();
  }

}
