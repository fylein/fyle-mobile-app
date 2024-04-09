import { Injectable } from '@angular/core';
import { PlatformCorporateCard } from '../models/platform/platform-corporate-card.model';
import { PlatformApiPayload } from '../models/platform/platform-api-payload.model';
import { EnrollCardPayload } from '../models/platform/enroll-card-payload.model';
import { Observable, catchError, map, throwError } from 'rxjs';
import { EnrollCardResponse } from '../models/platform/enroll-card-response.model';
import { HttpErrorResponse } from '@angular/common/http';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformApiError } from '../models/platform/platform-api-error.model';
import { UnenrollCardPayload } from '../models/platform/unenroll-card-payload.model';
import { CardNetworkType } from '../enums/card-network-type';

@Injectable({
  providedIn: 'root',
})
export class RealTimeFeedService {
  constructor(private spenderPlatformV1ApiService: SpenderPlatformV1ApiService) {}

  isCardNumberValid(cardNumber: string): boolean {
    if (!cardNumber) {
      return false;
    }

    let checksum = 0;

    /**
     * Luhn's algorithm to check validity of credit card number:
     * https://www.creditcardvalidator.org/articles/luhn-algorithm
     * 1. Starting from last but one digit, double the alternate number. Keep the other digits as is.
     * (for example, for a 16 digit credit card number, double 15th, 13th, 11th, and so on digits)
     * 2. If the doubled number is greater than 9, subtract it by 9.
     * 3. Sum up the all the digits (ones that were doubled as well as those which were not).
     * 4. Divide the resultant value by 10.
     * 5. If the remainder is 0, then the card number is considered valid. Otherwise, invalid.
     */
    let isSecondDigit = false;
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i), 10);
      /**
       * If value after multiplication by 2 is greater than 9, we need to subtract the value by 9.
       * Using modulus instead as it is generic (we need not check if value > 9) and equivalent
       * to subtraction in this particular case.
       */
      digit = isSecondDigit ? digit * 2 : digit;
      if (digit > 9) {
        digit -= 9;
      }
      checksum += digit;
      isSecondDigit = !isSecondDigit;
    }

    return checksum % 10 === 0;
  }

  unenroll(card: PlatformCorporateCard): Observable<void> {
    const cardToUnenroll: PlatformApiPayload<UnenrollCardPayload> = {
      data: {
        id: card.id,
      },
    };

    const cardType = this.getCardType(card);
    let endpoint: string;

    switch (cardType) {
      case CardNetworkType.VISA:
        endpoint = '/corporate_cards/visa_unenroll';
        break;

      case CardNetworkType.MASTERCARD:
        endpoint = '/corporate_cards/mastercard_unenroll';
        break;

      default:
        throw new Error(`Invalid card type ${cardType}`);
    }

    return this.spenderPlatformV1ApiService.post<void>(endpoint, cardToUnenroll);
  }

  enroll(cardNumber: string, cardId?: string): Observable<PlatformCorporateCard> {
    const card: PlatformApiPayload<EnrollCardPayload> = {
      data: {
        card_number: cardNumber,
      },
    };

    if (cardId) {
      card.data.id = cardId;
    }

    const cardType = this.getCardTypeFromNumber(cardNumber);
    let endpoint: string;

    switch (cardType) {
      case CardNetworkType.VISA:
        endpoint = '/corporate_cards/visa_enroll';
        break;

      case CardNetworkType.MASTERCARD:
        endpoint = '/corporate_cards/mastercard_enroll';
        break;

      default:
        throw new Error(`Invalid card type ${cardType}`);
    }

    return this.spenderPlatformV1ApiService.post<EnrollCardResponse>(endpoint, card).pipe(
      map((res) => res.data),
      catchError((err: HttpErrorResponse) => {
        const error = err.error as PlatformApiError;
        return throwError(() => Error(error.message));
      })
    );
  }

  getCardTypeFromNumber(cardNumber: string): CardNetworkType {
    if (!cardNumber) {
      return null;
    }

    const firstDigit = cardNumber.charAt(0);

    switch (firstDigit) {
      case '4':
        return CardNetworkType.VISA;
      case '5':
        return CardNetworkType.MASTERCARD;
      default:
        return CardNetworkType.OTHERS;
    }
  }

  getCardType(card: PlatformCorporateCard): CardNetworkType {
    if (card.is_mastercard_enrolled) {
      return CardNetworkType.MASTERCARD;
    }

    if (card.is_visa_enrolled) {
      return CardNetworkType.VISA;
    }

    return CardNetworkType.OTHERS;
  }
}
