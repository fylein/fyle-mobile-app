import { Component, OnInit } from '@angular/core';
import { forkJoin, from, noop, Observable, throwError, of } from 'rxjs';
import {concatMap, finalize, map, shareReplay, switchMap, take, catchError, tap} from 'rxjs/operators';
import { ModalController, ToastController, PopoverController } from '@ionic/angular';

import { AuthService } from 'src/app/core/services/auth.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { OneClickActionService } from 'src/app/core/services/one-click-action.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { TransactionService } from 'src/app/core/services/transaction.service';

import { UserEventService } from 'src/app/core/services/user-event.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { DeviceService } from 'src/app/core/services/device.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { globalCacheBusterNotifier } from 'ts-cacheable';
import { SelectCurrencyComponent } from './select-currency/select-currency.component';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { Plugins } from '@capacitor/core';
import { TokenService } from 'src/app/core/services/token.service';
import {TrackingService} from '../../core/services/tracking.service';
import { environment } from 'src/environments/environment';
import { StatsOneDResponse } from 'src/app/core/models/stats-one-dimension.model';

const { Browser } = Plugins;

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.page.html',
  styleUrls: ['./my-profile.page.scss'],
})
export class MyProfilePage implements OnInit {
  orgUserSettings: any;
  expenses: any;
  toggleUsageDetailsTab: boolean;
  oneClickActionOptions: any[];
  oneClickActionSelectedModuleId: string;
  orgSettings: any;
  currencies$: Observable<any>;
  preferredCurrency$: Observable<any>;
  eou$: Observable<ExtendedOrgUser>;
  myETxnc$: Observable<{
    total: any;
    mobile: number;
    extension: number;
    outlook: number;
    email: number;
    web: number;
  }>;
  isApiCallInProgress = false;
  org$: Observable<any>;
  clusterDomain: string;
  saveProfileLoading = false;
  ROUTER_API_ENDPOINT: string;

  constructor(
    private authService: AuthService,
    private offlineService: OfflineService,
    private transactionService: TransactionService,
    private oneClickActionService: OneClickActionService,
    private currencyService: CurrencyService,
    private orgUserSettingsService: OrgUserSettingsService,
    private modalController: ModalController,
    private userEventService: UserEventService,
    private storageService: StorageService,
    private deviceService: DeviceService,
    private loaderService: LoaderService,
    private toastController: ToastController,
    private orgUserService: OrgUserService,
    private popoverController: PopoverController,
    private tokenService: TokenService,
    private trackingService: TrackingService
  ) { }

  logOut() {
    this.userEventService.logout();
    forkJoin({
      device: this.deviceService.getDeviceInfo(),
      eou: from(this.authService.getEou())
    }).pipe(
      switchMap(({ device, eou }) => {
        return this.authService.logout({
          device_id: device.uuid,
          user_id: eou.us.id
        });
      })
    ).subscribe(noop);

    this.storageService.clearAll();
    globalCacheBusterNotifier.next();
  }

  toggleUsageDetails() {
    this.toggleUsageDetailsTab = !this.toggleUsageDetailsTab;
  }

  saveUserProfile(eou) {
      this.saveProfileLoading = true;

      forkJoin({
        userSettings: this.orgUserService.postUser(eou.us),
        orgUserSettings: this.orgUserService.postOrgUser(eou.ou)
      }).pipe(
        concatMap(() => {
          return this.authService.refreshEou().pipe(
            tap(() => this.trackingService.activated({Asset: 'Mobile'})),
            map(() => {
              this.presentToast('Profile saved successfully', 1000);
              this.reset();
            })
          );
        }),
        finalize(() => {
          this.saveProfileLoading = false;
        })
      ).subscribe(noop);
  }

  async presentToast(message, duration) {
    const toast = await this.toastController.create({
      message,
      duration
    });
    toast.present();
  }

  setMyExpensesCountBySource(statsRes: StatsOneDResponse) {
    const totalCount = statsRes.getStatsTotalCount();

    return {
      total: totalCount,
      mobile: statsRes.getStatsCountBySource('MOBILE'),
      extension: statsRes.getStatsCountBySource('GMAIL'),
      outlook: statsRes.getStatsCountBySource('OUTLOOK'),
      email: statsRes.getStatsCountBySource('EMAIL'),
      web: statsRes.getStatsCountBySource('WEBAPP')
    };
  }

  toggleCurrencySettings() {
    from(this.loaderService.showLoader()).pipe(
      switchMap(() => this.orgUserSettingsService.post(this.orgUserSettings)),
      finalize(() => from(this.loaderService.hideLoader()))
    ).subscribe(() => {
      this.getPreferredCurrency();
    });
  }

  onSelectCurrency(currency) {
    this.orgUserSettings.currency_settings.preferred_currency = currency.shortCode || null;
    this.toggleCurrencySettings();
  }

