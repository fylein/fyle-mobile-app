import { Injectable } from '@angular/core';
import { CardNetworkType } from '../enums/card-network-type';

@Injectable({
  providedIn: 'root',
})
export class RealTimeFeedService {
  getCardType(cardNumber: string): CardNetworkType {
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
}
