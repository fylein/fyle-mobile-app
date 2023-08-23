import { Component, OnInit } from '@angular/core';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { DashboardService } from '../dashboard.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { CardDetail } from 'src/app/core/models/card-detail.model';
import { Observable, map } from 'rxjs';
import { getCurrencySymbol } from '@angular/common';
import { CardAggregateStats } from 'src/app/core/models/card-aggregate-stats.model';
import { UniqueCardStats } from 'src/app/core/models/unique-cards-stats.model';
import { CardDetails } from 'src/app/core/models/card-details.model';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-card-stats',
  templateUrl: './card-stats.component.html',
  styleUrls: ['./card-stats.component.scss'],
})
export class CardStatsComponent implements OnInit {
  cardTransactionsAndDetails$: Observable<CardDetail[]>;

  homeCurrency$: Observable<string>;

  currencySymbol$: Observable<string>;

  isVisaRTFEnabled$: Observable<boolean>;

  isMastercardRTFEnabled$: Observable<boolean>;

  constructor(
    private currencyService: CurrencyService,
    private dashboardService: DashboardService,
    private orgSettingsService: OrgSettingsService
  ) {}

  ngOnInit(): void {
    this.homeCurrency$ = this.currencyService.getHomeCurrency();
    this.currencySymbol$ = this.homeCurrency$.pipe(map((homeCurrency) => getCurrencySymbol(homeCurrency, 'wide')));

    const orgSettings$ = this.orgSettingsService.get();

    this.isVisaRTFEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.visa_enrollment_settings.allowed && orgSettings.visa_enrollment_settings.enabled)
    );
    this.isMastercardRTFEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          orgSettings.mastercard_enrollment_settings.allowed && orgSettings.mastercard_enrollment_settings.enabled
      )
    );

    this.cardTransactionsAndDetails$ = this.dashboardService
      .getCCCDetails()
      .pipe(map((details) => this.getCardDetail(details.cardDetails)));
  }

  getCardDetail(statsResponses: CardAggregateStats[]): UniqueCardStats[] {
    const cardNames: CardDetails[] = [];
    statsResponses.forEach((response) => {
      const cardDetail = {
        cardNumber: response.key[1].column_value,
        cardName: response.key[0].column_value,
      };
      cardNames.push(cardDetail);
    });
    const uniqueCards = cloneDeep(cardNames);

    return this.dashboardService.getExpenseDetailsInCards(uniqueCards, statsResponses);
  }
}