  async openCurrenySelectionModal() {
    const modal = await this.modalController.create({
      component: SelectCurrencyComponent
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      this.onSelectCurrency(data.currency);
    }
  }

  toggleAutoExtraction() {
    return this.orgUserSettingsService.post(this.orgUserSettings)
      .pipe(
        map((res) => {
          if (this.orgUserSettings.insta_fyle_settings.enabled) {
            this.trackingService.onEnableInstaFyle({Asset: 'Mobile', persona: 'Enterprise'});
          } else {
            this.trackingService.onDisableInstaFyle({Asset: 'Mobile', persona: 'Enterprise'});
          }
        })
      )
      .subscribe(noop);
  }

  toggleBulkMode() {
    return this.orgUserSettingsService.post(this.orgUserSettings)
      .pipe(
        map((res) => {
          console.log(res);
          if (this.orgUserSettings.bulk_fyle_settings.enabled) {
            this.trackingService.onEnableBulkFyle({Asset: 'Mobile', persona: 'Enterprise'});
          } else {
            this.trackingService.onDisableBulkFyle({Asset: 'Mobile', persona: 'Enterprise'});
          }
        })
      )
      .subscribe(noop);
  }

  toggleSmsSettings() {
    return this.orgUserSettingsService.post(this.orgUserSettings)
      .pipe(
        map((res) => {
          console.log(res);
          // Todo: Tracking service and disable toogle button
        })
      )
      .subscribe(noop);
  }

  toggleOneClickActionMode() {
    this.orgUserSettings.one_click_action_settings.module = null;
    this.oneClickActionSelectedModuleId = '';
    return this.orgUserSettingsService.post(this.orgUserSettings)
      .pipe(
        map((res) => {
          console.log(res);
          // Todo: Tracking service and disable toogle button
        })
      )
      .subscribe(noop);
  }

  getOneClickActionSelectedModule(id: string) {
    const oneClickActionSelectedModule = this.oneClickActionService.filterByOneClickActionById(id);
    this.oneClickActionSelectedModuleId = oneClickActionSelectedModule.value;
  }

  ionViewWillEnter() {
    this.reset();
    from(this.tokenService.getClusterDomain()).subscribe(clusterDomain => {
      this.clusterDomain = clusterDomain;
    });

    this.ROUTER_API_ENDPOINT = environment.ROUTER_API_ENDPOINT;
  }

  reset() {
    this.eou$ = from(this.authService.getEou());
    const orgUserSettings$ = this.offlineService.getOrgUserSettings().pipe(
      shareReplay(1)
    );

    this.myETxnc$ = this.transactionService.getTransactionStats('count(tx_id)', {
      scalar: false,
      dimension_1_1: 'tx_source'
    }).pipe(
      map(statsRes => this.setMyExpensesCountBySource(new StatsOneDResponse(statsRes[0])))
    )

    this.org$ = this.offlineService.getCurrentOrg();

    this.getPreferredCurrency();

    const orgSettings$ = this.offlineService.getOrgSettings();
    this.currencies$ = this.currencyService.getAllCurrenciesInList();

    orgUserSettings$.pipe(
      map((res) => {
        const oneClickAction = res.one_click_action_settings.allowed &&
          res.one_click_action_settings.enabled &&
          res.one_click_action_settings.module;
        if (oneClickAction) {
          this.getOneClickActionSelectedModule(oneClickAction);
        }
      })
    ).subscribe(noop);

    from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return forkJoin({
          eou: this.eou$,
          orgUserSettings: orgUserSettings$,
          orgSettings: orgSettings$
        });
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    ).subscribe(async (res) => {
      this.orgUserSettings = res.orgUserSettings;
      this.orgSettings = res.orgSettings;
      this.oneClickActionOptions = this.oneClickActionService.getAllOneClickActionOptions();
    });
  }

  getPreferredCurrency() {
    this.preferredCurrency$ = this.offlineService.getOrgUserSettings().pipe(
      switchMap((orgUserSettings) => this.currencyService
        .getAllCurrenciesInList()
        .pipe(
          map(currencies => currencies
            .find(currency => currency.id === orgUserSettings.currency_settings.preferred_currency)
          ),
          map(preferedCurrencySettings => preferedCurrencySettings && (preferedCurrencySettings.id + ' - ' + preferedCurrencySettings.value))
        )
      )
    );
  }

  openWebAppLink(location) {
    let link;

    if (location === 'app') {
      link = this.ROUTER_API_ENDPOINT;
    } else if (location === 'sms') {
      link = 'https://www.fylehq.com/help/en/articles/3524059-create-expense-via-sms';
    }

    Browser.open({ toolbarColor: '#f36', url: link });
  }

  ngOnInit() {
  }
}
