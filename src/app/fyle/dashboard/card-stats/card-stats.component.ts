import { Component, EventEmitter, OnInit } from '@angular/core';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { DashboardService } from '../dashboard.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { BehaviorSubject, Observable, concat, forkJoin, map, shareReplay, switchMap } from 'rxjs';
import { getCurrencySymbol } from '@angular/common';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { PlatformCorporateCardDetail } from 'src/app/core/models/platform-corporate-card-detail.model';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { PopoverController } from '@ionic/angular';
import { AddCorporateCardComponent } from '../../manage-corporate-cards/add-corporate-card/add-corporate-card.component';
import { OverlayResponse } from 'src/app/core/models/overlay-response.modal';
import { CardAddedComponent } from '../../manage-corporate-cards/card-added/card-added.component';
import { NetworkService } from 'src/app/core/services/network.service';

@Component({
  selector: 'app-card-stats',
  templateUrl: './card-stats.component.html',
  styleUrls: ['./card-stats.component.scss'],
})
export class CardStatsComponent implements OnInit {
  cardDetails$: Observable<PlatformCorporateCardDetail[]>;

  homeCurrency$: Observable<string>;

  currencySymbol$: Observable<string>;

  isCCCEnabled$: Observable<boolean>;

  isVisaRTFEnabled$: Observable<boolean>;

  isMastercardRTFEnabled$: Observable<boolean>;

  isYodleeEnabled$: Observable<boolean>;

  canAddCorporateCards$: Observable<boolean>;

  isConnected$: Observable<boolean>;

  loadCardDetails$ = new BehaviorSubject<void>(null);

  constructor(
    private currencyService: CurrencyService,
    private dashboardService: DashboardService,
    private orgSettingsService: OrgSettingsService,
    private networkService: NetworkService,
    private orgUserSettingsService: OrgUserSettingsService,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private popoverController: PopoverController
  ) {}

  ngOnInit(): void {
    this.setupNetworkWatcher();
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      shareReplay(1)
    );
  }

  init(): void {
    this.homeCurrency$ = this.currencyService.getHomeCurrency();

    this.currencySymbol$ = this.homeCurrency$.pipe(map((homeCurrency) => getCurrencySymbol(homeCurrency, 'wide')));

    const orgSettings$ = this.orgSettingsService.get();
    const orgUserSettings$ = this.orgUserSettingsService.get();

    this.isCCCEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          orgSettings.corporate_credit_card_settings.allowed && orgSettings.corporate_credit_card_settings.enabled
      )
    );

    this.isVisaRTFEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.visa_enrollment_settings.allowed && orgSettings.visa_enrollment_settings.enabled)
    );

    this.isMastercardRTFEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          orgSettings.mastercard_enrollment_settings.allowed && orgSettings.mastercard_enrollment_settings.enabled
      )
    );

    this.isYodleeEnabled$ = forkJoin([orgSettings$, orgUserSettings$]).pipe(
      map(
        ([orgSettings, orgUserSettings]) =>
          orgSettings.bank_data_aggregation_settings.allowed &&
          orgSettings.bank_data_aggregation_settings.enabled &&
          orgUserSettings.bank_data_aggregation_settings.enabled
      )
    );

    this.canAddCorporateCards$ = forkJoin([this.isVisaRTFEnabled$, this.isMastercardRTFEnabled$]).pipe(
      map(([isVisaRTFEnabled, isMastercardRTFEnabled]) => isVisaRTFEnabled || isMastercardRTFEnabled)
    );

    this.cardDetails$ = this.loadCardDetails$.pipe(
      switchMap(() =>
        forkJoin([
          this.corporateCreditCardExpenseService.getCorporateCards(),
          this.dashboardService.getCCCDetails().pipe(map((details) => details.cardDetails)),
        ]).pipe(
          map(([corporateCards, corporateCardStats]) =>
            this.corporateCreditCardExpenseService.getExpenseDetailsInCardsPlatform(corporateCards, corporateCardStats)
          )
        )
      )
    );
  }

  openAddCorporateCardPopover(): void {
    forkJoin([this.isVisaRTFEnabled$, this.isMastercardRTFEnabled$, this.isYodleeEnabled$]).subscribe(
      async ([isVisaRTFEnabled, isMastercardRTFEnabled, isYodleeEnabled]) => {
        const addCorporateCardPopover = await this.popoverController.create({
          component: AddCorporateCardComponent,
          cssClass: 'fy-dialog-popover',
          componentProps: {
            isVisaRTFEnabled,
            isMastercardRTFEnabled,
            isYodleeEnabled,
          },
        });

        await addCorporateCardPopover.present();
        const popoverResponse = (await addCorporateCardPopover.onDidDismiss()) as OverlayResponse<{ success: boolean }>;

        if (popoverResponse.data?.success) {
          this.handleEnrollmentSuccess();
        }
      }
    );
  }

  private handleEnrollmentSuccess(): void {
    this.corporateCreditCardExpenseService.clearCache().subscribe(async () => {
      this.loadCardDetails$.next();

      const cardAddedModal = await this.popoverController.create({
        component: CardAddedComponent,
        cssClass: 'pop-up-in-center',
      });
      await cardAddedModal.present();
    });
  }
}
