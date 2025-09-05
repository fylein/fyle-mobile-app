import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map, Observable } from 'rxjs';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformMerchant } from '../models/platform/platform-merchants.model';

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  private spenderPlatformV1ApiService = inject(SpenderPlatformV1ApiService);

  ROOT_ENDPOINT: string;

  constructor() {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
  }

  setRoot(rootUrl: string): void {
    this.ROOT_ENDPOINT = rootUrl;
  }

  getMerchants(searchString: string): Observable<PlatformMerchant[]> {
    const data = {
      params: {
        q: searchString,
        limit: 4, // Retrieving only 4 merchants while searching - retaining public API behaviour
      },
    };

    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformMerchant[]>>('/merchants', data)
      .pipe(map((response: PlatformApiResponse<PlatformMerchant[]>) => response.data));
  }
}
