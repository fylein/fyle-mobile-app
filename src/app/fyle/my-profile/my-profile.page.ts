// TODO list: 
// Lite account
// Contact no verfication

import { Component, OnInit } from '@angular/core';
import { forkJoin, from, noop, Observable } from 'rxjs';
import { finalize, map, shareReplay, switchMap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';

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
  }>

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
    private loaderService: LoaderService
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

  setMyExpensesCountBySource(myETxnc) {
    return {
      total: myETxnc.length,
      mobile: this.transactionService.getCountBySource(myETxnc, 'MOBILE'),
      extension: this.transactionService.getCountBySource(myETxnc, 'GMAIL'),
      outlook: this.transactionService.getCountBySource(myETxnc, 'OUTLOOK'),
      email: this.transactionService.getCountBySource(myETxnc, 'EMAIL'),
      web: this.transactionService.getCountBySource(myETxnc, 'WEBAPP')
    };
  }

  toggleCurrencySettings() {
    return this.orgUserSettingsService.post(this.orgUserSettings)
      .pipe(
        map((res) => {
          console.log(res);
        })
      )
      .subscribe();
  }

  onSelectCurrency(currency) {
    this.orgUserSettings.currency_settings.preferred_currency = currency.shortCode || null;
    this.toggleCurrencySettings();
  }

  async openCurrenySelectionModal(event) {
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
          console.log(res);
          // Todo: Tracking service and disable toogle button
        })
      )
      .subscribe(noop);
  }

  toggleBulkMode() {
    return this.orgUserSettingsService.post(this.orgUserSettings)
      .pipe(
        map((res) => {
          console.log(res);
          // Todo: Tracking service and disable toogle button
        })
      )
      .subscribe(noop);
  }

  toggleWhatsappSettings() {
    return this.orgUserSettingsService.post(this.orgUserSettings)
      .pipe(
        map((res) => {
          console.log(res);
          // Todo: Tracking service and disable toogle button
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

  oneClickActionModuleChanged() {
    // One click action module value changed
    console.log(this.oneClickActionSelectedModuleId);
    this.orgUserSettings.one_click_action_settings.module = this.oneClickActionSelectedModuleId;
    return this.orgUserSettingsService.post(this.orgUserSettings)
      .pipe(
        map((res) => {
          console.log(res);
          // Todo: Tracking service and disable toogle button
        })
      )
      .subscribe(noop);
  }

  ionViewWillEnter() {
    this.eou$ = from(this.authService.getEou());
    const orgUserSettings$ = this.offlineService.getOrgUserSettings().pipe(
      shareReplay()
    );
    this.myETxnc$ = this.transactionService.getAllMyETxnc().pipe(
      map(etxnc => this.setMyExpensesCountBySource(etxnc))
    );

    this.preferredCurrency$ = orgUserSettings$.pipe(
      switchMap((orgUserSettings) => {
        return this.currencyService.getAllCurrenciesInList().pipe(map(currencies => currencies.find(currency => currency.id === orgUserSettings.currency_settings.preferred_currency)));
      })
    )

    const orgSettings$ = this.offlineService.getOrgSettings();
    this.currencies$ = this.currencyService.getAllCurrenciesInList();

    orgUserSettings$.pipe(
      map((res) => {
        const oneClickAction = res.one_click_action_settings.allowed && res.one_click_action_settings.enabled && res.one_click_action_settings.module;
        if (oneClickAction) {
          this.getOneClickActionSelectedModule(oneClickAction);
        }
      })
    ).subscribe();

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

  ngOnInit() {
  }

}
