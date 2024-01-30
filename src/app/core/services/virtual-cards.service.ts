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
  // getCardDetailsInBatches(virtualCardIds: string[]): any {
  //   const batchSize = 10;

  //   // Create an observable from the array of virtual card IDs
  //   const virtualCardIds$ = from(virtualCardIds);

  //   // Buffer the virtual card IDs into batches of size 'batchSize'
  //   const batches$ = virtualCardIds$.pipe(bufferCount(batchSize));

  //   // Use mergeMap to parallelize API calls within a batch
  //   return batches$.pipe(
  //     concatMap((batch) => zip(...batch.map((virtualCardId) => this.getCurrentAmountById(virtualCardId)))
  //     ),
  //     map(res => {
  //       console.log(res);
  //     })
  //   );
  // }
  getCardDetailsInBatches(virtualCardIds: string[]): any {
    const batchSize = 5;

    const virtualCardMap = {};

    // Create an observable from the array of virtual card IDs
    const virtualCardIds$ = from(virtualCardIds);

    // Buffer the virtual card IDs into batches of size 'batchSize'
    const batches$ = virtualCardIds$.pipe(bufferCount(batchSize));

    // Use concatMap to sequentially process each batch
    return batches$.pipe(
      concatMap((batch) =>
        zip(
          ...batch.map((virtualCardId) =>
            forkJoin(this.getCurrentAmountById(virtualCardId), this.getCardDetailsById(virtualCardId)).pipe(
              map(([currentAmount, cardDetails]) => {
                virtualCardMap[virtualCardId] = { current_amount: currentAmount, ...cardDetails };
              })
            )
          )
        )
      ),
      map(() => virtualCardMap)
    );
  }
  // getCardDetailsInBatches(virtualCardIds: string[]): Observable<any> {
  //   const batchSize = 10;

  //   // Create an observable from the array of virtual card IDs
  //   const virtualCardIds$ = from(virtualCardIds);

  //   // Buffer the virtual card IDs into batches of size 'batchSize'
  //   const batches$ = virtualCardIds$.pipe(bufferCount(batchSize));

  //   // Use concatMap to sequentially process each batch
  //   return batches$.pipe(
  //     concatMap((batch) =>
  //       // Use mergeMap to parallelize API calls within a batch
  //       from(batch).pipe(
  //         mergeMap((virtualCardId) =>
  //           // Make the API call for each virtual card ID
  //           this.getCardDetailsById(virtualCardId)
  //         ),
  //         // Collect the results into an array
  //         toArray(),
  //         // Combine the virtual card IDs with their corresponding results
  //         switchMap((cardDetailsArray) => {
  //           const result: any = {};
  //           batch.forEach((virtualCardId, index) => {
  //             result[virtualCardId] = cardDetailsArray[index];
  //           });
  //           return result;
  //         })
  //       )
  //     )
  //   );
  // }
  getCardDetailsFiltered(offset: number, limit: number, virtualCardIds: string[]): Observable<any> {
    const filteredVirtualCardIds = virtualCardIds.slice(offset, limit);
    return forkJoin(filteredVirtualCardIds.map((id) => this.getCardDetailsById(id)));
  }

  getVirtualCardsCount(): Observable<number> {
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<Record<string, string>>>('/virtual_cards')
      .pipe(map((response) => response.count));
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
