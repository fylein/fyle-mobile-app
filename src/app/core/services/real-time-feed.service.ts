import { Injectable } from '@angular/core';

// Move this to different file
enum RTFCardType {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  OTHERS = 'OTHERS',
}

@Injectable({
  providedIn: 'root',
})
export class RealTimeFeedService {
  isCardNumberValid(cardNumber: string): boolean {
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

  getCardType(cardNumber: string): RTFCardType {
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
