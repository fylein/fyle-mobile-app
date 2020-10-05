// TODO list: 
// Lite account
// Contact no verfication
// Notification popup

import { Component, OnInit } from '@angular/core';
import { forkJoin, from, noop } from 'rxjs';
import { finalize, map, shareReplay, switchMap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';

import { AuthService } from 'src/app/core/services/auth.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { OneClickActionService } from 'src/app/core/services/one-click-action.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import {ExtendedOrgUser} from '/Users/tarun/git/fyle-mobile-app2/src/app/core/models/extended-org-user.model';

import { SelectCurrencyComponent } from 'src/app/post-verification/setup-account/select-currency/select-currency.component';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { DeviceService } from 'src/app/core/services/device.service';
import { LoaderService } from 'src/app/core/services/loader.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.page.html',
  styleUrls: ['./my-profile.page.scss'],
})
export class MyProfilePage implements OnInit {
  eou: ExtendedOrgUser;
  orgUserSettings: any;
  expenses: any;
  toggleUsageDetailsTab: boolean;
  oneClickActionOptions: any[];
  oneClickActionSelectedModuleId: string;
  orgSettings: any;
  currencies: any;
  preferredCurrency: any;

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
    this.deviceService.getDeviceInfo().pipe(
      switchMap((device) => {
        return this.authService.logout({
          device_id: device.uuid,
          user_id: this.eou.us.id
        });
      })
    ).subscribe(noop);
    this.storageService.clearAll();
    // Todo: Clear all cache
  }

  toggleUsageDetails() {
    this.toggleUsageDetailsTab = !this.toggleUsageDetailsTab;
  }

  setMyExpensesCountBySource(myETxnc) {
    this.expenses = {
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
      this.preferredCurrency = this.currencies.find(currency => currency.id === data.currency.shortCode);
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
    this.oneClickActionSelectedModuleId = oneClickActionSelectedModule.id;
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

  getAllCurrencyAndMatchPreferredCurrency() {
    this.currencyService.getAllCurrenciesInList().pipe(
      map((res) => {
        this.currencies = res;
        this.preferredCurrency = this.currencies.find(currency => currency.id === this.orgUserSettings.currency_settings.preferred_currency);
      })
    ).subscribe(noop);
  }

  ionViewWillEnter() {
    const eou$ = this.authService.getEou();
    const orgUserSettings$ =  this.offlineService.getOrgUserSettings().pipe(
      shareReplay()
    );
    const myETxnc$ = this.transactionService.getAllMyETxnc();
    const orgSettings$ = this.offlineService.getOrgSettings();

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
          eou: eou$,
          orgUserSettings: orgUserSettings$,
          myETxnc: myETxnc$,
          orgSettings: orgSettings$
        });
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    ).subscribe(async (res) => {
      this.eou = res.eou;
      this.orgUserSettings = res.orgUserSettings;
      const myETxnc = res.myETxnc;
      this.orgSettings = res.orgSettings;
      this.setMyExpensesCountBySource(myETxnc);
      this.oneClickActionOptions = this.oneClickActionService.getAllOneClickActionOptions();
      if (this.orgSettings.org_currency_settings.enabled) {
        this.getAllCurrencyAndMatchPreferredCurrency();
      }
    });
  }

  ngOnInit() {
  }

}
