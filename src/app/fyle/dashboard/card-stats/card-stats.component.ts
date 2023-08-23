import { Component } from '@angular/core';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { DashboardService } from '../dashboard.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { Observable, forkJoin, map } from 'rxjs';
import { getCurrencySymbol } from '@angular/common';
import { CardAggregateStats } from 'src/app/core/models/card-aggregate-stats.model';
import { UniqueCardStats } from 'src/app/core/models/unique-cards-stats.model';
import { CardDetails } from 'src/app/core/models/card-details.model';
import { cloneDeep } from 'lodash';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { NewCardDetail } from 'src/app/core/models/new-card-detail.model';

@Component({
  selector: 'app-card-stats',
  templateUrl: './card-stats.component.html',
  styleUrls: ['./card-stats.component.scss'],
})
export class CardStatsComponent {
  cardTransactionsAndDetails$: Observable<NewCardDetail[]>;

  homeCurrency$: Observable<string>;

  currencySymbol$: Observable<string>;

  isCCCEnabled$: Observable<boolean>;

  canAddCorporateCards$: Observable<boolean>;

  constructor(
    private currencyService: CurrencyService,
    private dashboardService: DashboardService,
    private orgSettingsService: OrgSettingsService,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService
  ) {}

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

    this.cardTransactionsAndDetails$ = forkJoin([
      this.corporateCreditCardExpenseService.getCorporateCards(),
      this.dashboardService.getCCCDetails().pipe(map((details) => this.getCardDetail(details.cardDetails))),
    ]).pipe(
      map(([corporateCards, corporateCardStats]) => {
        const formattedCorporateCards = corporateCards.map((card) => {
          const cardDetail: NewCardDetail = {
            card,
            stats: {
              totalDraftTxns: 0,
              totalDraftValue: 0,
              totalCompleteTxns: 0,
              totalCompleteExpensesValue: 0,
              totalTxnsCount: 0,
              totalAmountValue: 0,
            },
          };

          const currentCardStats = corporateCardStats.find(
            (stats) => stats.cardNumber === card.card_number && stats.cardName && card.bank_name
          );

          if (currentCardStats) {
            cardDetail.stats = {
              totalDraftTxns: currentCardStats.totalDraftTxns,
              totalDraftValue: currentCardStats.totalDraftValue,
              totalCompleteTxns: currentCardStats.totalCompleteTxns,
              totalCompleteExpensesValue: currentCardStats.totalCompleteExpensesValue,
              totalTxnsCount: currentCardStats.totalTxnsCount,
              totalAmountValue: currentCardStats.totalAmountValue,
            };
          }

          return cardDetail;
        });

        return formattedCorporateCards;
      })
    );
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
