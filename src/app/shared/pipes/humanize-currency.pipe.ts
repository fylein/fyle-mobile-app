import { Pipe, PipeTransform } from '@angular/core';
import { getCurrencySymbol } from '@angular/common';

@Pipe({
  name: 'humanizeCurrency',
})
export class HumanizeCurrencyPipe implements PipeTransform {
  transform(value: number, currencyCode: string, fraction: number, skipSymbol = false, skipSign = false): any {
    const sign = value < 0 ? '-' : '';
    const amount = Math.abs(value) || 0;
    const si = ['', 'K', 'M', 'B', 't', 'q', 'Q', 's', 'S', 'o', 'n'];
    const exp = Math.max(0, Math.floor(Math.log(amount) / Math.log(1000)));
    const result = amount / Math.pow(1000, exp);
    let fixedResult;

    const currency = getCurrencySymbol(currencyCode, 'wide', 'en');
    if (currency) {
      const fractionSize = fraction;
      if (fractionSize) {
        fixedResult = result.toFixed(fraction);
      } else {
        // will implemnt later if no fraction passed
      }
      if (!skipSymbol) {
        fixedResult = currency + fixedResult;
      }
    }

    fixedResult = fixedResult + si[exp];
    if (skipSign) {
      return fixedResult;
    } else {
      return sign + fixedResult;
    }
  }
}
