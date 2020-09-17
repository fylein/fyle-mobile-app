import { Component, OnInit } from '@angular/core';
import { EnterpriseDashboardCardComponent } from './enterprise-dashboard-card/enterprise-dashboard-card.component';
import { TransactionService } from 'src/app/core/services/transaction.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  dashboardList: any[];

  constructor(
    private transactionService: TransactionService
  ) { }

  getExpenseStats() {
    debugger;
    return this.transactionService.getPaginatedETxncStats(this.transactionService.getUserTransactionParams('all'));
  };



  ngOnInit() {
  	this.dashboardList = [{
      title: 'expenses',
      isVisible: true,
      isCollapsed: false,
      class: 'expenses',
      icon: 'fy-receipts',
      subTitle: 'Expense',
      statsActionFn: this.getExpenseStats
    },
    {
      title: 'reports',
      isVisible: true,
      isCollapsed: false,
      class: 'reports',
      icon: 'fy-reports',
      subTitle: 'Report',
      statsActionFn: this.getExpenseStats
      // statsActionFn: vm.getReportStats,
      // needsAttentionFn: vm.getReportNeedAttentionStats
    },
    {
      title: 'corporate cards',
      isVisible: true,
      //isVisible: !!(vm.settings.corporate_credit_card_settings.enabled),
      isCollapsed: false,
      class: 'corporate-cards',
      icon: 'fy-card',
      subTitle: 'Unmatched Expense',
      statsActionFn: this.getExpenseStats
     // statsActionFn: vm.getCorporateCardStats
    },
    {
      title: 'advances',
      isVisible: true,
      //isVisible: !!(vm.settings.advances.enabled || vm.settings.advance_requests.enabled),
      isCollapsed: false,
      class: 'advances',
      icon: 'fy-wallet',
      subTitle: 'Advance Request',
      statsActionFn: this.getExpenseStats
      // statsActionFn: vm.getAdvanceStats,
      // needsAttentionFn: vm.getAdvanceNeedAttentionStats
    },
    {
      title: 'trips',
      isVisible: true,
      //isVisible: !!(vm.settings.trip_requests.enabled && (!vm.settings.trip_requests.enable_for_certain_employee || (vm.settings.trip_requests.enable_for_certain_employee && vm.orgUserSettings.trip_request_org_user_settings.enabled))),
      isCollapsed: false,
      class: 'trips',
      icon: 'fy-trips',
      subTitle: 'Trip Request',
      statsActionFn: this.getExpenseStats
      // statsActionFn: vm.getTripStats,
      // needsAttentionFn: vm.getTripNeedAttentionStats
    }];
  }

}
