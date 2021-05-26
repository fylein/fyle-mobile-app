import { Component, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { OfflineService } from 'src/app/core/services/offline.service';
import { concat, forkJoin, from, Observable, Subject } from 'rxjs';
import { filter, shareReplay, takeUntil } from 'rxjs/operators';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { PopoverController } from '@ionic/angular';
import { GetStartedPopupComponent } from './get-started-popup/get-started-popup.component';
import { NetworkService } from '../../core/services/network.service';
import { OrgUserSettings } from 'src/app/core/models/org_user_settings.model';
import { StatsComponent } from './stats/stats.component';
import { ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FooterState } from '../../shared/components/footer/footer-state';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  orgUserSettings$: Observable<OrgUserSettings>;
  orgSettings$: Observable<any>;
  homeCurrency$: Observable<any>;
  isConnected$: Observable<boolean>;
  onPageExit$ = new Subject();

  @ViewChild(StatsComponent) statsComponent: StatsComponent;

  constructor(
    private offlineService: OfflineService,
    private transactionService: TransactionService,
    private storageService: StorageService,
    private popoverController: PopoverController,
    private networkService: NetworkService,
    private actionSheetController: ActionSheetController,
    private router: Router
  ) { }

  ionViewWillLeave() {
    this.onPageExit$.next();
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      takeUntil(this.onPageExit$),
      shareReplay(1)
    );
  }

  async showGetStartedPopup() {
    const getStartedPopup = await this.popoverController.create({
      component: GetStartedPopupComponent,
      cssClass: 'get-started-popup'
    });

    await getStartedPopup.present();
    await getStartedPopup.onWillDismiss();

    await this.storageService.set('getStartedPopupShown', true);
  }

  ionViewWillEnter() {
    this.orgUserSettings$ = this.offlineService.getOrgUserSettings().pipe(
     shareReplay(1),
    );
    this.orgSettings$ = this.offlineService.getOrgSettings().pipe(
      shareReplay(1),
    );
    this.homeCurrency$ = this.offlineService.getHomeCurrency().pipe(
      shareReplay(1),
    );

    this.statsComponent.init();

    forkJoin({
      isGetStartedPopupShown: from(this.storageService.get('getStartedPopupShown')),
      totalCount: this.transactionService.getPaginatedETxncCount()
    }).pipe(
      filter(({isGetStartedPopupShown, totalCount}) => !isGetStartedPopupShown && totalCount.count === 0)
    ).subscribe(_ => this.showGetStartedPopup());
  }

  ngOnInit() {
  }

  get FooterState() {
    return FooterState;
  }

  onTaskClicked() {
    this.router.navigate(['/', 'enterprise', 'tasks']);
  }

  onCameraClicked() {
    this.router.navigate(['/', 'enterprise', 'camera_overlay']);
  }
}
