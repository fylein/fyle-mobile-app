import { Injectable } from '@angular/core';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import {
  Observable,
  bufferCount,
  concatMap,
  forkJoin,
  from,
  map,
  mergeMap,
  range,
  switchMap,
  toArray,
  zip,
} from 'rxjs';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { CardDetailsResponse } from '../models/card-details-response.model';

@Injectable({
  providedIn: 'root',
})
export class VirtualCardsService {
  constructor(private spenderPlatformV1ApiService: SpenderPlatformV1ApiService) {}

  getCardDetailsById(virtualCardId: string): Observable<CardDetailsResponse> {
    const params = {
      data: {
        id: virtualCardId,
      },
    };
    return this.spenderPlatformV1ApiService
      .post<Record<string, CardDetailsResponse>>('/virtual_cards/show_card_details', params)
      .pipe(map((response) => response.data));
  }

  getCardDetailsInBatches(virtualCardIds: string[]): Observable<Record<string, CardDetailsResponse>> {
    const batchSize = 5;

    const virtualCardMap: Record<string, CardDetailsResponse> = {};

    const virtualCardIds$ = from(virtualCardIds);

    const batches$ = virtualCardIds$.pipe(bufferCount(batchSize));

    return batches$.pipe(
      concatMap((batch) =>
        zip(
          ...batch.map((virtualCardId) =>
            this.getCardDetailsById(virtualCardId).pipe(
              map((cardDetails) => {
                virtualCardMap[virtualCardId] = cardDetails;
              })
            )
          )
        )
      ),
      map(() => virtualCardMap)
    );
  }

  getCurrentAmountById(virtualCardId: string): Observable<number> {
    const params = {
      data: {
        id: virtualCardId,
      },
    };
    return this.spenderPlatformV1ApiService
      .post<Record<string, Record<string, number>>>('/virtual_cards/get_current_amount', params)
      .pipe(map((response) => response.data.current_amount));
  }
}
