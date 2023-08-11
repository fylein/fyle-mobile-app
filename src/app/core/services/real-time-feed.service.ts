import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

import { PlatformCorporateCard } from '../models/platform/platform-corporate-card.model';
import { PlatformApiPayload } from '../models/platform/platform-api-payload.model';
import { EnrollCardPayload } from '../models/platform/enroll-card-payload.model';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { EnrollCardResponse } from '../models/platform/enroll-card-response.model';
import { RTFCardType } from '../enums/rtf-card-type.enum';
import { PlatformApiError } from '../models/platform/platform-api-error.model';

@Injectable({
  providedIn: 'root',
})
export class RealTimeFeedService {
  getCardType(cardNumber: string): RTFCardType {
    if (!cardNumber) {
      return null;
    }

    const firstDigit = cardNumber.charAt(0);

    switch (firstDigit) {
      case '4':
        return RTFCardType.VISA;
      case '5':
        return RTFCardType.MASTERCARD;
      default:
        return RTFCardType.OTHERS;
    }
  }
}
