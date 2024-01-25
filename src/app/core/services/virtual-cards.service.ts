import { Injectable } from '@angular/core';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { Observable, map } from 'rxjs';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';

@Injectable({
  providedIn: 'root',
})
export class VirtualCardsService {
  constructor(private spenderPlatformV1ApiService: SpenderPlatformV1ApiService) {}

  getCardDetailsById(virtualCardId: string): Observable<Record<string, string>> {
    const params = {
      data: {
        id: virtualCardId,
      },
    };
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<Record<string, string>>>('/virtual_cards/show_card_details', params)
      .pipe(map((response) => response.data[0]));
  }

  getCurrentAmountById(virtualCardId: string): Observable<Record<string, string>> {
    const params = {
      data: {
        id: virtualCardId,
      },
    };
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<Record<string, string>>>('/virtual_cards/get_current_amount', params)
      .pipe(map((response) => response.data[0]));
  }
}
