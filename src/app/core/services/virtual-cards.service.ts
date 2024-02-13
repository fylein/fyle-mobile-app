import { Injectable } from '@angular/core';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { Observable, concatMap, forkJoin, from, map, reduce } from 'rxjs';
import { VirtualCardsRequest } from '../models/virtual-cards-request.model';
import { CardDetailsResponse } from '../models/card-details-response.model';
import { CardDetailsAmountResponse } from '../models/card-details-amount-response';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { VirtualCard } from '../models/virtual-card.model';
import { CardDetailsResponseWithNickName } from '../models/card-details-response-with-nickname.model';
import { VirtualCardsSerialRequest } from '../models/virtual-cards-serial-request.model';

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

  getCardDetails(
    virtualCardId: string,
    includeCurrentAmount?: boolean
  ): Observable<{
    cardDetails: CardDetailsResponse;
    virtualCard: VirtualCard;
    currentAmount?: CardDetailsAmountResponse;
  }> {
    const requestParam: VirtualCardsRequest = { id: virtualCardId };
    let virtualCardRequests$ = {
      cardDetails: this.getCardDetailsById(requestParam),
      virtualCard: this.getVirtualCardById(requestParam),
    };
    if (includeCurrentAmount) {
      virtualCardRequests$['currentAmount'] = this.getCurrentAmountById(requestParam);
    }
    return forkJoin(virtualCardRequests$);
  }

  getCardDetailsInSerial(
    virtualCardsSerialRequestParams: VirtualCardsSerialRequest
  ): Observable<Record<string, CardDetailsResponseWithNickName>> {
    return from(virtualCardsSerialRequestParams.virtualCardIds).pipe(
      concatMap((virtualCardId) => {
        return this.getCardDetails(virtualCardId, virtualCardsSerialRequestParams.includeCurrentAmount);
      }),
      map(({ cardDetails, virtualCard, currentAmount }) => ({
        cardDetails,
        virtualCard,
        currentAmount,
      })),
      reduce((acc: Record<string, CardDetailsResponseWithNickName>, value) => {
        const { cardDetails, virtualCard, currentAmount } = value;
        acc[virtualCard.id] = {
          ...cardDetails,
          ...currentAmount,
          nick_name: virtualCard.nick_name,
        };
        return acc;
      }, [])
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
