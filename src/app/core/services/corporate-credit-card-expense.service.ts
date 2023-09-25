import { Injectable } from '@angular/core';
import { Observable, Subject, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CardAggregateStats } from '../models/card-aggregate-stats.model';
import { CCCDetails } from '../models/ccc-expense-details.model';
import { CCCExpFlattened } from '../models/corporate-card-expense-flattened.model';
import { UniqueCardStats } from '../models/unique-cards-stats.model';
import { ApiV2Response } from '../models/v2/api-v2-response.model';
import { CorporateCardExpense } from '../models/v2/corporate-card-expense.model';
import { StatsResponse } from '../models/v2/stats-response.model';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { DataTransformService } from './data-transform.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformCorporateCard } from '../models/platform/platform-corporate-card.model';
import { CacheBuster, Cacheable } from 'ts-cacheable';
import { DataFeedSource } from '../enums/data-feed-source.enum';
import { CCCExpUnflattened } from '../models/corporate-card-expense-unflattened.model';
import { PlatformCorporateCardDetail } from '../models/platform-corporate-card-detail.model';
import { UniqueCards } from '../models/unique-cards.model';

type Config = Partial<{
  offset: number;
  queryParams: { state?: string; group_id?: string[] };
  limit: number;
  order?: string;
}>;

const cacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class CorporateCreditCardExpenseService {
  constructor(
    private apiService: ApiService,
    private apiV2Service: ApiV2Service,
    private dataTransformService: DataTransformService,
    private authService: AuthService,
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService,
  ) {}

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$,
  })
  clearCache(): Observable<void> {
    return of(null);
  }

  @Cacheable({
    cacheBusterObserver: cacheBuster$,
  })
  getCorporateCards(): Observable<PlatformCorporateCard[]> {
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformCorporateCard>>('/corporate_cards')
      .pipe(map((res) => res.data));
  }

  getBankFeedSources(): DataFeedSource[] {
    return [
      DataFeedSource.BANK_FEED_AMEX,
      DataFeedSource.BANK_FEED_CDF,
      DataFeedSource.BANK_FEED_VCF,
      DataFeedSource.BANK_FEED_S3DF,
      DataFeedSource.BANK_FEED_HAPPAY,
    ];
  }

  getv2CardTransactions(config: Config): Observable<ApiV2Response<CorporateCardExpense>> {
    return this.apiV2Service
      .get<CorporateCardExpense, { params: Config }>('/corporate_card_transactions', {
        params: {
          offset: config.offset,
          limit: config.limit,
          order: `${config.order || 'txn_dt.desc'},id.desc`,
          ...config.queryParams,
        },
      })
      .pipe(
        map(
          (res) =>
            res as {
              count: number;
              data: CorporateCardExpense[];
              limit: number;
              offset: number;
              url: string;
            },
        ),
      );
  }

  markPersonal(corporateCreditCardExpenseGroupId: string): Observable<null> {
    return this.apiService.post('/corporate_credit_card_expenses/' + corporateCreditCardExpenseGroupId + '/personal');
  }

  dismissCreditTransaction(corporateCreditCardExpenseId: string): Observable<null> {
    return this.apiService.post('/corporate_credit_card_expenses/' + corporateCreditCardExpenseId + '/ignore');
  }

  getEccceByGroupId(groupId: string): Observable<CCCExpUnflattened[]> {
    const data = {
      params: {
        group_id: groupId,
      },
    };

    return this.apiService
      .get<CCCExpFlattened[]>('/extended_corporate_credit_card_expenses', data)
      .pipe(map((res) => (res && res.length && res.map((elem) => this.dataTransformService.unflatten(elem))) || []));
  }

  constructInQueryParamStringForV2(params: string[]): string {
    // in.(IN_PROGRESS,SETTLED)
    let queryString = 'in.(';
    params.forEach(function (param) {
      queryString += param + ',';
    });
    queryString = queryString.slice(0, -1);
    queryString += ')';
    return queryString;
  }

  getPlatformCorporateCardDetails(
    cards: PlatformCorporateCard[],
    statsResponse: CardAggregateStats[]
  ): PlatformCorporateCardDetail[] {
    return cards.map((card: PlatformCorporateCard) => {
      const formattedCard: PlatformCorporateCardDetail = {
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

      statsResponse.forEach((stats) => {
        if (stats.key[1].column_value === card.card_number && stats.key[2].column_value === 'DRAFT') {
          formattedCard.stats.totalDraftTxns = stats.aggregates[0].function_value;
          formattedCard.stats.totalDraftValue = stats.aggregates[1].function_value;
        } else if (stats.key[1].column_value === card.card_number && stats.key[2].column_value === 'COMPLETE') {
          formattedCard.stats.totalCompleteTxns = stats.aggregates[0].function_value;
          formattedCard.stats.totalCompleteExpensesValue = stats.aggregates[1].function_value;
        }

        formattedCard.stats.totalTxnsCount = formattedCard.stats.totalDraftTxns + formattedCard.stats.totalCompleteTxns;
        formattedCard.stats.totalAmountValue =
          formattedCard.stats.totalDraftValue + formattedCard.stats.totalCompleteExpensesValue;
      });

      return formattedCard;
    });
  }

  getExpenseDetailsInCards(uniqueCards: UniqueCards[], statsResponse: CardAggregateStats[]): UniqueCardStats[] {
    const cardsCopy = JSON.parse(JSON.stringify(uniqueCards)) as UniqueCards[];
    const uniqueCardsCopy = [];
    cardsCopy?.forEach((card: UniqueCards) => {
      if (uniqueCardsCopy.filter((uniqueCard: UniqueCards) => uniqueCard.cardNumber === card.cardNumber).length === 0) {
        uniqueCardsCopy.push(card);
      }
    });
    uniqueCardsCopy.forEach((card: UniqueCardStats) => {
      card.totalDraftTxns = 0;
      card.totalDraftValue = 0;
      card.totalCompleteTxns = 0;
      card.totalCompleteExpensesValue = 0;
      statsResponse.forEach((stats) => {
        if (stats.key[1].column_value === card.cardNumber && stats.key[2].column_value === 'DRAFT') {
          card.totalDraftTxns = stats.aggregates[0].function_value;
          card.totalDraftValue = stats.aggregates[1].function_value;
        } else if (stats.key[1].column_value === card.cardNumber && stats.key[2].column_value === 'COMPLETE') {
          card.totalCompleteTxns = stats.aggregates[0].function_value;
          card.totalCompleteExpensesValue = stats.aggregates[1].function_value;
        }
        card.totalTxnsCount = card.totalDraftTxns + card.totalCompleteTxns;
        card.totalAmountValue = card.totalDraftValue + card.totalCompleteExpensesValue;
      });
    });
    return uniqueCardsCopy as UniqueCardStats[];
  }

  getAssignedCards(): Observable<CCCDetails> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.apiV2Service.getStats(
          '/expenses_and_ccce/stats?aggregates=count(tx_id),sum(tx_amount)&scalar=true&dimension_1_1=corporate_credit_card_bank_name,corporate_credit_card_account_number,tx_state&tx_state=' +
            this.constructInQueryParamStringForV2(['COMPLETE', 'DRAFT']) +
            '&corporate_credit_card_account_number=not.is.null&debit=is.true&tx_org_user_id=eq.' +
            eou.ou.id,
          {},
        ),
      ),
      map((statsResponse: StatsResponse) => {
        const stats = {
          totalTxns: 0,
          totalAmount: 0,
          cardDetails: statsResponse.data && statsResponse.data[1].value,
        };
        statsResponse.data[0].aggregates.forEach(function (aggregate) {
          if (aggregate.function_name === 'count(tx_id)') {
            stats.totalTxns = aggregate.function_value;
          }
          if (aggregate.function_name === 'sum(tx_amount)') {
            stats.totalAmount = aggregate.function_value;
          }
        });
        return stats;
      }),
    );
  }
}
