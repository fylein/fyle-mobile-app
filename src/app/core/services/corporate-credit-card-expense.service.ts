import { Injectable } from '@angular/core';
import { Observable, Subject, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CardAggregateStats } from '../models/card-aggregate-stats.model';
import { CCCDetails } from '../models/ccc-expense-details.model';
import { UniqueCardStats } from '../models/unique-cards-stats.model';
import { StatsResponse } from '../models/v2/stats-response.model';
import { ApiV2Service } from './api-v2.service';
import { AuthService } from './auth.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformCorporateCard } from '../models/platform/platform-corporate-card.model';
import { CacheBuster, Cacheable } from 'ts-cacheable';
import { DataFeedSource } from '../enums/data-feed-source.enum';
import { PlatformCorporateCardDetail } from '../models/platform-corporate-card-detail.model';
import { UniqueCards } from '../models/unique-cards.model';
import { CorporateCardTransactionRes } from '../models/platform/v1/corporate-card-transaction-res.model';
import { corporateCardTransaction } from '../models/platform/v1/cc-transaction.model';
import { MatchedCCCTransaction } from '../models/matchedCCCTransaction.model';
import { PlatformConfig } from '../models/platform/platform-config.model';

const cacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class CorporateCreditCardExpenseService {
  constructor(
    private apiV2Service: ApiV2Service,
    private authService: AuthService,
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService
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
      .get<PlatformApiResponse<PlatformCorporateCard[]>>('/corporate_cards')
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

  getCorporateCardTransactions(config: PlatformConfig): Observable<PlatformApiResponse<corporateCardTransaction[]>> {
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<corporateCardTransaction[]>>('/corporate_card_transactions', {
        params: {
          offset: config.offset,
          limit: config.limit,
          ...config.queryParams,
        },
      })
      .pipe(
        map(
          (res) =>
            res as {
              count: number;
              data: corporateCardTransaction[];
              offset: number;
            }
        )
      );
  }

  markPersonal(id: string): Observable<CorporateCardTransactionRes> {
    const payload = {
      id,
    };
    return this.spenderPlatformV1ApiService.post('/corporate_card_transactions/mark_personal', { data: payload });
  }

  dismissCreditTransaction(id: string): Observable<null> {
    const payload = {
      id,
    };
    return this.spenderPlatformV1ApiService.post('/corporate_card_transactions/ignore', { data: payload });
  }

  getMatchedTransactionById(id: string): Observable<CorporateCardTransactionRes> {
    const params = {
      id: 'eq.' + id,
    };
    return this.spenderPlatformV1ApiService.get('/corporate_card_transactions', { params });
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
          {}
        )
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
      })
    );
  }

  transformCCTransaction(ccTransaction: corporateCardTransaction): Partial<MatchedCCCTransaction> {
    const updatedCCTransaction = {
      id: ccTransaction.id,
      amount: ccTransaction.amount,
      card_or_account_number: ccTransaction.corporate_card?.card_number,
      created_at: ccTransaction.created_at,
      creator_id: ccTransaction.user_id,
      currency: ccTransaction.currency,
      description: ccTransaction.description,
      group_id: ccTransaction.id,
      orig_amount: ccTransaction.foreign_amount,
      orig_currency: ccTransaction.foreign_currency,
      txn_dt: ccTransaction.spent_at,
      updated_at: ccTransaction.updated_at,
      vendor: ccTransaction.merchant,
      corporate_credit_card_account_number: ccTransaction.corporate_card?.card_number,
      status: ccTransaction.transaction_status,
      nickname: ccTransaction.corporate_card?.nickname,
    };
    return updatedCCTransaction;
  }
}
