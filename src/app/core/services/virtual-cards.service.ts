import { Injectable } from '@angular/core';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { Observable, concatMap, forkJoin, from, map } from 'rxjs';
import { VirtualCardsRequest } from '../models/virtual-cards-request.model';
import { CardDetailsResponse } from '../models/card-details-response.model';
import { CardDetailsAmountResponse } from '../models/card-details-amount-response';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { VirtualCard } from '../models/virtual-card.model';
import { virtualCardCurrentAmountResponse } from '../mock-data/virtual-card-details-response.data';
import { CardDetailsResponseWithNickName } from '../models/card-details-response-with-nickname.model';

@Injectable({
  providedIn: 'root',
})
export class VirtualCardsService {
  constructor(private spenderPlatformV1ApiService: SpenderPlatformV1ApiService) {}

  getCardDetailsById(virtualCardRequestPayload: VirtualCardsRequest): Observable<CardDetailsResponse> {
    return this.spenderPlatformV1ApiService
      .post<{
        data: CardDetailsResponse;
      }>('/virtual_cards/show_card_details', {
        data: virtualCardRequestPayload,
      })
      .pipe(
        map((response) => {
          const cardDetailsResponse = response.data;
          cardDetailsResponse.expiry_date = new Date(cardDetailsResponse.expiry_date);
          return cardDetailsResponse;
        })
      );
  }

  getCardDetailsInSerial(virtualCardIds: string[]): Observable<Record<string, CardDetailsResponseWithNickName>> {
    const virtualCardMap: Record<string, CardDetailsResponseWithNickName> = {};

    const virtualCardIds$ = from(virtualCardIds);

    return virtualCardIds$.pipe(
      concatMap((virtualCardId) =>
        forkJoin([this.getCardDetailsById({ id: virtualCardId }), this.getVirtualCardById({ id: virtualCardId })]).pipe(
          map(([cardDetails, virtualCard]) => {
            virtualCardMap[virtualCardId] = cardDetails;
            virtualCardMap[virtualCardId].nick_name = virtualCard.nick_name;
            return virtualCardMap;
          })
        )
      )
    );
  }

  getCardDetailsAndAmountInSerial(
    virtualCardIds: string[]
  ): Observable<Record<string, CardDetailsResponseWithNickName>> {
    const virtualCardMap: Record<string, CardDetailsResponseWithNickName> = {};

    const virtualCardIds$ = from(virtualCardIds);

    return virtualCardIds$.pipe(
      concatMap((virtualCardId) =>
        forkJoin([
          this.getCardDetailsById({ id: virtualCardId }),
          this.getCurrentAmountById({ id: virtualCardId }),
          this.getVirtualCardById({ id: virtualCardId }),
        ]).pipe(
          map(([cardDetails, currentAmount, virtualCardResponse]) => {
            virtualCardMap[virtualCardId] = {
              ...cardDetails,
              ...currentAmount,
              nick_name: virtualCardResponse.nick_name,
            };
            return virtualCardMap;
          })
        )
      )
    );
  }

  getCurrentAmountById(virtualCardRequestPayload: VirtualCardsRequest): Observable<CardDetailsAmountResponse> {
    return this.spenderPlatformV1ApiService
      .post<{
        data: CardDetailsAmountResponse;
      }>('/virtual_cards/get_current_amount', {
        data: virtualCardRequestPayload,
      })
      .pipe(map((response) => response.data));
  }

  getVirtualCardById(virtualCardRequestPayload: VirtualCardsRequest): Observable<VirtualCard> {
    const data = {
      params: {
        id: 'eq.' + virtualCardRequestPayload.id,
      },
    };
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<VirtualCard>>('/virtual_cards', data)
      .pipe(map((response) => response.data[0]));
  }
}
