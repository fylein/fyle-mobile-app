import { Component, EventEmitter, OnInit } from '@angular/core';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { DashboardService } from '../dashboard.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { Observable, concat, forkJoin, map, shareReplay } from 'rxjs';
import { getCurrencySymbol } from '@angular/common';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { PlatformCorporateCardDetail } from 'src/app/core/models/platform-corporate-card-detail.model';
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

  canAddCorporateCards$: Observable<boolean>;

  isConnected$: Observable<boolean>;

  constructor(
    private currencyService: CurrencyService,
    private dashboardService: DashboardService,
    private orgSettingsService: OrgSettingsService,
    private networkService: NetworkService,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService
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

    const isVisaRTFEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.visa_enrollment_settings.allowed && orgSettings.visa_enrollment_settings.enabled)
    );

    const isMastercardRTFEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          orgSettings.mastercard_enrollment_settings.allowed && orgSettings.mastercard_enrollment_settings.enabled
      )
    );

    this.canAddCorporateCards$ = forkJoin([isVisaRTFEnabled$, isMastercardRTFEnabled$]).pipe(
      map(([isVisaRTFEnabled, isMastercardRTFEnabled]) => isVisaRTFEnabled || isMastercardRTFEnabled)
    );

    this.isCCCEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          orgSettings.corporate_credit_card_settings.allowed && orgSettings.corporate_credit_card_settings.enabled
      )
    );

    this.cardDetails$ = forkJoin([
      this.corporateCreditCardExpenseService.getCorporateCards(),
      this.dashboardService.getCCCDetails().pipe(map((details) => details.cardDetails)),
    ]).pipe(
      map(([corporateCards, corporateCardStats]) =>
        this.corporateCreditCardExpenseService.getExpenseDetailsInCardsPlatform(corporateCards, corporateCardStats)
      )
    );
  }
}
