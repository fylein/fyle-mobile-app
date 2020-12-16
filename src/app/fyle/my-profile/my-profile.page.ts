// TODO list: 
// Lite account

import { Component, OnInit } from '@angular/core';
import { forkJoin, from, noop, Observable, throwError, of } from 'rxjs';
import { concatMap, finalize, map, shareReplay, switchMap, take, catchError } from 'rxjs/operators';
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
import { OtpPopoverComponent } from './otp-popover/otp-popover.component';
import { Plugins } from '@capacitor/core';

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
  isMobileChanged: boolean;
  isMobileCountryCodeNotPresent: boolean;
  showInvalidMobileFormat: boolean;
  isApiCallInProgress = false;
  mobileNumber: string;
  org$: Observable<any>;

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
    private popoverController: PopoverController
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

  onMobileNumberChanged(eou) {
    this.isMobileChanged = true;
    if (this.mobileNumber && this.mobileNumber.charAt(0) !== '+') {
      this.isMobileCountryCodeNotPresent = true;
    } else {
      this.isMobileCountryCodeNotPresent = false;
    }

  }

  saveUserProfile(eou) {
    if (this.mobileNumber && this.mobileNumber.charAt(0) !== '+') {
      this.presentToast();
    } else {
      if (this.isMobileChanged) {
        eou.ou.mobile = this.mobileNumber;
      }
      forkJoin({
        userSettings: this.orgUserService.postUser(eou.us),
        orgUserSettings: this.orgUserService.postOrgUser(eou.ou)
      }).pipe(
        concatMap(() => {
          return this.authService.refreshEou().pipe(
            map(() => {
              this.isMobileChanged = false;
              this.loaderService.showLoader('Profile saved successfully', 1000);
              this.reset();
            })
          );
        })
      ).subscribe(noop);
    }
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Please enter a valid number with country code. eg. +1XXXXXXXXXX, +91XXXXXXXXXX',
      duration: 2000
    });
    toast.present();
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
    this.reset();
  }

  reset() {
    this.eou$ = from(this.authService.getEou());
    const orgUserSettings$ = this.offlineService.getOrgUserSettings().pipe(
      shareReplay()
    );
    this.myETxnc$ = this.transactionService.getAllMyETxnc().pipe(
      map(etxnc => this.setMyExpensesCountBySource(etxnc))
    );

    this.org$ = this.offlineService.getCurrentOrg();

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
      this.mobileNumber = res.eou.ou.mobile;
    });
  }

  openOtpPopover() {
    const that = this;
    that.eou$.pipe(
      switchMap(eou => {
        if (that.mobileNumber && that.mobileNumber.charAt(0) !== '+') {
          return throwError({
            type: 'plusMissingError'
          });
        } else {
          that.isApiCallInProgress = true;
          return that.orgUserService.verifyMobile();
        }
      }),
      switchMap((resp) => {
        return of(that.popoverController.create({
          componentProps: {
            phoneNumber: that.mobileNumber
          },
          component: OtpPopoverComponent,
          cssClass: 'dialog-popover'
        }).then(popOver => {
          return popOver.present();
        }));
      }),
      catchError((error) => {
        if (error.type === 'plusMissingError') {
          that.showInvalidMobileFormat = true;
          setTimeout(() => {
            that.showInvalidMobileFormat = false;
          }, 5000);
        } else {
          that.loaderService.showLoader(error.data.message, 2000);
        }
        return of(null);
      }),
      finalize(() => that.isApiCallInProgress = false)
    ).subscribe(() => {
      that.reset();
    })
  };

  openWebAppLink(location) {
    let link;
    if (location === 'app') {
      link = 'https://in1.fylehq.com/';
    } else if (location === 'whatsapp') {
      link = 'https://www.fylehq.com/help/en/articles/3432961-create-expense-using-whatsapp';
    } else if (location === 'sms') {
      link = 'https://www.fylehq.com/help/en/articles/3524059-create-expense-via-sms';
    }

    Browser.open({ toolbarColor: '#f36', url: link });

  };

  ngOnInit() {
  }

}
