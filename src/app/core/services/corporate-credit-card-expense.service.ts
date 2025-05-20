import { Injectable } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CardTransactionStat } from '../models/card-transaction-stat.model';
import { CCCDetails } from '../models/ccc-expense-details.model';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformCorporateCard } from '../models/platform/platform-corporate-card.model';
import { CacheBuster, Cacheable } from 'ts-cacheable';
import { DataFeedSource } from '../enums/data-feed-source.enum';
import { PlatformCorporateCardDetail } from '../models/platform-corporate-card-detail.model';
import { CorporateCardTransactionRes } from '../models/platform/v1/corporate-card-transaction-res.model';
import { corporateCardTransaction } from '../models/platform/v1/cc-transaction.model';
import { MatchedCCCTransaction } from '../models/matchedCCCTransaction.model';
import { PlatformConfig } from '../models/platform/platform-config.model';

const cacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class CorporateCreditCardExpenseService {
  constructor(private spenderPlatformV1ApiService: SpenderPlatformV1ApiService) {}

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
    cardDetails: CCCDetails[]
  ): PlatformCorporateCardDetail[] {
    return cards.map((card: PlatformCorporateCard) => {
      const formattedCard: PlatformCorporateCardDetail = {
        card,
        stats: {
          totalTxnsCount: 0,
          totalDraftTxns: 0,
          totalDraftAmount: 0,
          totalCompleteTxns: 0,
          totalCompleteExpensesAmount: 0,
        },
      };

      const matchingCardDetail = cardDetails.find((detail) => detail.corporate_card_id === card.id);

      if (matchingCardDetail) {
        formattedCard.stats.totalDraftTxns = matchingCardDetail.DRAFT.count;
        formattedCard.stats.totalDraftAmount = matchingCardDetail.DRAFT.total_amount;

        formattedCard.stats.totalCompleteTxns = matchingCardDetail.COMPLETE.count;
        formattedCard.stats.totalCompleteExpensesAmount = matchingCardDetail.COMPLETE.total_amount;
      }
      formattedCard.stats.totalTxnsCount += formattedCard.stats.totalDraftTxns + formattedCard.stats.totalCompleteTxns;

      return formattedCard;
    });
  }

  getAssignedCards(): Observable<CCCDetails[]> {
    const config = {
      data: {
        query_params:
          'or=(matched_expenses.cs.[{"state":"DRAFT"}],matched_expenses.cs.[{"state":"COMPLETE"}])&amount=gt.0',
      },
    };

    return this.spenderPlatformV1ApiService
      .post('/corporate_card_transactions/expenses/stats', config)
      .pipe(map((cardStats: PlatformApiResponse<CardTransactionStat[]>) => this.transformCardData(cardStats.data)));
  }

  /**
   * Transforms card data from the new API response format
   * to match the structure expected by the frontend
   */
  private transformCardData(cardData: CardTransactionStat[]): CCCDetails[] {
    return Object.values(
      cardData.reduce((cardMap, { corporate_card_id, bank_name, card_number, state, count, total_amount }) => {
        if (!cardMap[corporate_card_id]) {
          cardMap[corporate_card_id] = {
            bank_name,
            card_number,
            corporate_card_id,
            DRAFT: { count: 0, total_amount: 0 },
            COMPLETE: { count: 0, total_amount: 0 },
          };
        }

        if (state in cardMap[corporate_card_id]) {
          cardMap[corporate_card_id][state] = { count, total_amount };
        }

        return cardMap;
      }, {} as Record<string, CCCDetails>)
    );
  }
}
