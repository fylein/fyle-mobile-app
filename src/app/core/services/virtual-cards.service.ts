import { Injectable } from '@angular/core';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { Observable, map } from 'rxjs';
import { VirtualCardsRequest } from '../models/virtual-cards-request.model';
import { CardDetailsAmountResponse, CardDetailsResponse } from '../models/card-details-response.model';

@Injectable({
  providedIn: 'root',
})
export class VirtualCardsService {
  constructor(private spenderPlatformV1ApiService: SpenderPlatformV1ApiService) {}

  getCardDetailsById(virtualCardRequestPayload: VirtualCardsRequest): Observable<CardDetailsResponse> {
    return this.spenderPlatformV1ApiService
      .post<Record<string, CardDetailsResponse>>('/virtual_cards/show_card_details', {
        data: virtualCardRequestPayload,
      })
      .pipe(map((response) => {
        const cardDetailsResponse = response.data;
        cardDetailsResponse.expiry_date = new Date(cardDetailsResponse.expiry_date);
        return cardDetailsResponse;
      }));
  }

  getCurrentAmountById(virtualCardRequestPayload: VirtualCardsRequest): Observable<number> {
    return this.spenderPlatformV1ApiService
      .post<Record<string, CardDetailsAmountResponse>>('/virtual_cards/get_current_amount', {
        data: virtualCardRequestPayload,
      })
      .pipe(map((response) => response.data.current_amount));
  }
}
