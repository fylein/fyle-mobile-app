import { Injectable } from '@angular/core';
import { RTFCardType } from '../enums/rtf-card-type.enum';

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
