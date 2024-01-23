import { Injectable } from '@angular/core';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { AmexAccount } from '../models/amex-account.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AmexService {
  constructor(private spenderPlatformV1ApiService: SpenderPlatformV1ApiService) {}

  getAmexAccount(): Observable<AmexAccount> {
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<AmexAccount>>('/amex_account')
      .pipe(map((amexAccountResponse) => amexAccountResponse.data[0]));
  }
}
