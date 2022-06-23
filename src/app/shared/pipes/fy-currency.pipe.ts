import { CurrencyPipe, getCurrencySymbol } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fyCurrency',
})
export class FyCurrencyPipe implements PipeTransform {
  constructor(private currencyPipe: CurrencyPipe) {}

  transform(amount: number, currencyCode: string, skipSymbol?: boolean, fraction?: number): string {
    if (!currencyCode) {
      return amount?.toString();
    }

    let symbol = skipSymbol ? '' : getCurrencySymbol(currencyCode, 'narrow');
    if (currencyCode === symbol) {
      // Adding a space for more readability when the symbol is same as the currency code
      symbol += ' ';
    }

    // Setting min and max number of digits for the decimal point
    const digitsInfo = fraction && `1.${fraction}-${fraction}`;

    return this.currencyPipe.transform(amount, currencyCode, symbol, digitsInfo);
  }
}
