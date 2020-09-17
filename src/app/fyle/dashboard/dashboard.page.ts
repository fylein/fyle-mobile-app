import { Component, OnInit } from '@angular/core';
import { EnterpriseDashboardCardComponent } from './enterprise-dashboard-card/enterprise-dashboard-card.component';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { MobileEventService } from 'src/app/core/services/mobile-event.service';
import { DashboardService } from 'src/app/fyle/dashboard/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  dashboardList: any[];
  isDashboardCardExpanded: boolean;
  pageTitle: string;

  constructor(
    private transactionService: TransactionService,
    private mobileEventService: MobileEventService,
    private dashboardService: DashboardService
  ) { 
    this.mobileEventService.onDashboardCardExpanded().subscribe(() => 
      this.dashboardCardExpanded()
    );
  }

  dashboardCardExpanded() {
    this.isDashboardCardExpanded = true;
    var expandedCard = this.dashboardList.filter(function (item) {
      return (!item.isCollapsed);
    });
    this.pageTitle = (expandedCard && expandedCard.length > 0) ? expandedCard[0].title + ' Overview' : this.pageTitle;
  }

  getExpenseStats() {
    return this.transactionService.getPaginatedETxncStats(this.transactionService.getUserTransactionParams('all'));
  };

  backButtonClick() {
    this.dashboardList = this.dashboardList.map(function (item) {
      item.isCollapsed = true;
    });
    this.dashboardService.setDashBoardState('default');
    this.ngOnInit();
  }

  ngOnInit() {
    this.isDashboardCardExpanded = false;
    this.pageTitle = 'dashboard';
  	this.dashboardList = [{
      title: 'expenses',
      isVisible: true,
      isCollapsed: false,
      class: 'expenses',
      icon: 'fy-receipts',
      subTitle: 'Expense',
    },
    {
      title: 'reports',
      isVisible: true,
      isCollapsed: false,
      class: 'reports',
      icon: 'fy-reports',
      subTitle: 'Report',
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
    }];
  }

}
