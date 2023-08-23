import { Component, EventEmitter, Output } from '@angular/core';
import { NewCardDetail } from 'src/app/core/models/card-detail.model';
import { DashboardService } from '../dashboard.service';
import { Observable, finalize, forkJoin, map, shareReplay } from 'rxjs';
import { UniqueCardStats } from 'src/app/core/models/unique-cards-stats.model';
import { CardAggregateStats } from 'src/app/core/models/card-aggregate-stats.model';
import { cloneDeep } from 'lodash';
import { CardDetails } from 'src/app/core/models/card-details.model';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { getCurrencySymbol } from '@angular/common';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';

@Component({
  selector: 'app-card-stats',
  templateUrl: './card-stats.component.html',
  styleUrls: ['./card-stats.component.scss'],
})
export class CardStatsComponent {
  @Output() addCardClick = new EventEmitter<void>();

  cardDetails: NewCardDetail[];

  isCCCStatsLoading: boolean;

  homeCurrency$: Observable<string>;

  currencySymbol$: Observable<string>;

  isCCCEnabled: boolean;

  isVisaRTFEnabled: boolean;

  isMastercardRTFEnabled: boolean;

  isPersonalCardsEnabled: boolean;

  constructor(
    private dashboardService: DashboardService,
    private currencyService: CurrencyService,
    private orgSettingsService: OrgSettingsService,
    private orgUserSettingsService: OrgUserSettingsService,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService
  ) {}

  init(): void {
    this.cardDetails = [];

    this.homeCurrency$ = this.currencyService.getHomeCurrency().pipe(shareReplay(1));
    this.currencySymbol$ = this.homeCurrency$.pipe(
      map((homeCurrency: string) => getCurrencySymbol(homeCurrency, 'wide'))
    );

    forkJoin([this.orgSettingsService.get(), this.orgUserSettingsService.get()]).subscribe(
      ([orgSettings, orgUserSettings]) => {
        this.isCCCEnabled =
          orgSettings.corporate_credit_card_settings.allowed && orgSettings.corporate_credit_card_settings.enabled;

        this.isVisaRTFEnabled =
          orgSettings.visa_enrollment_settings.allowed && orgSettings.visa_enrollment_settings.enabled;

        this.isMastercardRTFEnabled =
          orgSettings.mastercard_enrollment_settings.allowed && orgSettings.mastercard_enrollment_settings.enabled;

        this.isPersonalCardsEnabled =
          orgSettings.org_personal_cards_settings.allowed &&
          orgSettings.org_personal_cards_settings.enabled &&
          orgUserSettings.personal_cards_settings.enabled;

        if (this.isCCCEnabled) {
          this.isCCCStatsLoading = true;
          this.initializeCCCStats();
        }
      }
    );
  }

  initializeCCCStats(): void {
    const corporateCards$ = this.corporateCreditCardExpenseService.getCorporateCards();
    const corporateCardStats$ = this.dashboardService
      .getCCCDetails()
      .pipe(map((details) => this.getCardDetail(details.cardDetails)));

    forkJoin([corporateCards$, corporateCardStats$])
      .pipe(finalize(() => (this.isCCCStatsLoading = false)))
      .subscribe(([corporateCards, corporateCardStats]) => {
        this.cardDetails = corporateCards.map((card) => {
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
            (cardStats) => cardStats.cardNumber === card.card_number && cardStats.cardName === card.bank_name
          );

          if (currentCardStats) {
            cardDetail.stats = {
              totalDraftTxns: currentCardStats.totalDraftTxns,
              totalDraftValue: currentCardStats.totalDraftValue,
              totalCompleteTxns: currentCardStats.totalCompleteTxns,
              totalCompleteExpensesValue: currentCardStats?.totalCompleteExpensesValue,
              totalTxnsCount: currentCardStats.totalTxnsCount,
              totalAmountValue: currentCardStats.totalAmountValue,
            };
          }

          return cardDetail;
        });
      });
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
