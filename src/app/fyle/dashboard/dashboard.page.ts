import { Component, OnInit } from '@angular/core';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { Router } from '@angular/router';
import { EnterpriseDashboardCardComponent } from './enterprise-dashboard-card/enterprise-dashboard-card.component';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { MobileEventService } from 'src/app/core/services/mobile-event.service';
import { DashboardService } from 'src/app/fyle/dashboard/dashboard.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  dashboardList: { title: string, isVisible: boolean, isCollapsed: boolean, class: string, icon: string, subTitle: string }[];
  isDashboardCardExpanded: boolean;
  pageTitle: string;
  orgUserSettings: any;
  orgSettings: any;

  constructor(
    private userEventService: UserEventService,
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router,
    private transactionService: TransactionService,
    private mobileEventService: MobileEventService,
    private dashboardService: DashboardService,
    private offlineService: OfflineService,
  ) { }


  dashboardCardExpanded() {
    this.isDashboardCardExpanded = true;
    const expandedCard = this.dashboardList.filter((item) => {
      return (!item.isCollapsed);
    });
    this.pageTitle = (expandedCard && expandedCard.length > 0) ? expandedCard[0].title + ' Overview' : this.pageTitle;
  }

  backButtonClick() {
    this.dashboardList = this.dashboardList.map((item) => {
      item.isCollapsed = true;
      return item;
    });
    this.dashboardService.setDashBoardState('default');
    this.reset();
  }

  reset() {
    this.isDashboardCardExpanded = false;
    this.pageTitle = 'dashboard';
    this.dashboardList = [{
      title: 'expenses',
      isVisible: true,
      isCollapsed: false,
      class: 'expenses',
      icon: 'fy-receipts',
      subTitle: 'Expense'
    },
    {
      title: 'reports',
      isVisible: true,
      isCollapsed: false,
      class: 'reports',
      icon: 'fy-reports',
      subTitle: 'Report'
    },
    {
      title: 'corporate cards',
      isVisible: !!(this.orgSettings.corporate_credit_card_settings.enabled),
      isCollapsed: false,
      class: 'corporate-cards',
      icon: 'fy-card',
      subTitle: 'Unmatched Expense'
    },
    {
      title: 'advances',
      isVisible: !!(this.orgSettings.advances.enabled || this.orgSettings.advance_requests.enabled),
      isCollapsed: false,
      class: 'advances',
      icon: 'fy-wallet',
      subTitle: 'Advance Request'
    },
    {
      title: 'trips',
      isVisible: !!(this.orgSettings.trip_requests.enabled
        && (!this.orgSettings.trip_requests.enable_for_certain_employee
          || (this.orgSettings.trip_requests.enable_for_certain_employee && this.orgUserSettings.trip_request_org_user_settings.enabled))),
      isCollapsed: false,
      class: 'trips',
      icon: 'fy-trips',
      subTitle: 'Trip Request'
    }];
  }

  ionViewWillEnter() {
    const orgUserSettings$ = this.offlineService.getOrgUserSettings();
    const orgSettings$ = this.offlineService.getOrgSettings();

    const primaryData$ = forkJoin({
      orgUserSettings$,
      orgSettings$
    });

    primaryData$.subscribe((res) => {
      this.orgUserSettings = res.orgUserSettings$;
      this.orgSettings = res.orgSettings$;
      this.reset();
    });

    this.mobileEventService.onDashboardCardExpanded().subscribe(() => {
      this.dashboardCardExpanded();
    });
  }

  ngOnInit() {
  }
}
