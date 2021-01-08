import {Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import { MobileEventService } from 'src/app/core/services/mobile-event.service';
import { DashboardService } from 'src/app/fyle/dashboard/dashboard.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import {concat, forkJoin, from, Observable, Subject} from 'rxjs';
import {shareReplay, takeUntil} from 'rxjs/operators';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { PopoverController } from '@ionic/angular';
import { GetStartedPopupComponent } from './get-started-popup/get-started-popup.component';
import {NetworkService} from '../../core/services/network.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  dashboardList: { title: string, isVisible: boolean, isCollapsed: boolean, class: string, icon: string, subTitle: string }[];
  isDashboardCardExpanded: boolean;
  pageTitle: string;
  orgUserSettings$: Observable<any>;
  orgSettings$: Observable<any>;
  homeCurrency$: Observable<any>;
  isConnected$: Observable<boolean>;
  onPageExit = new Subject();

  constructor(
    private mobileEventService: MobileEventService,
    private dashboardService: DashboardService,
    private offlineService: OfflineService,
    private transactionService: TransactionService,
    private storageService: StorageService,
    private popoverController: PopoverController,
    private networkService: NetworkService
  ) { }

  ionViewWillLeave() {
    this.onPageExit.next();
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      takeUntil(this.onPageExit),
      shareReplay(1)
    );
  }

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
    forkJoin({
      orgUserSettings: this.orgUserSettings$,
      orgSettings: this.orgSettings$
    }).subscribe(res => {
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
        isVisible: !!(res.orgSettings.corporate_credit_card_settings.enabled),
        isCollapsed: false,
        class: 'corporate-cards',
        icon: 'fy-card',
        subTitle: 'Unmatched Expense'
      },
      {
        title: 'advances',
        isVisible: !!(res.orgSettings.advances.enabled || res.orgSettings.advance_requests.enabled),
        isCollapsed: false,
        class: 'advances',
        icon: 'fy-wallet',
        subTitle: 'Advance Request'
      },
      {
        title: 'trips',
        isVisible: !!(res.orgSettings.trip_requests.enabled
          && (!res.orgSettings.trip_requests.enable_for_certain_employee
            || (res.orgSettings.trip_requests.enable_for_certain_employee && res.orgUserSettings.trip_request_org_user_settings.enabled))),
        isCollapsed: false,
        class: 'trips',
        icon: 'fy-trips',
        subTitle: 'Trip Request'
      }];
    });

  }

  async showGetStartedPopup() {
    const getStartedPopup = await this.popoverController.create({
      component: GetStartedPopupComponent,
      cssClass: 'get-started-popup'
    });

    await getStartedPopup.present();

    const { data } = await getStartedPopup.onWillDismiss();
    await this.storageService.set('getStartedPopupShown', true);
  }

  ionViewWillEnter() {
    this.orgUserSettings$ = this.offlineService.getOrgUserSettings().pipe(
     shareReplay(),
    );
    this.orgSettings$ = this.offlineService.getOrgSettings().pipe(
      shareReplay(),
    );
    this.homeCurrency$ = this.offlineService.getHomeCurrency().pipe(
      shareReplay(),
    );

    forkJoin({
      isGetStartedPopupShown$: from(this.storageService.get('getStartedPopupShown')),
      totalCount$: this.transactionService.getPaginatedETxncCount()
    }).subscribe(res => {
      if (!res.isGetStartedPopupShown$ && res.totalCount$.count === 0) {
        this.showGetStartedPopup();
      }
    })

    this.dashboardList = [];
    this.reset();

    this.mobileEventService.onDashboardCardExpanded().subscribe(() => {
      this.dashboardCardExpanded();
    });
  }

  ngOnInit() {
  }
}
