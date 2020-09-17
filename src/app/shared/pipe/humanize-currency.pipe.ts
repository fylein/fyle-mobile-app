import { Pipe, PipeTransform } from '@angular/core';
import { getCurrencySymbol } from '@angular/common';

@Pipe({
  name: 'humanizeCurrency'
})
export class HumanizeCurrencyPipe implements PipeTransform {

  transform (amount: number, currencyCode: string, fraction: number): any {
    var sign = amount < 0 ? '-':'';
    var amount = Math.abs(amount) || 0;
    var si = ['', 'K', 'M', 'G', 'T', 'P', 'H'];
    var exp = Math.max(0, Math.floor(Math.log(amount) / Math.log(1000)));
    var result = amount / Math.pow(1000, exp);
    var fixedResult;

    var currency = getCurrencySymbol(currencyCode, 'wide' , 'en');
    if (currency) {
      var fractionSize = fraction;
      if (fractionSize) {
        fixedResult = result.toFixed(fraction);
      } else {
         // will implemnt later if no fraction passed
      }
      fixedResult = currency + fixedResult;
    }

    fixedResult = fixedResult + si[exp];
    return sign + fixedResult;
  }

}
