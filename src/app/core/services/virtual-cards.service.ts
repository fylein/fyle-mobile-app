import { Injectable } from '@angular/core';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { Observable, map } from 'rxjs';
import { VirtualCardsRequest } from '../models/virtual-cards-request.model';
import { CardDetailsResponse } from '../models/card-details-response.model';
import { CardDetailsAmountResponse } from '../models/card-details-amount-response';

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
      .pipe(map((response) => response.data));
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
}
